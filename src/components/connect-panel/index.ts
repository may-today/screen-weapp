import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { appState } from '@/stores/appState'
import type { BleRemote } from '@/utils/bleRemote'
import { getDeviceInfoFromUuid } from '@/utils/uuid'

interface Data {
  device: WechatMiniprogram.BlueToothDevice | null
  parsedDeviceInfo: ReturnType<typeof getDeviceInfoFromUuid>
}

ComponentWithStore({
  options: {
    pureDataPattern: /^_/,
  },
  properties: {
    device: {
      type: Object,
      value: {},
    },
  },
  data: <Data>{
    parsedDeviceInfo: null,
  },
  observers: {
    device(device) {
      if (device?.advertisServiceUUIDs?.length === 1) {
        const deviceInfo = getDeviceInfoFromUuid(device.advertisServiceUUIDs[0])
        this.setData({
          parsedDeviceInfo: deviceInfo,
        })
      } else {
        this.setData({
          parsedDeviceInfo: null,
        })
      }
    },
  },
  storeBindings: {
    store: appState,
    fields: ['showConnectPanel', 'connectStatus'] as const,
    actions: [] as const,
  },
  methods: {
    handleDialogClose() {
      appState.setShowConnectPanel(false)
    },
    handleClickConnectButton() {
      if (!this.data.device) {
        return
      }
      const bleInstance = getApp().globalData.bleRemote as BleRemote
      bleInstance.connectDevice(this.data.device.deviceId)
    },
    handleClickConfirmButton() {
      this.setShowConnectPanel(false)
      setTimeout(() => {
        this.triggerEvent('connect')
      }, 200)
    },
  },
})
