import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { appState } from '@/stores/appState'

ComponentWithStore({
  storeBindings: {
    store: appState,
    fields: [] as const,
    actions: ['setShowScreenFloatPanel'] as const,
  },
  methods: {
    handleButtonTap() {
      console.log('handleButtonTap')
      this.setShowScreenFloatPanel(true)
    },
  },
})
