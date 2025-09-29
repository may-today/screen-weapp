import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { data } from '@/stores/data'

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
  storeBindings: {
    store: data,
    fields: [] as const,
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
      console.log('handleSelect', id)
      this.handleSetList(id)
    },
    handleSetList(id: string) {
      if (!datasetDict[id]) {
        return
      }
      wx.request({
        url: datasetDict[id].downUrl,
        success: async (res) => {
          if (Array.isArray(res.data)) {
            this.saveDetailList(res.data)
            await wx.setStorage({
              key: `dataset:${id}`,
              data: res.data,
            })
            this.refreshCacheKeys()
          }
        },
        fail: (err) => {
          console.log('request failed', err)
        },
      })
    },
    async refreshCacheKeys() {
      const storageInfo = await wx.getStorageInfo()
      console.log('storageInfo', storageInfo)
      const storageKeys = storageInfo.keys
      const datasetKeys = storageKeys
        .filter((key) => key.startsWith('dataset:'))
        .map((key) => key.replace('dataset:', ''))
      console.log('datasetKeys', datasetKeys)
      this.setData({
        cacheKeys: datasetKeys,
      })
    },
  },
})
