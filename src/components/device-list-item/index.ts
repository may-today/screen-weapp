import { ComponentWithComputed } from 'miniprogram-computed'
import { getDeviceInfoFromUuid } from '@/utils/uuid'

interface Data {
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
    handleClickConnectButton(_e: WechatMiniprogram.CustomEvent) {
      this.triggerEvent('select', { deviceId: this.data.device.deviceId })
    },
  },
})
