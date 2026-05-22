import EventEmitter from 'events'
import { OilHealthState, DEFAULT_STATE } from '../shared/types'

class StateManager extends EventEmitter {
  private _state: OilHealthState = { ...DEFAULT_STATE }

  // Tracks the user's last explicitly-set TPM value.
  // The fluctuation timer drifts toward this, so TPM never wanders far.
  private _tpmBaseline: number = DEFAULT_STATE.tpm

  // True while the operator is actively dragging the TPM slider.
  // The fluctuation timer skips its tick while this is set.
  private _userInteractingWithTpm = false

  get(): OilHealthState {
    return { ...this._state }
  }

  /** Apply a partial update and emit 'changed' with the new full state. */
  update(partial: Partial<OilHealthState>): void {
    this._state = { ...this._state, ...partial }
    this.emit('changed', this.get())
  }

  /** Seed initial state from disk without emitting — call once before windows open. */
  load(saved: OilHealthState): void {
    this._state = { ...saved }
    this._tpmBaseline = saved.tpm
  }

  getTpmBaseline(): number { return this._tpmBaseline }
  setTpmBaseline(v: number): void { this._tpmBaseline = v }

  isUserInteractingWithTpm(): boolean { return this._userInteractingWithTpm }
  setUserInteractingWithTpm(v: boolean): void { this._userInteractingWithTpm = v }
}

export const stateManager = new StateManager()
