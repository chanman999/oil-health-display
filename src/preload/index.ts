import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  onBoardDetectionChange: (callback: (detected: boolean) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, detected: boolean) => callback(detected)
    ipcRenderer.on('board-detection-change', handler)
    // Return an unsubscribe function so the caller can clean up
    return () => ipcRenderer.removeListener('board-detection-change', handler)
  },
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
