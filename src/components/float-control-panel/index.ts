import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { appState } from '@/stores/appState'

ComponentWithStore({
  storeBindings: {
    store: appState,
    fields: ['showScreenFloatPanel'] as const,
    actions: ['setShowScreenFloatPanel'] as const,
    // actions: {
    //   buttonTap: 'update',
    // } as const,
  },
  methods: {
    handleAfterLeave() {
      console.log('handleAfterLeave')
      this.setShowScreenFloatPanel(false)
    },
    handleCloseButtonTap() {
      this.setShowScreenFloatPanel(false)
    },
  },
})
