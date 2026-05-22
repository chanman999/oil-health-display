// Shared types between main and renderer processes

export interface SerialDevice {
  path: string
  manufacturer?: string
  serialNumber?: string
  pnpId?: string
  locationId?: string
  vendorId?: string
  productId?: string
}

export interface AppState {
  devices: SerialDevice[]
}
