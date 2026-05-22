import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

const PRELOAD = join(__dirname, '../preload/index.js')
const RENDERER_URL = process.env['ELECTRON_RENDERER_URL']

export let dashboardWindow: BrowserWindow | null = null
export let operatorWindow: BrowserWindow | null = null

export function createDashboardWindow(): BrowserWindow {
  dashboardWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    title: 'Oil Health Monitor',
    webPreferences: { preload: PRELOAD, sandbox: false },
  })

  dashboardWindow.on('ready-to-show', () => {
    dashboardWindow!.maximize()
    dashboardWindow!.show()
  })

  dashboardWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  dashboardWindow.on('closed', () => { dashboardWindow = null })

  if (is.dev && RENDERER_URL) {
    dashboardWindow.loadURL(`${RENDERER_URL}/dashboard/index.html`)
  } else {
    dashboardWindow.loadFile(join(__dirname, '../renderer/dashboard/index.html'))
  }

  return dashboardWindow
}

export function openOrFocusOperatorWindow(): void {
  if (operatorWindow && !operatorWindow.isDestroyed()) {
    if (operatorWindow.isMinimized()) operatorWindow.restore()
    operatorWindow.focus()
    return
  }

  operatorWindow = new BrowserWindow({
    width: 600,
    height: 900,
    minWidth: 480,
    minHeight: 600,
    title: 'Oil Health Monitor — Operator Controls',
    resizable: true,
    webPreferences: { preload: PRELOAD, sandbox: false },
  })

  operatorWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  operatorWindow.on('closed', () => { operatorWindow = null })

  if (is.dev && RENDERER_URL) {
    operatorWindow.loadURL(`${RENDERER_URL}/operator/index.html`)
  } else {
    operatorWindow.loadFile(join(__dirname, '../renderer/operator/index.html'))
  }
}

/** Push state to every open window. */
export function broadcastState(channel: string, payload: unknown): void {
  BrowserWindow.getAllWindows().forEach((w) => {
    if (!w.isDestroyed()) w.webContents.send(channel, payload)
  })
}
