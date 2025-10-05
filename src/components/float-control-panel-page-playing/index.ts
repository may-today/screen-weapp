import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { data } from '@/stores/data'

ComponentWithStore({
  data: {},
  storeBindings: {
    store: data,
    fields: ['currentSongData', 'currentLyricIndex'] as const,
    actions: [] as const,
  },
  methods: {
    handleLyricLineTap(e: WechatMiniprogram.TouchEvent) {
      const { index, time } = e.currentTarget.dataset
      if (typeof index === 'number') {
        data.setCurrentLyricIndex(index, time)
      }
    },
  },
})
