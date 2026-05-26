import EventEmitter from 'events'
import { stateManager } from './state'
import { ScriptName, ScriptPhase, ScriptStatus } from '../shared/types'

// ── Tuneable constants ─────────────────────────────────────────────────────
const SCRIPT_TIMING = {
  DELAY_MS:      2000,  // initial hold before transition starts
  TRANSITION_MS: 3000,  // smoothstep interpolation window
  SETTLE_MS:     1000,  // hold at target before script ends
  // Total script duration: DELAY_MS + TRANSITION_MS + SETTLE_MS = 6000ms
}

const PURE_TARGET  = { tpm: 0.5, color: 1 }
const DIRTY_TARGET = { tpm: 28,  color: 8 }

const TOTAL_MS =
  SCRIPT_TIMING.DELAY_MS + SCRIPT_TIMING.TRANSITION_MS + SCRIPT_TIMING.SETTLE_MS

const TICK_MS = 50

// ── Internal state ─────────────────────────────────────────────────────────
interface RunningScript {
  name:           ScriptName
  startTime:      number
  currentPhase:   ScriptPhase
  intervalHandle: ReturnType<typeof setInterval>
  // Captured at the moment the transition phase begins (after fluctuation
  // may have nudged values during the delay phase)
  startTpm:       number
  startColor:     number
  baselineSet:    boolean
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// ── ScriptRunner ───────────────────────────────────────────────────────────
class ScriptRunner extends EventEmitter {
  private current: RunningScript | null = null

  start(name: ScriptName): void {
    this._stop()  // cancel any currently-running script first

    const state = stateManager.get()
    this.current = {
      name,
      startTime:      Date.now(),
      currentPhase:   'delay',
      intervalHandle: setInterval(() => this._tick(), TICK_MS),
      startTpm:       state.tpm,
      startColor:     state.colorIndex,
      baselineSet:    false,
    }
    this._emitStatus()
  }

  cancel(): void {
    if (!this.current) return
    this._stop()
    this.emit('status', null)
  }

  getStatus(): ScriptStatus | null {
    if (!this.current) return null
    return {
      name:    this.current.name,
      phase:   this.current.currentPhase,
      elapsed: Math.min(Date.now() - this.current.startTime, TOTAL_MS),
      total:   TOTAL_MS,
    }
  }

  // ── private ──────────────────────────────────────────────────────────────

  private _stop(): void {
    if (!this.current) return
    clearInterval(this.current.intervalHandle)
    stateManager.setUserInteractingWithTpm(false)
    this.current = null
  }

  private _tick(): void {
    if (!this.current) return

    const elapsed = Date.now() - this.current.startTime
    const target  = this.current.name === 'make_pure' ? PURE_TARGET : DIRTY_TARGET

    if (elapsed < SCRIPT_TIMING.DELAY_MS) {
      // ── Phase 1: Delay ───────────────────────────────────────────────────
      // Normal fluctuation runs; user sees the current dashboard state.
      this.current.currentPhase = 'delay'
      stateManager.setUserInteractingWithTpm(false)

    } else if (elapsed < SCRIPT_TIMING.DELAY_MS + SCRIPT_TIMING.TRANSITION_MS) {
      // ── Phase 2: Transitioning ───────────────────────────────────────────
      if (this.current.currentPhase !== 'transitioning') {
        this.current.currentPhase = 'transitioning'
        // Re-capture current values now that fluctuation may have moved them
        const snap = stateManager.get()
        this.current.startTpm   = snap.tpm
        this.current.startColor = snap.colorIndex
      }

      // Suppress fluctuation so the interpolation is clean
      stateManager.setUserInteractingWithTpm(true)

      const t      = (elapsed - SCRIPT_TIMING.DELAY_MS) / SCRIPT_TIMING.TRANSITION_MS
      const smooth = smoothstep(Math.max(0, Math.min(1, t)))
      const tpm    = lerp(this.current.startTpm, target.tpm, smooth)
      const color  = Math.round(lerp(this.current.startColor, target.color, smooth))

      stateManager.update({ tpm, colorIndex: color })

    } else if (elapsed < TOTAL_MS) {
      // ── Phase 3: Settled ─────────────────────────────────────────────────
      if (this.current.currentPhase !== 'settled') {
        this.current.currentPhase = 'settled'
      }

      if (!this.current.baselineSet) {
        this.current.baselineSet = true
        // Anchor baseline so fluctuation drifts around the target, not the old value
        stateManager.setTpmBaseline(target.tpm)
        stateManager.update({ tpm: target.tpm, colorIndex: target.color })
        stateManager.setUserInteractingWithTpm(false)
      }

    } else {
      // ── Script complete ───────────────────────────────────────────────────
      this._stop()
      this.emit('status', null)
      return
    }

    this._emitStatus()
  }

  private _emitStatus(): void {
    this.emit('status', this.getStatus())
  }
}

export const scriptRunner = new ScriptRunner()
