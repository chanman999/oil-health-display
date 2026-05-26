import { app, ipcMain, globalShortcut, BrowserWindow, dialog, shell } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { existsSync, writeFileSync } from 'fs'
import { join } from 'path'
import { SerialPort } from 'serialport'
import { stateManager } from './state'
import { initPersistence, scheduleWrite } from './persistence'
import { dashboardWindow, operatorWindow, createDashboardWindow, openOrFocusOperatorWindow, broadcastState, createOverlayWindow, destroyOverlayWindow } from './windows'
import { startFluctuationTimer } from './fluctuation'
import * as scrollCapture from './scrollCapture'
import { scriptRunner } from './scripts'
import { IPC } from '../shared/ipc'
import { OilHealthState, ScriptName, ScriptStatus } from '../shared/types'

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

// Celebratory popup: only fire on false→true transition with 800ms stability
// debounce, and a 60s cooldown to suppress reconnect spam.
const BOARD_DEBOUNCE_MS = 800
const BOARD_COOLDOWN_MS = 60_000

function startBoardPolling(): ReturnType<typeof setInterval> {
  let lastDetected: boolean | null = null
  let stableTimer: ReturnType<typeof setTimeout> | null = null
  let cooldownUntil = 0

  function maybeSendConnectionDetected(): void {
    const now = Date.now()
    if (now < cooldownUntil) return
    cooldownUntil = now + BOARD_COOLDOWN_MS
    dashboardWindow?.webContents.send(IPC.CONNECTION_DETECTED)
  }

  async function poll(): Promise<void> {
    const detected = await detectBoard()
    if (detected !== lastDetected) {
      lastDetected = detected
      stateManager.update({ boardDetected: detected })

      // Cancel any pending stability timer on every transition
      if (stableTimer !== null) {
        clearTimeout(stableTimer)
        stableTimer = null
      }

      if (detected) {
        // Start stability window — only fire popup if still true after 800ms
        stableTimer = setTimeout(() => {
          stableTimer = null
          if (stateManager.get().boardDetected) {
            maybeSendConnectionDetected()
          }
        }, BOARD_DEBOUNCE_MS)
      }
    }
  }
  poll()
  return setInterval(poll, 2000)
}

// ── macOS Accessibility permission dialog ──────────────────────────────────
// uiohook-napi requires Accessibility permission on macOS to capture global
// wheel events. Without it the hook starts but receives no events silently.
// We show this dialog once per machine to explain and offer to open Settings.

function accessibilityMarkerPath(): string {
  return join(app.getPath('userData'), 'accessibility-dialog-shown')
}

async function maybeShowAccessibilityDialog(): Promise<void> {
  if (process.platform !== 'darwin') return
  if (existsSync(accessibilityMarkerPath())) return

  // Mark shown before the dialog so re-entrancy can't show it twice
  try { writeFileSync(accessibilityMarkerPath(), '1') } catch { /* ignore */ }

  const { response } = await dialog.showMessageBox({
    type: 'info',
    title: 'Accessibility Permission Required',
    message: 'Global Scroll Capture needs Accessibility access',
    detail:
      'To capture scroll-wheel events system-wide, Oil Health Monitor needs ' +
      'Accessibility permission.\n\n' +
      'Open: System Settings → Privacy & Security → Accessibility\n' +
      'Then add and enable "Oil Health Monitor".\n\n' +
      'Without this, scroll capture will not work on macOS.',
    buttons: ['Open System Settings', 'Dismiss'],
    defaultId: 0,
    cancelId: 1,
  })

  if (response === 0) {
    shell.openExternal(
      'x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility'
    )
  }
}

// ── Scroll capture state machine ───────────────────────────────────────────

let prevScrollCaptureActive = false

function syncScrollCapture(active: boolean): void {
  if (active === prevScrollCaptureActive) return
  prevScrollCaptureActive = active

  if (active) {
    maybeShowAccessibilityDialog() // non-blocking; shows once per machine
    scrollCapture.startScrollCapture()
    createOverlayWindow()
  } else {
    scrollCapture.stopScrollCapture()
    destroyOverlayWindow()
  }
}

// ── IPC handlers ───────────────────────────────────────────────────────────

ipcMain.handle(IPC.STATE_GET, () => stateManager.get())

ipcMain.on(IPC.STATE_UPDATE, (_event, partial: Partial<OilHealthState>) => {
  if (partial.tpm !== undefined) {
    stateManager.setTpmBaseline(partial.tpm)
  }
  stateManager.update(partial)
})

ipcMain.on(IPC.TPM_INTERACT, (_event, interacting: boolean) => {
  stateManager.setUserInteractingWithTpm(interacting)
})

ipcMain.on(IPC.OPERATOR_OPEN, () => openOrFocusOperatorWindow())

ipcMain.on(IPC.SCRIPT_RUN, (_event, name: ScriptName) => {
  if (scriptRunner.getStatus()?.name === name) {
    scriptRunner.cancel()
  } else {
    scriptRunner.start(name)
  }
})

ipcMain.on(IPC.SCRIPT_CANCEL, () => scriptRunner.cancel())

ipcMain.handle(IPC.SCRIPT_STATUS_GET, () => scriptRunner.getStatus())

// ── App lifecycle ──────────────────────────────────────────────────────────

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.oil-health-monitor')

  const saved = initPersistence()
  stateManager.load(saved)

  stateManager.on('changed', (state: OilHealthState) => {
    broadcastState(IPC.STATE_CHANGED, state)
    scheduleWrite(state)
    syncScrollCapture(state.scrollCaptureActive)
  })

  // Broadcast script status updates to the operator window only
  scriptRunner.on('status', (status: ScriptStatus | null) => {
    operatorWindow?.webContents.send(IPC.SCRIPT_STATUS, status)

    // When a script starts, register a one-shot scroll cancel; clear when done
    if (status !== null) {
      scrollCapture.onScrollFired = () => scriptRunner.cancel()
    } else {
      scrollCapture.onScrollFired = null
    }
  })

  app.on('browser-window-created', (_, win) => optimizer.watchWindowShortcuts(win))

  createDashboardWindow()
  startBoardPolling()
  startFluctuationTimer()

  // Cmd/Ctrl+Shift+O — open/focus operator window (global)
  globalShortcut.register('CommandOrControl+Shift+O', () => {
    openOrFocusOperatorWindow()
  })

  // Cmd/Ctrl+J — toggle scroll capture (global, works even when app isn't focused)
  globalShortcut.register('CommandOrControl+J', () => {
    const current = stateManager.get().scrollCaptureActive
    stateManager.update({ scrollCaptureActive: !current })
  })

  // Cmd/Ctrl+P — toggle Make Pure script
  globalShortcut.register('CommandOrControl+P', () => {
    if (scriptRunner.getStatus()?.name === 'make_pure') {
      scriptRunner.cancel()
    } else {
      scriptRunner.start('make_pure')
    }
  })

  // Cmd/Ctrl+D — toggle Make Dirty script
  globalShortcut.register('CommandOrControl+D', () => {
    if (scriptRunner.getStatus()?.name === 'make_dirty') {
      scriptRunner.cancel()
    } else {
      scriptRunner.start('make_dirty')
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createDashboardWindow()
  })
})

app.on('before-quit', () => {
  // Must stop uiohook before the process exits — otherwise it leaks as a
  // background thread and can prevent clean shutdown.
  if (stateManager.get().scrollCaptureActive) {
    scrollCapture.stopScrollCapture()
    destroyOverlayWindow()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
