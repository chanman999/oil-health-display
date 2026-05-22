import EventEmitter from 'events'
import { OilHealthState, DEFAULT_STATE } from '../shared/types'

class StateManager extends EventEmitter {
  private _state: OilHealthState = { ...DEFAULT_STATE }

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
  }
}

export const stateManager = new StateManager()
