export type OilStatus = 'good' | 'monitor' | 'change_now';

export interface OilHealthState {
  tpm: number;              // Total Polar Materials, 0–40 (%)
  temperatureF: number;     // 250–400 °F
  colorIndex: number;       // 1–10 (1=pale yellow, 10=dark brown)
  hoursOfUse: number;       // hours since last oil change
  status: OilStatus;        // derived or manually set
  statusMode: 'auto' | 'manual';  // auto = derive from TPM
  boardDetected: boolean;   // is an Arduino plugged in via USB?
  connectionOverride: 'auto' | 'force_disconnected';
}

export const DEFAULT_STATE: OilHealthState = {
  tpm: 8,
  temperatureF: 350,
  colorIndex: 2,
  hoursOfUse: 0,
  status: 'good',
  statusMode: 'auto',
  boardDetected: false,
  connectionOverride: 'auto',
};

export function getEffectiveStatus(state: OilHealthState): OilStatus {
  if (state.statusMode === 'manual') return state.status;
  if (state.tpm < 18) return 'good';
  if (state.tpm <= 25) return 'monitor';
  return 'change_now';
}

export function getEffectiveConnection(state: OilHealthState): boolean {
  return state.boardDetected && state.connectionOverride === 'auto';
}
