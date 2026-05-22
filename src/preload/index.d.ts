import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onBoardDetectionChange: (callback: (detected: boolean) => void) => () => void
    }
  }
}
