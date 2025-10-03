import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { appState } from '@/stores/appState'
import { hooks } from '@/utils/hook'

ComponentWithStore({
  options: {
    pureDataPattern: /^_/,
  },
  data: {
    headerHeight: 0,
    rightMargin: 0,
    currentTab: 'playing',
    _triggerTabEventHandler: null as any,
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
      // 绑定方法以确保 this 指向正确
      this.data._triggerTabEventHandler = this.handleTriggerTab.bind(this)
      hooks.hook('trigger-tab', this.data._triggerTabEventHandler)
    },
    detached() {
      hooks.removeHook('trigger-tab', this.data._triggerTabEventHandler)
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
      this.setShowScreenFloatPanel(false)
    },
    handleCloseButtonTap() {
      this.setShowScreenFloatPanel(false)
    },
    handleTabTap(e: WechatMiniprogram.CustomEvent) {
      const { tab } = e.currentTarget.dataset
      this.setData({
        currentTab: tab,
      })
    },
    handleTriggerTab(payload: { tab: string }) {
      this.setData({
        currentTab: payload.tab,
      })
    },
  },
})
