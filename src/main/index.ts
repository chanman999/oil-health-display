import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { SerialPort } from 'serialport'

// Vendor IDs that indicate a supported Arduino-compatible board (lowercase for comparison)
const ARDUINO_VENDOR_IDS = new Set([
  '2341', // Arduino official
  '2a03', // Arduino.org / some clones
  '1a86', // CH340 — Elegoo Uno R3 and common clones
  '10c4', // CP210x — common on ESP32 boards
  '0403', // FTDI — some older clones
])

function isArduinoBoard(port: Awaited<ReturnType<typeof SerialPort.list>>[number]): boolean {
  if (port.manufacturer && /arduino/i.test(port.manufacturer)) return true
  if (port.vendorId && ARDUINO_VENDOR_IDS.has(port.vendorId.toLowerCase())) return true
  return false
}

async function detectBoard(): Promise<boolean> {
  try {
    const ports = await SerialPort.list()
    return ports.some(isArduinoBoard)
  } catch {
    return false
  }
}

function startBoardPolling(window: BrowserWindow): ReturnType<typeof setInterval> {
  let lastState: boolean | null = null

  async function poll(): Promise<void> {
    const detected = await detectBoard()
    // Send on first poll and whenever state changes
    if (detected !== lastState) {
      lastState = detected
      if (!window.isDestroyed()) {
        window.webContents.send('board-detection-change', detected)
      }
    }
  }

  poll()
  return setInterval(poll, 2000)
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    title: 'Oil Health Monitor',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  const pollingInterval = startBoardPolling(mainWindow)
  mainWindow.on('closed', () => clearInterval(pollingInterval))

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.oil-health-monitor')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ipcMain kept in scope — will be used for future channels
ipcMain
