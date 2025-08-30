import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { appState } from '@/stores/appState'

ComponentWithStore({
  storeBindings: {
    store: appState,
    fields: ['showConnectPanel'] as const,
    actions: ['setShowConnectPanel'] as const,
    // actions: {
    //   buttonTap: 'update',
    // } as const,
  },
  methods: {
    handleAfterLeave() {
      console.log('handleAfterLeave')
      this.setShowConnectPanel(false)
    },
    handleCloseButtonTap() {
      this.setShowConnectPanel(false)
    },
  },
})
