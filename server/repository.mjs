import { db } from './db.mjs'

const project = (row) => ({ id: row.id, name: row.name, description: row.description, createdAt: row.created_at, updatedAt: row.updated_at })
const tag = (row) => ({ id: row.id, projectId: row.project_id, name: row.name, color: row.color })
const secret = (row) => ({ id: row.id, projectId: row.project_id, name: row.name, type: row.type, key: row.key, value: row.value, username: row.username, email: row.email, password: row.password, notes: row.notes, createdAt: row.created_at, updatedAt: row.updated_at, tags: [] })
const variable = (row) => ({ id: row.id, groupId: row.group_id, key: row.key, value: row.value, position: row.position })
const variableGroup = (row, variables = []) => ({ id: row.id, projectId: row.project_id, name: row.name, description: row.description, createdAt: row.created_at, updatedAt: row.updated_at, variables })
const note = (row) => ({ id: row.id, projectId: row.project_id, title: row.title, contentJson: JSON.parse(row.content_json), contentMarkdown: row.content_markdown, pinned: Boolean(row.pinned), createdAt: row.created_at, updatedAt: row.updated_at, tags: [] })

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

function setSecretTags(secretId, tagIds) {
  db.prepare('DELETE FROM secret_tags WHERE secret_id = ?').run(secretId)
  const insert = db.prepare('INSERT INTO secret_tags (secret_id, tag_id) VALUES (?, ?)')
  for (const tagId of tagIds) insert.run(secretId, tagId)
}
