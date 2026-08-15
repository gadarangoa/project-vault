import { db } from './db.mjs'

const project = (row) => ({ id: row.id, name: row.name, description: row.description, createdAt: row.created_at, updatedAt: row.updated_at })
const tag = (row) => ({ id: row.id, projectId: row.project_id, name: row.name, color: row.color })
const secret = (row) => ({ id: row.id, projectId: row.project_id, name: row.name, type: row.type, key: row.key, value: row.value, username: row.username, email: row.email, password: row.password, notes: row.notes, createdAt: row.created_at, updatedAt: row.updated_at, tags: [] })

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

function setSecretTags(secretId, tagIds) {
  db.prepare('DELETE FROM secret_tags WHERE secret_id = ?').run(secretId)
  const insert = db.prepare('INSERT INTO secret_tags (secret_id, tag_id) VALUES (?, ?)')
  for (const tagId of tagIds) insert.run(secretId, tagId)
}
