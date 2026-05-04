export enum ScreenDevice {
  Phone = 1,
  Pad = 2,
  Computer = 3,
}

export enum ScreenSystem {
  Other = 0,
  iOS = 1,
  Android = 2,
  HarmonyOS = 3,
  Windows = 4,
  Mac = 5,
}

export interface ScreenMeta {
  serviceUuid: string
  device: ScreenDevice
  system: ScreenSystem
  screenMax: number
  screenMin: number
  displayName: string
  nickName: string
}