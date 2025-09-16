import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { appState } from '@/stores/appState'

ComponentWithStore({
  data: {
    headerHeight: 0,
    rightMargin: 0,
  },
  storeBindings: {
    store: appState,
    fields: ['showScreenFloatPanel'] as const,
    actions: ['setShowScreenFloatPanel'] as const,
    // actions: {
    //   buttonTap: 'update',
    // } as const,
  },
  lifetimes: {
    attached() {
      this.calculateHeaderStyle()
    },
  },
  methods: {
    calculateHeaderStyle() {
      const menuRect = wx.getMenuButtonBoundingClientRect()
      const windowInfo = wx.getWindowInfo()
      this.setData({
        headerHeight: menuRect.top * 2 + menuRect.height,
        rightMargin: Math.max(windowInfo.windowWidth, windowInfo.windowHeight) - menuRect.left,
      })
    },
    handleAfterLeave() {
      console.log('handleAfterLeave')
      this.setShowScreenFloatPanel(false)
    },
    handleCloseButtonTap() {
      this.setShowScreenFloatPanel(false)
    },
  },
})
