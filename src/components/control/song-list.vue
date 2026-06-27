<script setup lang="ts">
import { Command, type SearchItem } from '@/types'
import { computed, ref, storeToRefs } from 'wevu'
import { useDataStore } from '@/stores/data'
import { usePlayStateStore } from '@/stores/playState'
import { hooks } from '@/utils/hook'
import { generateAlbumGroupList, generateYearGroupList, searchByString } from '@/utils/songList'
import { BleRemote } from '@/utils/bleRemote'
import { BleScreen } from '@/utils/bleScreen'
import SongListItem from './song-list-item.vue'

const props = withDefaults(defineProps<{
  mode?: 'remote' | 'screen'
}>(), { mode: 'remote' })

const searchInputValue = ref('')
const filteredList = ref<SearchItem[]>([])
const data = useDataStore()
const playState = usePlayStateStore()
const { metaGroupList, allDataList, allDataDict } = storeToRefs(data)
const { currentSongData } = storeToRefs(playState)
const bleRemote = BleRemote.getInstance()

type SortMode = 'name' | 'year' | 'album'
const sortMode = ref<SortMode>('name')
const sortModeLabel = computed(() => ({ name: '名称', year: '年份', album: '专辑' }[sortMode.value]))
const sortModes: SortMode[] = ['name', 'year', 'album']

const sortedGroupList = computed(() => {
  if (sortMode.value === 'year') return generateYearGroupList(allDataList.value)
  if (sortMode.value === 'album') return generateAlbumGroupList(allDataList.value)
  return metaGroupList.value
})

const handleToggleSort = () => {
  const idx = sortModes.indexOf(sortMode.value)
  sortMode.value = sortModes[(idx + 1) % sortModes.length]
}

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

const handleSelectSong = async (slug: string) => {
  const songData = allDataDict.value[slug] || null
  playState.setCurrentSongData(songData)
  if (songData) {
    if (props.mode === 'screen') {
      BleScreen.getInstance().sendLongCommand(Command.ChangeSongData, songData).catch(() => {})
    } else {
      bleRemote.sendLongCommand(Command.ChangeSongData, songData)
    }
  }
  hooks.callHook('trigger-tab', { tab: 'playing' })
}

const handleSelectSongWithIdOnly = async (slug: string) => {
  const songData = allDataDict.value[slug] || null
  playState.setCurrentSongData(songData)
  if (songData) {
    if (props.mode === 'screen') {
      BleScreen.getInstance().sendLongCommand(Command.ChangeSongId, slug).catch(() => {})
    } else {
      bleRemote.sendLongCommand(Command.ChangeSongId, slug)
    }
  }
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
      scroll-with-animation
    >
      <block v-for="item in sortedGroupList" :key="item.index">
        <text class="text-xs font-medium text-muted-foreground my-1 px-4">{{ item.index }}</text>
        <SongListItem
          v-for="songItem in item.list"
          :id="`id:${songItem.slug}`"
          :key="songItem.slug"
          :active="!!currentSongData && currentSongData.slug === songItem.slug"
          :detail="songItem"
          @tap="handleSelectSong(songItem.slug)"
          @longtap="handleSelectSongWithIdOnly(songItem.slug)"
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
        @longtap="handleSelectSongWithIdOnly(item.slug)"
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
      <view
        v-if="!searchInputValue"
        class="flex items-center gap-0.5 text-muted-foreground"
        hover-class="text-accent-foreground"
        @tap="handleToggleSort"
      >
        <view class="i-lucide-arrow-up-down text-xs" />
        <text class="text-xs">{{ sortModeLabel }}</text>
      </view>
    </view>
  </view>
</template>
