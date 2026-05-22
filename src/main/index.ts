import { app, ipcMain, globalShortcut } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { SerialPort } from 'serialport'
import { stateManager } from './state'
import { initPersistence, scheduleWrite } from './persistence'
import { createDashboardWindow, openOrFocusOperatorWindow, broadcastState } from './windows'
import { IPC } from '../shared/ipc'
import { OilHealthState } from '../shared/types'

// ── Board detection ────────────────────────────────────────────────────────

const ARDUINO_VENDOR_IDS = new Set(['2341', '2a03', '1a86', '10c4', '0403'])

function isArduinoBoard(port: Awaited<ReturnType<typeof SerialPort.list>>[number]): boolean {
  if (port.manufacturer && /arduino/i.test(port.manufacturer)) return true
  if (port.vendorId && ARDUINO_VENDOR_IDS.has(port.vendorId.toLowerCase())) return true
  return false
}

async function detectBoard(): Promise<boolean> {
  try {
    return (await SerialPort.list()).some(isArduinoBoard)
  } catch {
    return false
  }
}

function startBoardPolling(): ReturnType<typeof setInterval> {
  let lastDetected: boolean | null = null
  async function poll(): Promise<void> {
    const detected = await detectBoard()
    if (detected !== lastDetected) {
      lastDetected = detected
      stateManager.update({ boardDetected: detected })
    }
  }
  poll()
  return setInterval(poll, 2000)
}

// ── IPC handlers ───────────────────────────────────────────────────────────

ipcMain.handle(IPC.STATE_GET, () => stateManager.get())

ipcMain.on(IPC.STATE_UPDATE, (_event, partial: Partial<OilHealthState>) => {
  stateManager.update(partial)
})

ipcMain.on(IPC.OPERATOR_OPEN, () => openOrFocusOperatorWindow())

// ── App lifecycle ──────────────────────────────────────────────────────────

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.oil-health-monitor')

  // Seed state from disk before any window opens
  const saved = initPersistence()
  stateManager.load(saved)

  // Broadcast every state change to all open windows + schedule disk write
  stateManager.on('changed', (state: OilHealthState) => {
    broadcastState(IPC.STATE_CHANGED, state)
    scheduleWrite(state)
  })

  app.on('browser-window-created', (_, win) => optimizer.watchWindowShortcuts(win))

  createDashboardWindow()
  startBoardPolling()

  // Global shortcut works even when the dashboard window isn't focused
  globalShortcut.register('CommandOrControl+Shift+O', () => {
    openOrFocusOperatorWindow()
  })

  app.on('activate', () => {
    // macOS: re-create dashboard if all windows were closed
    const { dashboardWindow } = require('./windows')
    if (!dashboardWindow) createDashboardWindow()
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
