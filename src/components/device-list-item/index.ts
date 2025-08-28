import type { BleRemote } from '@/utils/bleRemote'

type Data = {
  device: WechatMiniprogram.BlueToothDevice
  _bleInstance: BleRemote
}

Component({
  options: {
    pureDataPattern: /^_/
  },
  properties: {
    device: {
      type: Object,
      value: {},
    },
  },
  data: <Data>{
    _bleInstance: getApp().globalData.bleRemote as BleRemote,
  },
  methods: {
    handleConnect(e: WechatMiniprogram.CustomEvent<{ deviceId: string }>) {
      const deviceId = e.currentTarget.dataset?.deviceId
      if (!deviceId) {
        return
      }
      const bleInstance = getApp().globalData.bleRemote as BleRemote
      bleInstance.connectDevice(deviceId)
    },
  },
})