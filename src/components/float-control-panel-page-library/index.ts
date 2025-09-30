import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { data } from '@/stores/data'

ComponentWithStore({
  data: {
    currentTab: 'song-list' as 'song-list' | 'web-search',
  },
  storeBindings: {
    store: data,
    fields: [] as const,
    actions: [] as const,
  },
  methods: {
    handleTabTap(e: WechatMiniprogram.CustomEvent) {
      const { tab } = e.currentTarget.dataset
      console.log('handleTabTap', e.currentTarget.dataset)
      this.setData({
        currentTab: tab,
      })
    },
  },
})
