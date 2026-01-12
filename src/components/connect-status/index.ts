import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { appState } from '@/stores/appState'

ComponentWithStore({
  data: {
    someData: '...',
  },
  storeBindings: {
    store: appState,
    fields: ['connected', 'deviceId'] as const,
    actions: {} as const,
  },
})
