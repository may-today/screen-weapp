import type { ScreenMeta } from '@/types/device'

export enum ConnectStatus {
  Disabled = -1,
  Disconnected = 0,
  Connecting = 1,
  Authorizing = 2,
  Connected = 3,
}

export interface ScreenConnectionState {
  deviceId: string
  serviceUuid: string
  meta: ScreenMeta | null
  status: ConnectStatus
  mtu: number
  rssi: number | null
  lastHeartbeatAt: number
  reconnectRetryCount: number
  watchdogTimer: ReturnType<typeof setInterval> | null
  chunkBuffer: Map<string, ArrayBuffer[]>
}
