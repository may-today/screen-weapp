import { ComponentWithComputed } from 'miniprogram-computed'
import { appState } from '@/stores/appState'

interface Data {
  list: WechatMiniprogram.BlueToothDevice[]
  // connectingDevice: WechatMiniprogram.BlueToothDevice | null
  connectingDeviceId: string | null
}

ComponentWithComputed({
  options: {
    pureDataPattern: /^_/,
  },
  properties: {
    list: {
      type: Array,
      value: <Data['list']>[],
    },
  },
  computed: {
    connectingDevice(data): WechatMiniprogram.BlueToothDevice | null {
      if (!data.connectingDeviceId) {
        return null
      }
      const device = data.list.find((item) => item.deviceId === data.connectingDeviceId)
      return device || null
    },
  },
  data: <Data>{},
  methods: {
    handleSelectItem(e: WechatMiniprogram.CustomEvent<{ deviceId: string }>) {
      this.setData({
        connectingDeviceId: e.detail.deviceId,
      })
      appState.setShowConnectPanel(true)
    },
    handleConnectSuccess() {
      this.triggerEvent('connect')
    },
  },
})
