import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { data } from '@/stores/data'
import { getTrackListByKeyword, getLyricBySongId } from '@/utils/webSearch'
import { parseRawLRCFile } from '@/utils/lyric'
import type { SongDetail } from '@/types'

export interface WebSearchTrackItem {
  id: string
  song_name: string
  song_name_original: string
  album_name: string
  artist: string
  duration: number
}

type Data = {
  searchInputValue: string
  webSearchResultList: WebSearchTrackItem[]
}

ComponentWithStore({
  options: {
    pureDataPattern: /^_/,
  },
  data: <Data>{
    searchInputValue: '',
    webSearchResultList: [] as WebSearchTrackItem[],
  },
  storeBindings: {
    store: data,
    fields: [] as const,
    actions: [] as const,
  },
  methods: {
    async handleSearch(event: WechatMiniprogram.Input) {
      const searchValue = event.detail.value.trim()
      const trackList = await getTrackListByKeyword(searchValue)
      this.setData({
        webSearchResultList: trackList,
      })
    },
    handleClearSearch() {
      this.setData({
        searchInputValue: '',
        webSearchResultList: [],
      })
    },
    handleSearchValueChange(event: WechatMiniprogram.Input) {
      const searchValue = event.detail.value.trim()
      this.setData({
        searchInputValue: searchValue,
      })
    },
    async handleSelectSong(event: WechatMiniprogram.CustomEvent) {
      const item = event.currentTarget.dataset.item as WebSearchTrackItem
      const lyricText = await getLyricBySongId(item.id).catch(() => null)
      if (!lyricText) {
        wx.showToast({
          title: '加载失败',
          icon: 'error',
        })
        return
      }
      this.setData({
        lyricText,
      })
      const singleTrack: SongDetail = {
        title: item.song_name,
        slug: item.id,
        index: '',
        meta: {
          artist: item.artist,
        },
        detail: parseRawLRCFile(lyricText),
      }
      data.setCurrentSongData(singleTrack)
    },
  },
})
