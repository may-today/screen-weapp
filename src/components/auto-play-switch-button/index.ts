import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { data } from '@/stores/data'
import { timeServer } from '@/utils/timeServer'

ComponentWithStore({
  options: {
    pureDataPattern: /^_/,
  },
  data: {},
  storeBindings: {
    store: data,
    fields: ['autoPlay', 'currentTime', 'supportAutoPlay'] as const,
    actions: [] as const,
  },
  methods: {
    handleButtonTap() {
      if (!this.data.supportAutoPlay) {
        return
      }
      wx.vibrateShort({ type: 'light' })
      if (this.data.autoPlay) {
        timeServer.pause()
      } else {
        timeServer.start()
      }
    },
  },
})
