import { ComponentWithComputed } from 'miniprogram-computed'
import type { BleRemote } from '@/utils/bleRemote'
import { appState } from '@/stores/appState'
import { getDeviceInfoFromUuid } from '@/utils/uuid'

type Data = {
  device: WechatMiniprogram.BlueToothDevice
  _bleInstance: BleRemote
}

ComponentWithComputed({
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
    handleClickConnectButton(e: WechatMiniprogram.CustomEvent<{ deviceId: string }>) {
      const deviceId = e.currentTarget.dataset?.deviceId
      if (!deviceId) {
        return
      }

      // const bleInstance = getApp().globalData.bleRemote as BleRemote
      // bleInstance.connectDevice(deviceId)
      appState.setShowConnectPanel(true)
    },
  },
})