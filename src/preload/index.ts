import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Expose electron APIs to renderer via contextBridge
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
}
