import { createServer } from 'node:http'
import { closeDb } from './db.mjs'
import * as repo from './repository.mjs'

const port = Number(process.env.PORT || 3001)
const host = process.env.HOST || '0.0.0.0'

function send(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  response.end(body === undefined ? '' : JSON.stringify(body))
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

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
    if (request.method === 'OPTIONS') return send(response, 204)
    if (request.method === 'GET' && url.pathname === '/api/health') return send(response, 200, { ok: true })
    if (!url.pathname.startsWith('/api/')) return send(response, 404, { error: 'Ruta no encontrada' })

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
    }

    if (!handled) return send(response, 404, { error: 'Ruta no encontrada' })
    return send(response, result === undefined ? 204 : request.method === 'POST' ? 201 : 200, result)
  } catch (error) {
    const status = error instanceof SyntaxError ? 400 : 500
    return send(response, status, { error: status === 400 ? 'JSON inválido' : 'Error interno de la bóveda' })
  }
})

server.listen(port, host, () => console.log(`Secret Vault API escuchando en ${host}:${port}`))
process.on('SIGTERM', () => { server.close(() => { closeDb(); process.exit(0) }) })
process.on('SIGINT', () => { server.close(() => { closeDb(); process.exit(0) }) })
