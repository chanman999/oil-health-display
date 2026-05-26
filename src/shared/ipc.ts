// IPC channel names — single source of truth used by main, preload, and renderers.
export const IPC = {
  STATE_GET:     'state:get',      // renderer → main (invoke), returns OilHealthState
  STATE_UPDATE:  'state:update',   // renderer → main (send), payload: Partial<OilHealthState>
  STATE_CHANGED: 'state:changed',  // main → all renderers (send), payload: OilHealthState
  OPERATOR_OPEN: 'operator:open',  // renderer → main (send), open/focus operator window
  TPM_INTERACT:         'tpm:interact',        // renderer → main (send), payload: boolean — drag start/end
  CONNECTION_DETECTED:  'connection:detected',  // main → dashboard only (send), no payload
  SCRIPT_RUN:        'script:run',         // renderer → main (send), payload: ScriptName
  SCRIPT_CANCEL:     'script:cancel',      // renderer → main (send)
  SCRIPT_STATUS:     'script:status',      // main → operator only (send), payload: ScriptStatus | null
  SCRIPT_STATUS_GET: 'script:status:get',  // renderer → main (invoke), returns ScriptStatus | null
} as const
