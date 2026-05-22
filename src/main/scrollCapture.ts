/**
 * Global scroll-wheel → TPM knob.
 *
 * Uses uiohook-napi to capture wheel events at the OS level, regardless of
 * which window has focus.
 *
 * macOS note: the first time this is activated, Electron needs Accessibility
 * permission (System Settings → Privacy & Security → Accessibility). Without
 * it, uiohook silently receives no events on macOS. A one-time dialog is shown
 * from index.ts before this module starts.
 */
import { uIOhook, UiohookWheelEvent } from 'uiohook-napi'
import { stateManager } from './state'

const THROTTLE_MS = 80
const TPM_STEP    = 0.1
const INTERACT_PAUSE_MS = 200

let isRunning = false
let lastAcceptedAt = 0
let interactTimer: ReturnType<typeof setTimeout> | null = null

function handleWheel(event: UiohookWheelEvent): void {
  const now = Date.now()
  if (now - lastAcceptedAt < THROTTLE_MS) return
  lastAcceptedAt = now

  // uiohook convention: rotation < 0 = scroll up; rotation > 0 = scroll down.
  // We map scroll up → more degradation (TPM increases).
  const direction = event.rotation < 0 ? 1 : -1
  const currentTpm = stateManager.get().tpm
  const newTpm = Math.round(
    Math.min(40, Math.max(0, currentTpm + direction * TPM_STEP)) * 100
  ) / 100

  // Anchor the baseline so fluctuation drifts toward the new value
  stateManager.setTpmBaseline(newTpm)

  // Pause fluctuation briefly so the timer doesn't fight the scroll
  stateManager.setUserInteractingWithTpm(true)
  if (interactTimer) clearTimeout(interactTimer)
  interactTimer = setTimeout(() => {
    stateManager.setUserInteractingWithTpm(false)
    interactTimer = null
  }, INTERACT_PAUSE_MS)

  stateManager.update({ tpm: newTpm })
}

export function startScrollCapture(): void {
  if (isRunning) return
  isRunning = true
  uIOhook.on('wheel', handleWheel)
  uIOhook.start()
}

export function stopScrollCapture(): void {
  if (!isRunning) return
  isRunning = false
  uIOhook.removeListener('wheel', handleWheel)
  // stop() shuts down the native hook thread — must be called before quit
  uIOhook.stop()
  // Clear any pending interact pause so fluctuation resumes immediately
  if (interactTimer) { clearTimeout(interactTimer); interactTimer = null }
  stateManager.setUserInteractingWithTpm(false)
}
