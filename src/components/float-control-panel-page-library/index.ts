import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { data } from '@/stores/data'

ComponentWithStore({
  data: {
    currentTab: 'song-list' as 'song-list' | 'web-search',
  },
  storeBindings: {
    store: data,
    fields: [] as const,
    actions: ['saveDetailList'] as const,
  },
  methods: {
    handleTabTap(e: WechatMiniprogram.CustomEvent) {
      const { tab } = e.currentTarget.dataset
      console.log('handleTabTap', e.currentTarget.dataset)
      this.setData({
        currentTab: tab,
      })
    },
    handleSetList() {
      wx.request({
        url: 'https://wx-static.ddiu.site/dataset/mayday.json',
        success: (res) => {
          if (Array.isArray(res.data)) {
            this.saveDetailList(res.data)
          }
        },
        fail: (err) => {
          console.log('request failed', err)
        },
      })
    },
  },
})
