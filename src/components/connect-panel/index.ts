import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { appState } from '@/stores/appState'
import { getDeviceInfoFromUuid } from '@/utils/uuid'
import type { BleRemote } from '@/utils/bleRemote'

type Data = {
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
    'device': function (device) {
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
    actions: ['setShowConnectPanel'] as const,
    // actions: {
    //   buttonTap: 'update',
    // } as const,
  },
  methods: {
    handleDialogClose() {
      this.setShowConnectPanel(false)
    },
    handleClickConnectButton() {
      if (!this.data.device) return
      const bleInstance = getApp().globalData.bleRemote as BleRemote
      bleInstance.connectDevice(this.data.device.deviceId)
    },
    async handleClickConfirmButton() {
      this.setShowConnectPanel(false)
      setTimeout(() => {
        this.triggerEvent('connect')
      }, 200)
    },
  },
})
