import { create } from 'zustand'
import { OilHealthState, DEFAULT_STATE } from '../../../shared/types'

/**
 * Read-only local cache of main-process state.
 * Never mutate directly — call window.api.updateState() to request changes.
 * Seeded and kept in sync by bootstrap() in main.tsx.
 */
export const useStore = create<OilHealthState>(() => ({ ...DEFAULT_STATE }))
