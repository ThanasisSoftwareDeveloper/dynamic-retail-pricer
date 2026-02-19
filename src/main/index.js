/**
 * index.js - Electron Main Process
 */

const { app, BrowserWindow, nativeTheme } = require('electron')
const path = require('path')

const isDev = process.env.NODE_ENV === 'development'
nativeTheme.themeSource = 'dark'

function createWindow () {
  const win = new BrowserWindow({
    width:  1100,
    height: 820,
    minWidth:  800,
    minHeight: 600,
    title: 'PriceCalc',
    backgroundColor: '#0f172a',
    autoHideMenuBar: true,
    webPreferences: {
      preload:          path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
      sandbox:          false
    }
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  return win
}

app.whenReady().then(async () => {
  // Init DB first (sql.js is async)
  const db = require('./db/database')
  await db.initDatabase()

  const win = createWindow()

  // Register IPC handlers after DB is ready
  const registerHandlers = require('./ipc-handlers')
  registerHandlers(win)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  try {
    const { closeBrowser } = require('./scraper/stealth')
    closeBrowser()
  } catch {}
  if (process.platform !== 'darwin') app.quit()
})

process.on('unhandledRejection', (reason) => {
  console.error('[Main] Unhandled rejection:', reason)
})
