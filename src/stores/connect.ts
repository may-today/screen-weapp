import { defineStore, ref } from 'wevu'
import type { ScreenMeta } from '@/types/device'
import { ConnectStatus } from '@/types/connect'
import { BleRemote } from '@/utils/bleRemote'
import { BleScreen } from '@/utils/bleScreen'

export const useConnectStore = defineStore('connect', () => {
  // const currentScreenMeta = ref<ScreenMeta | null>(null)
  const currentScreenMeta = ref<ScreenMeta | null>({
    serviceUuid: '19970329-0000-0000-0000-000000000000',
    device: 1,
    system: 1,
    screenMax: 0,
    screenMin: 0,
    displayName: 'iPhone 6',
  })

  const connectStatus = ref<ConnectStatus>(ConnectStatus.Disabled)
  // const bleRemote = ref<BleRemote | null>(null)
  // const bleScreen = ref<BleScreen | null>(null)

  const $reset = () => {
    currentScreenMeta.value = null
    connectStatus.value = ConnectStatus.Disconnected
  }
  const setCurrentScreenMeta = (meta: ScreenMeta | null) => {
    currentScreenMeta.value = meta
  }
  const setConnectStatus = (status: ConnectStatus) => {
    connectStatus.value = status
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
    connectStatus,
    $reset,
    setCurrentScreenMeta,
    setConnectStatus,
    // createBleRemote,
    // createBleScreen
  }
})

