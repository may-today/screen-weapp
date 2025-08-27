import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { appState } from '@/stores/appState'

type Data = {
  list: WechatMiniprogram.BlueToothDevice[]
}

ComponentWithStore({
  properties: {
    list: {
      type: Array,
      value: <Data['list']>[],
    },
  },
  data: <Data>{},
  storeBindings: {
    store: appState,
    fields: ['deviceId'] as const,
    actions: ['setDeviceId'] as const,
    // actions: {
    //   buttonTap: 'update',
    // } as const,
  },
  methods: {
    handleButtonTap() {
      this.setDeviceId('aaaaaaa')
    },
  },
})
