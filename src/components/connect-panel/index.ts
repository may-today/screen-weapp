import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { appState } from '@/stores/appState'
import { getDeviceInfoFromUuid } from '@/utils/uuid'

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
    fields: ['showConnectPanel'] as const,
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
      this.setShowConnectPanel(false)
    },
  },
})
