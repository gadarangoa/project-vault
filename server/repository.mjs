import { db } from './db.mjs'

const project = (row) => ({ id: row.id, name: row.name, description: row.description, createdAt: row.created_at, updatedAt: row.updated_at })
const tag = (row) => ({ id: row.id, projectId: row.project_id, name: row.name, color: row.color })
const secret = (row) => ({ id: row.id, projectId: row.project_id, name: row.name, type: row.type, key: row.key, value: row.value, username: row.username, email: row.email, password: row.password, notes: row.notes, createdAt: row.created_at, updatedAt: row.updated_at, tags: [] })
const variable = (row) => ({ id: row.id, groupId: row.group_id, key: row.key, value: row.value, position: row.position })
const variableGroup = (row, variables = []) => ({ id: row.id, projectId: row.project_id, name: row.name, description: row.description, createdAt: row.created_at, updatedAt: row.updated_at, variables })
const note = (row) => ({ id: row.id, projectId: row.project_id, title: row.title, contentJson: JSON.parse(row.content_json), contentMarkdown: row.content_markdown, pinned: Boolean(row.pinned), createdAt: row.created_at, updatedAt: row.updated_at, tags: [] })
const checklistItem = (row) => ({ id: row.id, taskId: row.task_id, title: row.title, completed: Boolean(row.completed), completedAt: row.completed_at, position: row.position, createdAt: row.created_at, updatedAt: row.updated_at })
const task = (row) => ({ id: row.id, projectId: row.project_id, title: row.title, description: row.description, type: row.type || 'task', status: row.status, priority: row.priority, createdAt: row.created_at, updatedAt: row.updated_at, completedAt: row.completed_at || null, tags: [], checklistItems: [] })
const focusSession = (row) => ({ id: row.id, projectId: row.project_id, taskId: row.task_id, plannedSeconds: row.planned_seconds, actualSeconds: row.actual_seconds, startedAt: row.started_at, completedAt: row.completed_at })
const achievement = (row) => ({ id: row.id, projectId: row.project_id, achievementKey: row.achievement_key, unlockedAt: row.unlocked_at })

const insertId = (result) => Number(result.lastInsertRowid)

function attachTags(projectId, secrets) {
  const tags = db.prepare('SELECT * FROM tags WHERE project_id = ? ORDER BY name').all(projectId).map(tag)
  const links = db.prepare(`SELECT st.secret_id, st.tag_id FROM secret_tags st JOIN secrets s ON s.id = st.secret_id WHERE s.project_id = ?`).all(projectId)
  const byId = new Map(tags.map((item) => [item.id, item]))
  for (const item of secrets) item.tags = links.filter((link) => link.secret_id === item.id).map((link) => byId.get(link.tag_id)).filter(Boolean)
  return secrets
}

export function listProjects() {
  return db.prepare('SELECT * FROM projects ORDER BY updated_at DESC, id DESC').all().map(project)
}

export function getProject(id) {
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id)
  return row ? project(row) : null
}

export function createProject({ name, description = '' }) {
  const result = db.prepare('INSERT INTO projects (name, description) VALUES (?, ?)').run(name, description)
  return getProject(insertId(result))
}

export function updateProject(id, { name, description = '' }) {
  db.prepare("UPDATE projects SET name = ?, description = ?, updated_at = datetime('now') WHERE id = ?").run(name, description, id)
}

export function deleteProject(id) {
  db.prepare('DELETE FROM projects WHERE id = ?').run(id)
}

export function listSecrets(projectId) {
  const rows = db.prepare('SELECT * FROM secrets WHERE project_id = ? ORDER BY updated_at DESC, id DESC').all(projectId).map(secret)
  return attachTags(projectId, rows)
}

export function createSecret(input) {
  const result = db.prepare(`INSERT INTO secrets (project_id, name, type, key, value, username, email, password, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(input.projectId, input.name, input.type, input.key, input.value, input.username, input.email, input.password, input.notes)
  setSecretTags(insertId(result), input.tagIds || [])
  return listSecrets(input.projectId).find((item) => item.id === insertId(result))
}

export function updateSecret(id, input) {
  db.prepare(`UPDATE secrets SET name = ?, type = ?, key = ?, value = ?, username = ?, email = ?, password = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`).run(input.name, input.type, input.key, input.value, input.username, input.email, input.password, input.notes, id)
  setSecretTags(id, input.tagIds || [])
}

export function deleteSecret(id) {
  db.prepare('DELETE FROM secrets WHERE id = ?').run(id)
}

export function listTags(projectId) {
  return db.prepare('SELECT * FROM tags WHERE project_id = ? ORDER BY name').all(projectId).map(tag)
}

export function createTag(projectId, { name, color = 'default' }) {
  const result = db.prepare('INSERT INTO tags (project_id, name, color) VALUES (?, ?, ?)').run(projectId, name, color)
  return tag(db.prepare('SELECT * FROM tags WHERE id = ?').get(insertId(result)))
}

export function updateTag(id, { name, color }) {
  db.prepare('UPDATE tags SET name = ?, color = ? WHERE id = ?').run(name, color, id)
}

export function deleteTag(id) {
  db.prepare('DELETE FROM tags WHERE id = ?').run(id)
}

function getVariableGroup(id) {
  const row = db.prepare('SELECT * FROM variable_groups WHERE id = ?').get(id)
  if (!row) return null
  const variables = db.prepare('SELECT * FROM variable_group_variables WHERE group_id = ? ORDER BY position, id').all(id).map(variable)
  return variableGroup(row, variables)
}

function validVariables(variables = []) {
  const result = []
  const keys = new Set()
  for (const item of variables) {
    const key = String(item.key || '').trim()
    if (!key && !String(item.value || '')) continue
    if (!key) throw new Error('Cada variable debe tener una clave')
    if (keys.has(key)) throw new Error(`La clave «${key}» está repetida`)
    keys.add(key)
    result.push({ key, value: String(item.value || '') })
  }
  return result
}

function saveVariables(groupId, variables) {
  db.prepare('DELETE FROM variable_group_variables WHERE group_id = ?').run(groupId)
  const insert = db.prepare('INSERT INTO variable_group_variables (group_id, key, value, position) VALUES (?, ?, ?, ?)')
  variables.forEach((item, position) => insert.run(groupId, item.key, item.value, position))
}

export function listVariableGroups(projectId) {
  return db.prepare('SELECT * FROM variable_groups WHERE project_id = ? ORDER BY updated_at DESC, id DESC').all(projectId).map((row) => getVariableGroup(row.id))
}

export function createVariableGroup(input) {
  const variables = validVariables(input.variables)
  const result = db.prepare('INSERT INTO variable_groups (project_id, name, description) VALUES (?, ?, ?)').run(input.projectId, String(input.name || '').trim(), String(input.description || '').trim())
  const id = insertId(result)
  saveVariables(id, variables)
  return getVariableGroup(id)
}

export function updateVariableGroup(id, input) {
  const variables = validVariables(input.variables)
  db.exec('BEGIN')
  try {
    db.prepare("UPDATE variable_groups SET name = ?, description = ?, updated_at = datetime('now') WHERE id = ?").run(String(input.name || '').trim(), String(input.description || '').trim(), id)
    saveVariables(id, variables)
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

export function duplicateVariableGroup(id) {
  const original = getVariableGroup(id)
  if (!original) return null
  return createVariableGroup({ projectId: original.projectId, name: `${original.name} copia`, description: original.description, variables: original.variables })
}

export function deleteVariableGroup(id) {
  db.prepare('DELETE FROM variable_groups WHERE id = ?').run(id)
}

function attachNoteTags(projectId, notes) {
  const tags = db.prepare('SELECT * FROM tags WHERE project_id = ? ORDER BY name').all(projectId).map(tag)
  const links = db.prepare('SELECT nt.note_id, nt.tag_id FROM note_tags nt JOIN notes n ON n.id = nt.note_id WHERE n.project_id = ?').all(projectId)
  const byId = new Map(tags.map((item) => [item.id, item]))
  for (const item of notes) item.tags = links.filter((link) => link.note_id === item.id).map((link) => byId.get(link.tag_id)).filter(Boolean)
  return notes
}

export function listNotes(projectId) {
  const rows = db.prepare('SELECT * FROM notes WHERE project_id = ? ORDER BY pinned DESC, updated_at DESC, id DESC').all(projectId).map(note)
  return attachNoteTags(projectId, rows)
}

export function getNote(id) {
  const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(id)
  if (!row) return null
  return attachNoteTags(row.project_id, [note(row)])[0]
}

function setNoteTags(noteId, tagIds) {
  db.prepare('DELETE FROM note_tags WHERE note_id = ?').run(noteId)
  const insert = db.prepare('INSERT INTO note_tags (note_id, tag_id) SELECT ?, id FROM tags WHERE id = ?')
  for (const tagId of tagIds || []) insert.run(noteId, tagId)
}

function notePayload(input) {
  const contentJson = typeof input.contentJson === 'string' ? JSON.parse(input.contentJson) : input.contentJson
  return {
    title: String(input.title ?? '').trim(),
    contentJson: JSON.stringify(contentJson || { type: 'doc', content: [{ type: 'paragraph' }] }),
    contentMarkdown: String(input.contentMarkdown || ''),
    pinned: input.pinned ? 1 : 0,
    tagIds: Array.isArray(input.tagIds) ? input.tagIds.map(Number).filter(Number.isInteger) : [],
  }
}

export function createNote(input) {
  const payload = notePayload(input)
  const result = db.prepare('INSERT INTO notes (project_id, title, content_json, content_markdown, pinned) VALUES (?, ?, ?, ?, ?)').run(input.projectId, payload.title, payload.contentJson, payload.contentMarkdown, payload.pinned)
  const id = insertId(result)
  setNoteTags(id, payload.tagIds)
  return getNote(id)
}

export function updateNote(id, input) {
  const payload = notePayload(input)
  db.prepare('UPDATE notes SET title = ?, content_json = ?, content_markdown = ?, pinned = ?, updated_at = datetime(\'now\') WHERE id = ?').run(payload.title, payload.contentJson, payload.contentMarkdown, payload.pinned, id)
  setNoteTags(id, payload.tagIds)
  return getNote(id)
}

export function toggleNotePin(id) {
  db.prepare('UPDATE notes SET pinned = CASE pinned WHEN 1 THEN 0 ELSE 1 END, updated_at = datetime(\'now\') WHERE id = ?').run(id)
  return getNote(id)
}

export function deleteNote(id) {
  db.prepare('DELETE FROM notes WHERE id = ?').run(id)
}

function attachTaskTags(projectId, tasks) {
  const tags = db.prepare('SELECT * FROM tags WHERE project_id = ? ORDER BY name').all(projectId).map(tag)
  const links = db.prepare('SELECT tt.task_id, tt.tag_id FROM task_tags tt JOIN tasks t ON t.id = tt.task_id WHERE t.project_id = ?').all(projectId)
  const byId = new Map(tags.map((item) => [item.id, item]))
  for (const item of tasks) item.tags = links.filter((link) => link.task_id === item.id).map((link) => byId.get(link.tag_id)).filter(Boolean)
  const checklist = db.prepare('SELECT * FROM task_checklist_items WHERE task_id IN (SELECT id FROM tasks WHERE project_id = ?) ORDER BY position, id').all(projectId).map(checklistItem)
  for (const item of tasks) item.checklistItems = checklist.filter((check) => check.taskId === item.id)
  return tasks
}

function getTask(id) {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
  return row ? attachTaskTags(row.project_id, [task(row)])[0] : null
}

function setTaskTags(taskId, tagIds) {
  db.prepare('DELETE FROM task_tags WHERE task_id = ?').run(taskId)
  const insert = db.prepare('INSERT INTO task_tags (task_id, tag_id) SELECT ?, id FROM tags WHERE id = ?')
  for (const tagId of tagIds || []) insert.run(taskId, tagId)
}

function validTask(input) {
  const type = String(input.type || 'task')
  const status = String(input.status || 'backlog')
  const priority = String(input.priority || 'medium')
  if (!['task', 'bug'].includes(type)) throw new Error('Tipo de tarea inválido')
  if (!['backlog', 'todo', 'in_progress', 'in_test', 'completed'].includes(status)) throw new Error('Estado de tarea inválido')
  if (!['low', 'medium', 'high'].includes(priority)) throw new Error('Prioridad de tarea inválida')
  const title = String(input.title || '').trim()
  if (!title) throw new Error('El título de la tarea es obligatorio')
  return { title, description: String(input.description || '').trim(), type, status, priority, tagIds: Array.isArray(input.tagIds) ? input.tagIds.map(Number).filter(Number.isInteger) : [] }
}

export function listTasks(projectId) {
  const rows = db.prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY updated_at DESC, id DESC').all(projectId).map(task)
  return attachTaskTags(projectId, rows)
}

export function createTask(input) {
  const payload = validTask(input)
  const completedAt = payload.status === 'completed' ? new Date().toISOString() : null
  const result = db.prepare('INSERT INTO tasks (project_id, title, description, type, status, priority, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(input.projectId, payload.title, payload.description, payload.type, payload.status, payload.priority, completedAt)
  const id = insertId(result)
  setTaskTags(id, payload.tagIds)
  return getTask(id)
}

export function updateTask(id, input) {
  const payload = validTask(input)
  const current = db.prepare('SELECT project_id, status, completed_at FROM tasks WHERE id = ?').get(id)
  const completedAt = payload.status === 'completed' ? (current?.status === 'completed' && current.completed_at ? current.completed_at : new Date().toISOString()) : null
  db.prepare("UPDATE tasks SET title = ?, description = ?, type = ?, status = ?, priority = ?, completed_at = ?, updated_at = datetime('now') WHERE id = ?").run(payload.title, payload.description, payload.type, payload.status, payload.priority, completedAt, id)
  setTaskTags(id, payload.tagIds)
  return getTask(id)
}

export function deleteTask(id) {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
}

export function listTaskChecklist(taskId) {
  return db.prepare('SELECT * FROM task_checklist_items WHERE task_id = ? ORDER BY position, id').all(taskId).map(checklistItem)
}

function validChecklist(input) {
  const title = String(input.title || '').trim()
  if (!title) throw new Error('El texto del paso es obligatorio')
  return { title, completed: Boolean(input.completed), position: Number.isInteger(Number(input.position)) ? Number(input.position) : 0 }
}

export function createTaskChecklistItem(input) {
  const payload = validChecklist(input)
  const taskRow = db.prepare('SELECT project_id FROM tasks WHERE id = ?').get(input.taskId)
  if (!taskRow) throw new Error('La tarea no existe')
  const result = db.prepare("INSERT INTO task_checklist_items (task_id, title, completed, completed_at, position) VALUES (?, ?, ?, ?, ?)").run(input.taskId, payload.title, payload.completed ? 1 : 0, payload.completed ? new Date().toISOString() : null, payload.position)
  maybeUnlockAchievements(taskRow.project_id)
  return checklistItem(db.prepare('SELECT * FROM task_checklist_items WHERE id = ?').get(insertId(result)))
}

export function updateTaskChecklistItem(id, input) {
  const payload = validChecklist(input)
  const current = db.prepare('SELECT * FROM task_checklist_items WHERE id = ?').get(id)
  if (!current) throw new Error('El paso no existe')
  const completedAt = payload.completed ? (current.completed && current.completed_at ? current.completed_at : new Date().toISOString()) : null
  db.prepare("UPDATE task_checklist_items SET title = ?, completed = ?, completed_at = ?, position = ?, updated_at = datetime('now') WHERE id = ?").run(payload.title, payload.completed ? 1 : 0, completedAt, payload.position, id)
  const updated = checklistItem(db.prepare('SELECT * FROM task_checklist_items WHERE id = ?').get(id))
  maybeUnlockAchievements(db.prepare('SELECT project_id FROM tasks WHERE id = ?').get(updated.taskId).project_id)
  return updated
}

export function deleteTaskChecklistItem(id) {
  db.prepare('DELETE FROM task_checklist_items WHERE id = ?').run(id)
}

function maybeUnlockAchievements(projectId) {
  const sessions = db.prepare('SELECT * FROM focus_sessions WHERE project_id = ? ORDER BY completed_at, id').all(projectId)
  const completedSteps = db.prepare('SELECT COUNT(*) AS count FROM task_checklist_items i JOIN tasks t ON t.id = i.task_id WHERE t.project_id = ? AND i.completed = 1').get(projectId).count
  const completedTasks = db.prepare("SELECT COUNT(*) AS count FROM tasks WHERE project_id = ? AND status = 'completed'").get(projectId).count
  const days = new Set(sessions.map((item) => String(item.completed_at).slice(0, 10))).size
  const rules = [
    ['first_pomodoro', sessions.length >= 1], ['five_pomodoros', sessions.length >= 5], ['ten_checklist_items', completedSteps >= 10],
    ['first_completed_task', completedTasks >= 1], ['three_completed_tasks', completedTasks >= 3], ['three_focus_days', days >= 3], ['ten_sessions', sessions.length >= 10],
  ]
  const insert = db.prepare('INSERT OR IGNORE INTO focus_achievements (project_id, achievement_key) VALUES (?, ?)')
  for (const [key, unlocked] of rules) if (unlocked) insert.run(projectId, key)
}

export function listFocusSessions(projectId) {
  return db.prepare('SELECT * FROM focus_sessions WHERE project_id = ? ORDER BY completed_at DESC, id DESC').all(projectId).map(focusSession)
}

export function createFocusSession(input) {
  const taskRow = db.prepare('SELECT project_id FROM tasks WHERE id = ?').get(input.taskId)
  if (!taskRow || taskRow.project_id !== Number(input.projectId)) throw new Error('La tarea no pertenece a este proyecto')
  const planned = Number(input.plannedSeconds); const actual = Number(input.actualSeconds)
  if (!Number.isInteger(planned) || planned <= 0 || !Number.isInteger(actual) || actual <= 0 || actual > planned) throw new Error('Duración de sesión inválida')
  const result = db.prepare('INSERT INTO focus_sessions (project_id, task_id, planned_seconds, actual_seconds, started_at, completed_at) VALUES (?, ?, ?, ?, ?, ?)').run(input.projectId, input.taskId, planned, actual, input.startedAt, input.completedAt)
  maybeUnlockAchievements(input.projectId)
  return focusSession(db.prepare('SELECT * FROM focus_sessions WHERE id = ?').get(insertId(result)))
}

export function listFocusAchievements(projectId) {
  maybeUnlockAchievements(projectId)
  return db.prepare('SELECT * FROM focus_achievements WHERE project_id = ? ORDER BY unlocked_at, id').all(projectId).map(achievement)
}

function setSecretTags(secretId, tagIds) {
  db.prepare('DELETE FROM secret_tags WHERE secret_id = ?').run(secretId)
  const insert = db.prepare('INSERT INTO secret_tags (secret_id, tag_id) VALUES (?, ?)')
  for (const tagId of tagIds) insert.run(secretId, tagId)
}
