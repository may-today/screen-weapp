<script setup lang="ts">
import { computed, storeToRefs } from 'wevu'
import { usePlayState } from '@/stores/playState'
import { formatDuration } from '@/utils/format'
import AutoPlaySwitchButton from './auto-play-switch-button.vue'
import Empty from './empty.vue'
import FloatControlPanelPage from './float-control-panel-page.vue'

const playState = usePlayState()
const { currentSongData, currentLyricIndex } = storeToRefs(playState)
const currentSongDetail = computed(() => currentSongData.value?.detail || [])

const handleLyricLineTap = (e: WechatMiniprogram.TouchEvent) => {
  const { index, time } = e.currentTarget.dataset
  if (typeof index === 'number') {
    playState.setCurrentLyricIndex(index, time)
  }
}
</script>

<template>
  <FloatControlPanelPage title="正在展示">
    <view v-show="!currentSongData" class="flex-1">
      <Empty text="没有正在展示的歌曲" type="none" extra-class="flex-1" />
    </view>
    <scroll-view :hidden="!currentSongData" class="flex-1 overflow-hidden" scroll-y enable-passive enable-back-to-top>
      <template v-for="(item, index) in currentSongDetail" :key="item.time">
        <view
          class="lyric-line"
          :class="{
              'highlight': item.isHighlight,
              'active': currentLyricIndex === index,
            }"
          hover-class="bg-accent text-accent-foreground"
          :data-index="index"
          :data-time="item.time"
          @tap="handleLyricLineTap"
        >
          <text v-if="item.time >= 0" class="text-xs font-mono opacity-60">{{ formatDuration(item.time) }}</text>
          <text class="text-sm">{{ item.text || '' }}</text>
        </view>
      </template>
    </scroll-view>
    <view v-if="currentSongData" class="flex flex-row items-center h-12 px-4 border-t border-border">
      <text class="flex-1 text-xs">{{ currentSongData.title }}</text>
      <AutoPlaySwitchButton />
    </view>
  </FloatControlPanelPage>
</template>

<style lang="css" scoped>
@reference "../app.css";

.lyric-line {
  @apply flex flex-row items-center gap-2 mx-2 px-2 py-1.5 min-h-8 rounded-md first:mt-2 last:mb-2;
}

.lyric-line.active {
  @apply bg-primary text-primary-foreground font-medium;
}

.lyric-line.highlight {
  @apply text-theme-foreground;
}

.lyric-line.active.highlight {
  @apply text-primary-foreground;
}
</style>
