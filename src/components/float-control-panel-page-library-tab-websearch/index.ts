import { data } from '@/stores/data'
import { getTrackListByKeyword, getLyricBySongId } from '@/utils/webSearch'
import { parseRawLRCFile } from '@/utils/lyric'
import { hooks } from '@/utils/hook'
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

Component({
  options: {
    pureDataPattern: /^_/,
  },
  data: <Data>{
    searchInputValue: '',
    webSearchResultList: [] as WebSearchTrackItem[],
    searching: false,
  },
  methods: {
    async handleSearch(event: WechatMiniprogram.Input) {
      const searchValue = event.detail.value.trim()
      this.setData({
        searching: true,
      })
      const trackList = await getTrackListByKeyword(searchValue)
      this.setData({
        webSearchResultList: trackList,
        searching: false,
      })
    },
    handleClearSearch() {
      this.setData({
        searchInputValue: '',
        webSearchResultList: [],
        searching: false,
      })
    },
    handleSearchValueChange(event: WechatMiniprogram.Input) {
      const searchValue = event.detail.value.trim()
      this.setData({
        searchInputValue: searchValue,
        webSearchResultList: [],
        searching: false,
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
          length: item.duration,
          album: item.album_name,
        },
        detail: parseRawLRCFile(lyricText),
      }
      data.setCurrentSongData(singleTrack)
      hooks.callHook('trigger-tab', { tab: 'playing' })
    },
  },
})
