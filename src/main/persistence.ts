import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { OilHealthState, DEFAULT_STATE } from '../shared/types'

let filePath: string
let debounceTimer: ReturnType<typeof setTimeout> | null = null

/** Call after app.whenReady(). Reads saved state and returns it (merged over DEFAULT_STATE). */
export function initPersistence(): OilHealthState {
  filePath = join(app.getPath('userData'), 'state.json')
  try {
    const raw = readFileSync(filePath, 'utf-8')
    const saved = JSON.parse(raw) as Partial<OilHealthState>
    // boardDetected is runtime-only — always reset to false on load
    return { ...DEFAULT_STATE, ...saved, boardDetected: false }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

/** Debounced write — fires 500 ms after the last call. boardDetected is excluded. */
export function scheduleWrite(state: OilHealthState): void {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    const { boardDetected: _omit, ...toSave } = state
    try {
      writeFileSync(filePath, JSON.stringify(toSave, null, 2), 'utf-8')
    } catch (err) {
      console.error('[persistence] write failed:', err)
    }
  }, 500)
}
