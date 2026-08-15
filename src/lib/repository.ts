import { getDb, saveDatabase } from './db'
import type { Project, Secret, SecretInput, Tag } from './types'

type Row = Record<string, unknown>

function all<T>(stmt: any): T[] {
  const rows: T[] = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T)
  }
  stmt.free()
  return rows
}

function one<T>(stmt: any): T | null {
  const row = stmt.step() ? (stmt.getAsObject() as T) : null
  stmt.free()
  return row
}

function rowToProject(r: Row): Project {
  return {
    id: r.id as number,
    name: r.name as string,
    description: r.description as string,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }
}

function rowToTag(r: Row): Tag {
  return {
    id: r.id as number,
    projectId: r.project_id as number,
    name: r.name as string,
    color: r.color as string,
  }
}

function rowToSecret(r: Row): Secret {
  return {
    id: r.id as number,
    projectId: r.project_id as number,
    name: r.name as string,
    type: r.type as Secret['type'],
    key: r.key as string,
    value: r.value as string,
    username: r.username as string,
    email: r.email as string,
    password: r.password as string,
    notes: r.notes as string,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
    tags: [],
  }
}

async function attachTags(projectId: number, secrets: Secret[]): Promise<void> {
  const db = await getDb()
  const tags = all<Tag>(db.prepare('SELECT * FROM tags WHERE project_id = ? ORDER BY name', [projectId]))
  const links = all<{ secret_id: number; tag_id: number }>(
    db.prepare(
      `SELECT st.secret_id, st.tag_id FROM secret_tags st
       JOIN secrets s ON s.id = st.secret_id
       WHERE s.project_id = ?`,
      [projectId],
    ),
  )
  const tagById = new Map(tags.map((t) => [t.id, t]))
  for (const secret of secrets) {
    secret.tags = links
      .filter((l) => l.secret_id === secret.id)
      .map((l) => tagById.get(l.tag_id))
      .filter((t): t is Tag => Boolean(t))
  }
}

function lastInsertId(db: any): number {
  return db.exec('SELECT last_insert_rowid()')[0].values[0][0] as number
}

export async function listProjects(): Promise<Project[]> {
  const db = await getDb()
  return all<Row>(db.prepare('SELECT * FROM projects ORDER BY updated_at DESC, id DESC')).map(rowToProject)
}

export async function getProject(id: number): Promise<Project | null> {
  const db = await getDb()
  const row = one<Row>(db.prepare('SELECT * FROM projects WHERE id = ?', [id]))
  return row ? rowToProject(row) : null
}

export async function createProject(name: string, description: string): Promise<Project> {
  const db = await getDb()
  db.run('INSERT INTO projects (name, description) VALUES (?, ?)', [name, description])
  const id = lastInsertId(db)
  await saveDatabase()
  const row = one<Row>(db.prepare('SELECT * FROM projects WHERE id = ?', [id]))!
  return rowToProject(row)
}

export async function updateProject(id: number, name: string, description: string): Promise<void> {
  const db = await getDb()
  db.run("UPDATE projects SET name = ?, description = ?, updated_at = datetime('now') WHERE id = ?", [
    name,
    description,
    id,
  ])
  await saveDatabase()
}

export async function deleteProject(id: number): Promise<void> {
  const db = await getDb()
  db.run('DELETE FROM projects WHERE id = ?', [id])
  await saveDatabase()
}

export async function listSecrets(projectId: number): Promise<Secret[]> {
  const db = await getDb()
  const secrets = all<Row>(
    db.prepare('SELECT * FROM secrets WHERE project_id = ? ORDER BY updated_at DESC, id DESC', [
      projectId,
    ]),
  ).map(rowToSecret)
  await attachTags(projectId, secrets)
  return secrets
}

export async function createSecret(input: SecretInput): Promise<Secret> {
  const db = await getDb()
  db.run(
    `INSERT INTO secrets (project_id, name, type, key, value, username, email, password, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.projectId,
      input.name,
      input.type,
      input.key,
      input.value,
      input.username,
      input.email,
      input.password,
      input.notes,
    ],
  )
  const id = lastInsertId(db)
  setSecretTags(db, id, input.tagIds)
  await saveDatabase()
  const row = one<Row>(db.prepare('SELECT * FROM secrets WHERE id = ?', [id]))!
  const secret = rowToSecret(row)
  await attachTags(input.projectId, [secret])
  return secret
}

export async function updateSecret(id: number, input: SecretInput): Promise<void> {
  const db = await getDb()
  db.run(
    `UPDATE secrets SET name = ?, type = ?, key = ?, value = ?, username = ?, email = ?,
     password = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`,
    [
      input.name,
      input.type,
      input.key,
      input.value,
      input.username,
      input.email,
      input.password,
      input.notes,
      id,
    ],
  )
  setSecretTags(db, id, input.tagIds)
  await saveDatabase()
}

export async function deleteSecret(id: number): Promise<void> {
  const db = await getDb()
  db.run('DELETE FROM secrets WHERE id = ?', [id])
  await saveDatabase()
}

export async function listTags(projectId: number): Promise<Tag[]> {
  const db = await getDb()
  return all<Row>(db.prepare('SELECT * FROM tags WHERE project_id = ? ORDER BY name', [projectId])).map(
    rowToTag,
  )
}

export async function createTag(projectId: number, name: string, color: string): Promise<Tag> {
  const db = await getDb()
  db.run('INSERT INTO tags (project_id, name, color) VALUES (?, ?, ?)', [projectId, name, color])
  const id = lastInsertId(db)
  await saveDatabase()
  const row = one<Row>(db.prepare('SELECT * FROM tags WHERE id = ?', [id]))!
  return rowToTag(row)
}

export async function updateTag(id: number, name: string, color: string): Promise<void> {
  const db = await getDb()
  db.run('UPDATE tags SET name = ?, color = ? WHERE id = ?', [name, color, id])
  await saveDatabase()
}

export async function deleteTag(id: number): Promise<void> {
  const db = await getDb()
  db.run('DELETE FROM tags WHERE id = ?', [id])
  await saveDatabase()
}

function setSecretTags(db: any, secretId: number, tagIds: number[]): void {
  db.run('DELETE FROM secret_tags WHERE secret_id = ?', [secretId])
  const stmt = db.prepare('INSERT INTO secret_tags (secret_id, tag_id) VALUES (?, ?)')
  for (const tagId of tagIds) {
    stmt.run([secretId, tagId])
  }
  stmt.free()
}