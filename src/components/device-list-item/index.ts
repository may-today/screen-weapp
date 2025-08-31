import { ComponentWithComputed } from 'miniprogram-computed'
import type { BleRemote } from '@/utils/bleRemote'
import { appState } from '@/stores/appState'
import { getDeviceInfoFromUuid } from '@/utils/uuid'

type Data = {
  device: WechatMiniprogram.BlueToothDevice
}

ComponentWithComputed({
  options: {
    pureDataPattern: /^_/,
  },
  properties: {
    device: {
      type: Object,
      value: {},
    },
  },
  data: <Data>{},
  computed: {
    parsedDeviceInfo(data): ReturnType<typeof getDeviceInfoFromUuid> {
      if (data.device?.advertisServiceUUIDs?.length === 1) {
        const deviceInfo = getDeviceInfoFromUuid(data.device.advertisServiceUUIDs[0])
        return deviceInfo
      }
      return null
    },
  },
  methods: {
    handleClickConnectButton(e: WechatMiniprogram.CustomEvent) {
      // const bleInstance = getApp().globalData.bleRemote as BleRemote
      // bleInstance.connectDevice(deviceId)
      this.triggerEvent('select', { deviceId: this.data.device.deviceId })
    },
  },
})
