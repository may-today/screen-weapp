import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { data } from '@/stores/data'
import type { SongDetail } from '@/types'

const datasetDict = {
  mayday: {
    name: '五月天',
    downUrl: 'https://wx-static.ddiu.site/dataset/mayday.json',
  },
  jayzhou: {
    name: '周杰伦',
    downUrl: 'https://wx-static.ddiu.site/dataset/jayzhou.json',
  },
  jjlin: {
    name: '林俊杰',
    downUrl: 'https://wx-static.ddiu.site/dataset/jjlin.json',
  },
  fhcq: {
    name: '凤凰传奇',
    downUrl: 'https://wx-static.ddiu.site/dataset/fhcq.json',
  },
} as Record<
  string,
  {
    name: string
    downUrl: string
  }
>

const dataset = Object.entries(datasetDict).map(([key, item]) => ({
  id: key,
  ...item,
}))

ComponentWithStore({
  data: {
    dataset,
    cacheKeys: [] as string[],
  },
  properties: {
    hidden: {
      type: Boolean,
      value: false,
    },
  },
  storeBindings: {
    store: data,
    fields: ['currentDatasetId', 'currentDatasetName'] as const,
    actions: ['saveDetailList'] as const,
  },
  lifetimes: {
    created() {
      this.refreshCacheKeys()
    },
  },
  methods: {
    handleSelect(e: WechatMiniprogram.CustomEvent) {
      const { id } = e.currentTarget.dataset
      this.handleSetList(id)
    },
    handleSetList(id: string) {
      if (id && !datasetDict[id]) {
        return
      }
      // read cache
      if (this.data.cacheKeys.includes(id)) {
        const detailList = wx.getStorageSync<SongDetail[]>(`dataset:${id}`)
        if (Array.isArray(detailList)) {
          this.saveDetailList(detailList, {
            id,
            name: datasetDict[id].name,
          })
          return
        }
      }
      wx.showLoading({
        title: '加载中',
      })
      wx.request({
        url: datasetDict[id].downUrl,
        success: async (res) => {
          wx.hideLoading()
          if (Array.isArray(res.data)) {
            this.saveDetailList(res.data, {
              id,
              name: datasetDict[id].name,
            })
            await wx.setStorage({
              key: `dataset:${id}`,
              data: res.data,
            })
            this.refreshCacheKeys()
          }
        },
        fail: (err) => {
          wx.showToast({
            title: '加载失败',
            icon: 'error',
          })
          console.log('request failed', err)
        },
      })
    },
    async refreshCacheKeys() {
      const storageInfo = await wx.getStorageInfo()
      const storageKeys = storageInfo.keys
      const datasetKeys = storageKeys
        .filter((key) => key.startsWith('dataset:'))
        .map((key) => key.replace('dataset:', ''))
      this.setData({
        cacheKeys: datasetKeys,
      })
    },
    handleResetDataset() {
      this.saveDetailList([])
    },
  },
})
