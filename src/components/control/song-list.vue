<script setup lang="ts">
import type { SearchItem } from '@/types'
import { ref, storeToRefs } from 'wevu'
import { useData } from '@/stores/data'
import { usePlayState } from '@/stores/playState'
import { hooks } from '@/utils/hook'
import { searchByString } from '@/utils/songList'
import SongListItem from './song-list-item.vue'

const searchInputValue = ref('')
const filteredList = ref<SearchItem[]>([])
const data = useData()
const playState = usePlayState()
const { metaGroupList, allDataList, allDataDict } = storeToRefs(data)
const { currentSongData } = storeToRefs(playState)

const handleSearch = (event: WechatMiniprogram.Input) => {
  const searchValue = event.detail.value.trim()
  filteredList.value = searchByString(searchValue, allDataList.value)
}

const handleClearSearch = () => {
  searchInputValue.value = ''
  filteredList.value = []
}

const handleSearchValueChange = (event: WechatMiniprogram.Input) => {
  const searchValue = event.detail.value.trim()
  searchInputValue.value = searchValue
}

const handleSelectSong = (slug: string) => {
  const songData = allDataDict.value[slug] || null
  playState.setCurrentSongData(songData)
  hooks.callHook('trigger-tab', { tab: 'playing' })
}
</script>

<template>
  <view class="h-full flex flex-col">
    <scroll-view
      v-if="!searchInputValue"
      class="flex-1 overflow-hidden"
      scroll-y
      enable-passive
      enable-back-to-top
      :scroll-into-view="`id:${currentSongData && currentSongData.slug}`"
      scroll-into-view-offset="-60"
      scroll-into-view-alignment="center"
      scroll-with-animation
    >
      <block v-for="item in metaGroupList" :key="item.index">
        <text class="text-xs font-medium text-muted-foreground my-1 px-4">{{ item.index }}</text>
        <SongListItem
          v-for="songItem in item.list"
          :id="`id:${songItem.slug}`"
          :key="songItem.slug"
          :active="!!currentSongData && currentSongData.slug === songItem.slug"
          :detail="songItem"
          @tap="handleSelectSong(songItem.slug)"
        />
      </block>
    </scroll-view>
    <scroll-view v-else class="flex-1 overflow-hidden" scroll-y enable-passive enable-back-to-top>
      <SongListItem
        v-for="item in filteredList"
        :key="item.slug"
        :active="!!currentSongData && currentSongData.slug === item.slug"
        :detail="item.data"
        :extra-info="item.matchLines"
        @tap="handleSelectSong(item.slug)"
      />
    </scroll-view>
    <view class="flex items-center gap-1.5 h-10 border-t border-border px-4 text-sm">
      <view class="i-lucide-search text-sm text-muted-foreground" />
      <input
        class="flex-1"
        :value="searchInputValue"
        placeholder="搜索歌名或歌词"
        confirm-type="search"
        @confirm="handleSearch"
        @blur="handleSearch"
        @input="handleSearchValueChange"
      >
      <view
        v-if="searchInputValue"
        class="i-lucide-circle-x text-sm text-muted-foreground"
        hover-class="text-accent-foreground"
        @tap="handleClearSearch"
      />
    </view>
  </view>
</template>
