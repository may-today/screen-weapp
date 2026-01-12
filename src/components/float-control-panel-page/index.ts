import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { appState } from '@/stores/appState'

ComponentWithStore({
  options: {
    pureDataPattern: /^_/,
    multipleSlots: true,
  },
  properties: {
    title: {
      type: String,
      value: '',
    },
    hidden: {
      type: Boolean,
      value: false,
    },
  },
  storeBindings: {
    store: appState,
    fields: ['globalLoading'] as const,
    actions: [] as const,
  },
})
