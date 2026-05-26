import { ElectronAPI } from '@electron-toolkit/preload'
import { OilHealthState, ScriptName, ScriptStatus } from '../shared/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getState: () => Promise<OilHealthState>
      updateState: (partial: Partial<OilHealthState>) => void
      onStateChanged: (callback: (state: OilHealthState) => void) => () => void
      openOperatorWindow: () => void
      setTpmInteracting: (interacting: boolean) => void
      onConnectionDetected: (callback: () => void) => () => void
      runScript: (name: ScriptName) => void
      cancelScript: () => void
      getScriptStatus: () => Promise<ScriptStatus | null>
      onScriptStatus: (callback: (status: ScriptStatus | null) => void) => () => void
    }
  }
}
