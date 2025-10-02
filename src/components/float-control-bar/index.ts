import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { appState } from '@/stores/appState'
import { data } from '@/stores/data'

type ControlBarButtonAction = 'prev' | 'next' | 'menu'

const buttonList = [
  { id: 'prev', iconClass: 'i-lucide-chevron-left' },
  { id: 'next', iconClass: 'i-lucide-chevron-right' },
  { id: 'menu', iconClass: 'i-lucide-menu' },
] satisfies {
  id: ControlBarButtonAction
  iconClass: string
}[]

ComponentWithStore({
  data: {
    buttonList,
  },
  storeBindings: {
    store: appState,
    fields: [] as const,
    actions: [] as const,
  },
  methods: {
    handleButtonTap(e: WechatMiniprogram.TouchEvent) {
      const action: ControlBarButtonAction = e.currentTarget.dataset.action
      wx.vibrateShort({ type: 'light' })
      if (action === 'menu') {
        return appState.setShowScreenFloatPanel(true)
      }
      if (action === 'prev') {
        return data.prevLyricLine()
      }
      if (action === 'next') {
        return data.nextLyricLine()
      }
    },
  },
})
