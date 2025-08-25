import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { appState } from '@/stores/appState'

ComponentWithStore({
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
