import { createServer } from 'node:http'
import { extname, join, normalize, relative } from 'node:path'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { closeDb } from './db.mjs'
import * as repo from './repository.mjs'

const contentTypes = {
  '.css': 'text/css; charset=utf-8', '.gif': 'image/gif', '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
}

function send(response, status, body, contentType = 'application/json; charset=utf-8') {
  response.writeHead(status, { 'Content-Type': contentType, 'Cache-Control': 'no-store' })
  response.end(body === undefined ? '' : typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body))
}

async function body(request) {
  let raw = ''
  for await (const chunk of request) raw += chunk
  return raw ? JSON.parse(raw) : {}
}

function route(pathname) {
  const parts = pathname.split('/').filter(Boolean)
  return { parts, id: parts[2] ? Number(parts[2]) : null }
}

async function serveStatic(staticRoot, pathname, response) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname
  const filePath = normalize(join(staticRoot, requestedPath))
  const rootRelativePath = relative(staticRoot, filePath)
  if (rootRelativePath.startsWith('..') || rootRelativePath.includes(':')) return send(response, 403, { error: 'Acceso denegado' })

  try {
    const content = await readFile(filePath)
    const type = contentTypes[extname(filePath).toLowerCase()] || 'application/octet-stream'
    return send(response, 200, content, type)
  } catch (error) {
    if (error.code !== 'ENOENT') return send(response, 500, { error: 'No se pudo leer el recurso' })
    try {
      const index = await readFile(join(staticRoot, 'index.html'))
      return send(response, 200, index, contentTypes['.html'])
    } catch {
      return send(response, 404, { error: 'Recurso no encontrado' })
    }
  }
}

async function handleApi(request, response, url) {
  if (request.method === 'OPTIONS') return send(response, 204)
  if (request.method === 'GET' && url.pathname === '/api/health') return send(response, 200, { ok: true })
  if (!url.pathname.startsWith('/api/')) return false

  const { parts, id } = route(url.pathname)
  const payload = ['POST', 'PATCH'].includes(request.method) ? await body(request) : {}
  let result
  let handled = false

  if (parts[1] === 'projects' && parts.length === 2) {
    if (request.method === 'GET') { result = repo.listProjects(); handled = true }
    else if (request.method === 'POST') { result = repo.createProject(payload); handled = true }
  } else if (parts[1] === 'projects' && parts[3] === 'secrets') {
    if (request.method === 'GET') { result = repo.listSecrets(id); handled = true }
  } else if (parts[1] === 'projects' && parts[3] === 'tags') {
    if (request.method === 'GET') { result = repo.listTags(id); handled = true }
  } else if (parts[1] === 'projects' && parts[3] === 'variable-groups') {
    if (request.method === 'GET') { result = repo.listVariableGroups(id); handled = true }
  } else if (parts[1] === 'projects' && parts[3] === 'notes') {
    if (request.method === 'GET') { result = repo.listNotes(id); handled = true }
  } else if (parts[1] === 'projects' && parts[3] === 'tasks') {
    if (request.method === 'GET') { result = repo.listTasks(id); handled = true }
  } else if (parts[1] === 'projects' && parts[3] === 'focus-sessions') {
    if (request.method === 'GET') { result = repo.listFocusSessions(id); handled = true }
  } else if (parts[1] === 'projects' && parts[3] === 'achievements') {
    if (request.method === 'GET') { result = repo.listFocusAchievements(id); handled = true }
  } else if (parts[1] === 'projects' && parts.length === 3) {
    if (request.method === 'GET') { result = repo.getProject(id); handled = true }
    else if (request.method === 'PATCH') { repo.updateProject(id, payload); handled = true }
    else if (request.method === 'DELETE') { repo.deleteProject(id); handled = true }
  } else if (parts[1] === 'secrets' && parts.length === 2) {
    if (request.method === 'POST') { result = repo.createSecret(payload); handled = true }
  } else if (parts[1] === 'secrets' && parts.length === 3) {
    if (request.method === 'PATCH') { repo.updateSecret(id, payload); handled = true }
    else if (request.method === 'DELETE') { repo.deleteSecret(id); handled = true }
  } else if (parts[1] === 'tags' && parts.length === 2) {
    if (request.method === 'POST') { result = repo.createTag(payload.projectId, payload); handled = true }
  } else if (parts[1] === 'tags' && parts.length === 3) {
    if (request.method === 'PATCH') { repo.updateTag(id, payload); handled = true }
    else if (request.method === 'DELETE') { repo.deleteTag(id); handled = true }
  } else if (parts[1] === 'variable-groups' && parts[3] === 'duplicate') {
    if (request.method === 'POST') { result = repo.duplicateVariableGroup(id); handled = true }
  } else if (parts[1] === 'variable-groups' && parts.length === 2) {
    if (request.method === 'POST') { result = repo.createVariableGroup(payload); handled = true }
  } else if (parts[1] === 'variable-groups' && parts.length === 3) {
    if (request.method === 'PATCH') { repo.updateVariableGroup(id, payload); handled = true }
    else if (request.method === 'DELETE') { repo.deleteVariableGroup(id); handled = true }
  } else if (parts[1] === 'notes' && parts.length === 2) {
    if (request.method === 'POST') { result = repo.createNote(payload); handled = true }
  } else if (parts[1] === 'notes' && parts.length === 3) {
    if (request.method === 'PATCH') { result = repo.updateNote(id, payload); handled = true }
    else if (request.method === 'DELETE') { repo.deleteNote(id); handled = true }
  } else if (parts[1] === 'notes' && parts.length === 4 && parts[3] === 'toggle-pin') {
    if (request.method === 'POST') { result = repo.toggleNotePin(id); handled = true }
  } else if (parts[1] === 'tasks' && parts.length === 2) {
    if (request.method === 'POST') { result = repo.createTask(payload); handled = true }
  } else if (parts[1] === 'tasks' && parts.length === 3) {
    if (request.method === 'PATCH') { result = repo.updateTask(id, payload); handled = true }
    else if (request.method === 'DELETE') { repo.deleteTask(id); handled = true }
  } else if (parts[1] === 'tasks' && parts[3] === 'checklist') {
    if (request.method === 'GET') { result = repo.listTaskChecklist(id); handled = true }
  } else if (parts[1] === 'task-checklist-items' && parts.length === 2) {
    if (request.method === 'POST') { result = repo.createTaskChecklistItem(payload); handled = true }
  } else if (parts[1] === 'task-checklist-items' && parts.length === 3) {
    if (request.method === 'PATCH') { result = repo.updateTaskChecklistItem(id, payload); handled = true }
    else if (request.method === 'DELETE') { repo.deleteTaskChecklistItem(id); handled = true }
  } else if (parts[1] === 'focus-sessions' && parts.length === 2) {
    if (request.method === 'POST') { result = repo.createFocusSession(payload); handled = true }
  }

  if (!handled) return send(response, 404, { error: 'Ruta no encontrada' })
  return send(response, result === undefined ? 204 : request.method === 'POST' ? 201 : 200, result)
}

export function startApiServer({ host = process.env.HOST || '127.0.0.1', port = Number(process.env.PORT || 3001), staticRoot } = {}) {
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
      const handled = await handleApi(request, response, url)
      if (handled !== false) return
      if (staticRoot && request.method === 'GET') return serveStatic(staticRoot, url.pathname, response)
      return send(response, 404, { error: 'Ruta no encontrada' })
    } catch (error) {
      const status = error instanceof SyntaxError ? 400 : 500
      return send(response, status, { error: status === 400 ? 'JSON inválido' : 'Error interno de la bóveda' })
    }
  })

  return new Promise((resolve, reject) => {
    const onError = (error) => { server.off('listening', onListening); reject(error) }
    const onListening = () => {
      server.off('error', onError)
      const address = server.address()
      const actualPort = typeof address === 'object' && address ? address.port : port
      resolve({
        port: actualPort,
        url: `http://${host}:${actualPort}`,
        server,
        close: () => new Promise((closeResolve, closeReject) => server.close((error) => {
          try { closeDb() } catch (closeError) { return closeReject(closeError) }
          if (error) closeReject(error)
          else closeResolve()
        })),
      })
    }
    server.once('error', onError)
    server.once('listening', onListening)
    server.listen(port, host)
  })
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const server = await startApiServer()
  console.log(`Secret Vault API escuchando en ${server.url}`)
  const shutdown = () => server.close().finally(() => process.exit(0))
  process.once('SIGTERM', shutdown)
  process.once('SIGINT', shutdown)
}
