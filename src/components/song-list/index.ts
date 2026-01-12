import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { data } from '@/stores/data'
import type { SearchItem } from '@/types'
import { hooks } from '@/utils/hook'
import { searchByString } from '@/utils/songList'

interface Data {
  searchInputValue: string
  filteredList: SearchItem[]
}

ComponentWithStore({
  options: {
    pureDataPattern: /^_/,
  },
  data: <Data>{
    searchInputValue: '',
    filteredList: [] as SearchItem[],
  },
  storeBindings: {
    store: data,
    fields: ['metaGroupList', 'allDataList', 'allDataDict', 'currentSongData'] as const,
    actions: [] as const,
  },
  methods: {
    handleSearch(event: WechatMiniprogram.Input) {
      const searchValue = event.detail.value.trim()
      this.setData({
        filteredList: searchByString(searchValue, this.data.allDataList),
      })
    },
    handleClearSearch() {
      this.setData({
        searchInputValue: '',
        filteredList: [],
      })
    },
    handleSearchValueChange(event: WechatMiniprogram.Input) {
      const searchValue = event.detail.value.trim()
      this.setData({
        searchInputValue: searchValue,
      })
    },
    handleSelectSong(event: WechatMiniprogram.CustomEvent) {
      const slug = (event.currentTarget.dataset.slug as string) || ''
      const songData = this.data.allDataDict[slug] || null
      data.setCurrentSongData(songData)
      hooks.callHook('trigger-tab', { tab: 'playing' })
    },
  },
})
