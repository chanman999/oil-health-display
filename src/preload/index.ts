import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC } from '../shared/ipc'
import { OilHealthState } from '../shared/types'

const api = {
  getState: (): Promise<OilHealthState> =>
    ipcRenderer.invoke(IPC.STATE_GET),

  updateState: (partial: Partial<OilHealthState>): void =>
    ipcRenderer.send(IPC.STATE_UPDATE, partial),

  onStateChanged: (callback: (state: OilHealthState) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: OilHealthState) => callback(state)
    ipcRenderer.on(IPC.STATE_CHANGED, handler)
    return () => ipcRenderer.removeListener(IPC.STATE_CHANGED, handler)
  },

  openOperatorWindow: (): void =>
    ipcRenderer.send(IPC.OPERATOR_OPEN),

  setTpmInteracting: (interacting: boolean): void =>
    ipcRenderer.send(IPC.TPM_INTERACT, interacting),

  onConnectionDetected: (callback: () => void): (() => void) => {
    const handler = () => callback()
    ipcRenderer.on(IPC.CONNECTION_DETECTED, handler)
    return () => ipcRenderer.removeListener(IPC.CONNECTION_DETECTED, handler)
  },
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (err) {
    console.error(err)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
