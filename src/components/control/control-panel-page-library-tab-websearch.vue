<script setup lang="ts">
import type { SongDetail } from '@/types'
import { ref } from 'wevu'
import { usePlayStateStore } from '@/stores/playState'
import { hooks } from '@/utils/hook'
import { BleRemote } from '@/utils/bleRemote'
import { parseRawLRCFile } from '@/utils/lyric'
import { getLyricBySongId, getTrackListByKeyword } from '@/utils/webSearch'
import Empty from '../empty.vue'
import WebSearchListItem from './web-search-list-item.vue'
import FloatControlPanelPage from './control-panel-page.vue'

export interface WebSearchTrackItem {
  id: string
  song_name: string
  song_name_original: string
  album_name: string
  artist: string
  duration: number
}

const props = withDefaults(
  defineProps<{
    hidden?: boolean
  }>(),
  {
    hidden: false,
  },
)

const searchInputValue = ref('')
const webSearchResultList = ref<WebSearchTrackItem[]>([])
const searching = ref(false)
const playState = usePlayStateStore()
const bleRemote = BleRemote.getInstance()

const handleSearch = async (event: WechatMiniprogram.Input) => {
  const searchValue = event.detail.value.trim()
  searching.value = true
  const trackList = await getTrackListByKeyword(searchValue)
  webSearchResultList.value = trackList
  searching.value = false
}

const handleClearSearch = () => {
  searchInputValue.value = ''
  webSearchResultList.value = []
  searching.value = false
}

const handleSearchValueChange = (event: WechatMiniprogram.Input) => {
  const searchValue = event.detail.value.trim()
  searchInputValue.value = searchValue
  searching.value = false
  webSearchResultList.value = []
}

const handleSelectSong = async (item: WebSearchTrackItem) => {
  const lyricText = (await getLyricBySongId(item.id)?.catch(() => null)) || null
  if (!lyricText) {
    wx.showToast({
      title: '加载失败',
      icon: 'error',
    })
    return
  }
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
  playState.setCurrentSongData(singleTrack)
  await bleRemote.sendSongData(singleTrack)
  hooks.callHook('trigger-tab', { tab: 'playing' })
}
</script>

<template>
  <FloatControlPanelPage title="网络搜索" :hidden="props.hidden">
    <view class="h-full flex flex-col">
      <view v-if="webSearchResultList.length === 0 || !searchInputValue" class="flex-1 overflow-hidden">
        <Empty v-if="!searchInputValue" text="输入歌名查询全网歌词" type="none" />
        <Empty v-if="searchInputValue && searching" text="正在搜索" type="loading" />
        <Empty v-if="searchInputValue && !searching" text="没有搜索结果" type="error" />
      </view>
      <scroll-view v-else class="flex-1 overflow-hidden" scroll-y enable-passive enable-back-to-top>
        <WebSearchListItem
          v-for="item in webSearchResultList"
          :key="item.id"
          :info="item"
          @tap="handleSelectSong(item)"
        />
      </scroll-view>
      <view class="flex items-center gap-1.5 h-10 border-t border-border px-4 text-sm">
        <view class="i-lucide-search text-xs text-muted-foreground" />
        <input
          class="flex-1"
          :value="searchInputValue"
          placeholder="输入歌名查询全网歌词"
          confirm-type="search"
          @confirm="handleSearch"
          @blur="handleSearch"
          @input="handleSearchValueChange"
        >
        <view
          v-if="searchInputValue"
          class="i-lucide-circle-x text-xs text-muted-foreground"
          hover-class="text-accent-foreground"
          @tap="handleClearSearch"
        />
      </view>
    </view>
  </FloatControlPanelPage>
</template>
