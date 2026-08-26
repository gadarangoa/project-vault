import { app, BrowserWindow, session } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isPackaged = app.isPackaged
const developmentUrl = 'http://127.0.0.1:5174'
let api

function configureSecurity() {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false))
}

async function startApi() {
  process.env.DATABASE_PATH = path.join(app.getPath('userData'), 'secret-vault.sqlite')
  process.env.HOST = '127.0.0.1'
  const { startApiServer } = await import('../server/index.mjs')
  api = await startApiServer({
    host: '127.0.0.1',
    port: isPackaged ? 0 : 3001,
    staticRoot: isPackaged ? path.join(__dirname, '..', 'dist') : undefined,
  })
  return api
}

async function createWindow(server) {
  const window = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  })

  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  window.webContents.on('will-navigate', (event, url) => {
    const allowed = isPackaged ? url.startsWith(server.url) : url.startsWith(developmentUrl)
    if (!allowed) event.preventDefault()
  })

  if (isPackaged) await window.loadURL(server.url)
  else await window.loadURL(developmentUrl)
}

async function shutdown() {
  if (!api) return
  const currentApi = api
  api = undefined
  await currentApi.close()
}

app.whenReady().then(async () => {
  configureSecurity()
  const server = await startApi()
  await createWindow(server)
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) await createWindow(server)
  })
}).catch((error) => {
  console.error('No se pudo iniciar Secret Vault:', error)
  app.quit()
})

app.on('before-quit', (event) => {
  if (!api) return
  event.preventDefault()
  shutdown().finally(() => app.quit())
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
