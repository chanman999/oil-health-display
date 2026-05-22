import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { OilHealthState, OilStatus, DEFAULT_STATE } from '../../../shared/types'

// Keys excluded from localStorage — runtime-only state
type PersistedState = Omit<OilHealthState, 'boardDetected'>

interface OilStore extends OilHealthState {
  setTpm: (tpm: number) => void
  setTemperatureF: (temperatureF: number) => void
  setColorIndex: (colorIndex: number) => void
  setHoursOfUse: (hoursOfUse: number) => void
  setStatus: (status: OilStatus) => void
  setStatusMode: (statusMode: OilHealthState['statusMode']) => void
  setBoardDetected: (boardDetected: boolean) => void
  setConnectionOverride: (connectionOverride: OilHealthState['connectionOverride']) => void
}

export const useOilStore = create<OilStore>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setTpm: (tpm) => set({ tpm }),
      setTemperatureF: (temperatureF) => set({ temperatureF }),
      setColorIndex: (colorIndex) => set({ colorIndex }),
      setHoursOfUse: (hoursOfUse) => set({ hoursOfUse }),
      setStatus: (status) => set({ status }),
      setStatusMode: (statusMode) => set({ statusMode }),
      setBoardDetected: (boardDetected) => set({ boardDetected }),
      setConnectionOverride: (connectionOverride) => set({ connectionOverride }),
    }),
    {
      name: 'oil-health-state',
      // Persist everything except boardDetected (runtime-only)
      partialize: (state): PersistedState => {
        const { boardDetected: _boardDetected, ...persisted } = state
        return persisted
      },
    }
  )
)

export function getEffectiveStatus(state: OilHealthState): OilStatus {
  if (state.statusMode === 'manual') return state.status
  if (state.tpm < 18) return 'good'
  if (state.tpm <= 25) return 'monitor'
  return 'change_now'
}

export function getEffectiveConnection(state: OilHealthState): boolean {
  return state.boardDetected && state.connectionOverride === 'auto'
}
