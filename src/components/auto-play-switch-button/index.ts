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
    fields: ['autoPlay', 'currentTime'] as const,
    actions: [] as const,
  },
  methods: {
    handleButtonTap() {
      wx.vibrateShort({ type: 'light' })
      timeServer.prepare()
      if (this.data.autoPlay) {
        timeServer.pause()
      } else {
        timeServer.start()
      }
    },
  },
})
