import { create } from 'zustand'
import { OilHealthState, DEFAULT_STATE } from '../../../shared/types'

/**
 * Read-only local cache of main-process state.
 * Controls call window.api.updateState() — never mutate this directly.
 */
export const useStore = create<OilHealthState>(() => ({ ...DEFAULT_STATE }))
