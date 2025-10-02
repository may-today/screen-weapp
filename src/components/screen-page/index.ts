import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { data } from '@/stores/data'

ComponentWithStore({
  data: {
    someData: '...',
  },
  storeBindings: {
    store: data,
    fields: ['currentSongData', 'currentLyricLine', 'currentLyricIndex'] as const,
    actions: {} as const,
  },
})