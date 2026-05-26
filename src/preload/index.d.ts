import { ElectronAPI } from '@electron-toolkit/preload'
import { OilHealthState } from '../shared/types'

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
    }
  }
}
