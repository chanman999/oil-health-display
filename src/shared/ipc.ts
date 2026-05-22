// IPC channel names — single source of truth used by main, preload, and renderers.
export const IPC = {
  STATE_GET:     'state:get',      // renderer → main (invoke), returns OilHealthState
  STATE_UPDATE:  'state:update',   // renderer → main (send), payload: Partial<OilHealthState>
  STATE_CHANGED: 'state:changed',  // main → all renderers (send), payload: OilHealthState
  OPERATOR_OPEN: 'operator:open',  // renderer → main (send), open/focus operator window
} as const
