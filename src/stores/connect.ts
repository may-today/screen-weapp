import { defineStore, ref } from 'wevu'
import type { ScreenMeta } from '@/types/device'
import { ConnectStatus } from '@/types/connect'

export interface RemoteMeta {
  nickName: string
  deviceId?: string
  connectedAt: number
}

export const useConnectStore = defineStore('connect', () => {
  // const currentScreenMeta = ref<ScreenMeta | null>(null)
  const currentScreenMeta = ref<ScreenMeta | null>(null)
  const currentRemoteMeta = ref<RemoteMeta | null>(null)

  const connectStatus = ref<ConnectStatus>(ConnectStatus.Disabled)
  const rssi = ref<number | null>(null)
  // const bleRemote = ref<BleRemote | null>(null)
  // const bleScreen = ref<BleScreen | null>(null)

  const $reset = () => {
    currentScreenMeta.value = null
    currentRemoteMeta.value = null
    connectStatus.value = ConnectStatus.Disconnected
    rssi.value = null
  }
  const setCurrentScreenMeta = (meta: ScreenMeta | null) => {
    currentScreenMeta.value = meta
  }
  const setCurrentRemoteMeta = (meta: RemoteMeta | null) => {
    currentRemoteMeta.value = meta
  }
  const setConnectStatus = (status: ConnectStatus) => {
    connectStatus.value = status
  }
  const setRssi = (val: number | null) => {
    rssi.value = val
  }
  // const createBleRemote = () => {
  //   if (!bleRemote.value) {
  //     bleRemote.value = new BleRemote()
  //   }
  // }
  // const createBleScreen = () => {
  //   if (!bleScreen.value) {
  //     bleScreen.value = new BleScreen()
  //   }
  // }
  return {
    // bleRemote,
    // bleScreen,
    currentScreenMeta,
    currentRemoteMeta,
    connectStatus,
    rssi,
    $reset,
    setCurrentScreenMeta,
    setCurrentRemoteMeta,
    setConnectStatus,
    setRssi,
    // createBleRemote,
    // createBleScreen
  }
})
