import initSqlJs, { type Database } from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url'

const DB_STORE = 'secret-vault-db'

const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS secrets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('env', 'credential')),
  key TEXT NOT NULL DEFAULT '',
  value TEXT NOT NULL DEFAULT '',
  username TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  password TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'default',
  UNIQUE (project_id, name)
);

CREATE TABLE IF NOT EXISTS secret_tags (
  secret_id INTEGER NOT NULL REFERENCES secrets(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (secret_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_secrets_project ON secrets(project_id);
CREATE INDEX IF NOT EXISTS idx_tags_project ON tags(project_id);
CREATE INDEX IF NOT EXISTS idx_secret_tags_tag ON secret_tags(tag_id);
`

let db: Database | null = null

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_STORE, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore('db')
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function loadSaved(): Promise<Uint8Array | null> {
  try {
    const idb = await openDb()
    const tx = idb.transaction('db', 'readonly')
    const req = tx.objectStore('db').get('main')
    const data = await new Promise<Uint8Array | undefined>((resolve) => {
      req.onsuccess = () => resolve(req.result as Uint8Array | undefined)
      req.onerror = () => resolve(undefined)
    })
    idb.close()
    return data && data.byteLength > 0 ? new Uint8Array(data) : null
  } catch {
    // ignore corrupted or missing saved database
    return null
  }
}

export async function saveDatabase(): Promise<void> {
  if (!db) return
  const data = db.export()
  const idb = await openDb()
  const tx = idb.transaction('db', 'readwrite')
  tx.objectStore('db').put(data, 'main')
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  idb.close()
}

export async function getDb(): Promise<Database> {
  if (db) return db
  const SQL = await initSqlJs({ locateFile: () => wasmUrl })
  const saved = await loadSaved()
  db = new SQL.Database(saved)
  db.run(SCHEMA)
  return db
}

export async function runQuery(fn: (db: Database) => void): Promise<void> {
  const database = await getDb()
  fn(database)
  await saveDatabase()
}