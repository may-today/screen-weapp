<script setup lang="ts">
import { computed, storeToRefs } from 'wevu'
import { usePlayStateStore } from '@/stores/playState'
import { formatDuration } from '@/utils/format'
import AutoPlaySwitchButton from './auto-play-switch-button.vue'
import Empty from '../empty.vue'
import ControlPanelPage from './control-panel-page.vue'
import { BleRemote } from '@/utils/bleRemote'
import { BleScreen } from '@/utils/bleScreen'
import { Command } from '@/types'

const props = defineProps<{
  mode?: 'remote' | 'screen'
}>()

const playState = usePlayStateStore()
const { currentSongData, currentLyricIndex } = storeToRefs(playState)
const currentSongDetail = computed(() => currentSongData.value?.detail || [])

const bleRemote = BleRemote.getInstance()

const handleLyricLineTap = async (e: WechatMiniprogram.TouchEvent) => {
  const { index, time } = e.currentTarget.dataset
  if (typeof index === 'number') {
    playState.setCurrentLyricIndex(index, time)
    if (props.mode === 'screen') {
      BleScreen.getInstance().sendCommand(Command.LyricSetIndex, String(index)).catch(() => {})
    } else {
      await bleRemote.sendCommand(Command.LyricSetIndex, String(index))
    }
  }
}

const handlePrev = async () => {
  playState.prevLyricLine()
  await bleRemote.sendCommand(Command.LyricSetIndex, String(currentLyricIndex.value))
}

const handleNext = async () => {
  playState.nextLyricLine()
  await bleRemote.sendCommand(Command.LyricSetIndex, String(currentLyricIndex.value))
}
</script>

<template>
  <ControlPanelPage title="正在展示">
    <view v-show="!currentSongData" class="flex-1">
      <Empty text="没有正在展示的歌曲" type="none" extra-class="flex-1" />
    </view>
    <scroll-view :hidden="!currentSongData" class="flex-1 overflow-hidden" scroll-y enable-passive enable-back-to-top>
      <template v-for="(item, index) in currentSongDetail" :key="item.time">
        <view
          class="lyric-line"
          :class="{
            'line-highlight': item.isHighlight,
            'line-current': currentLyricIndex === index,
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
      <AutoPlaySwitchButton :mode="props.mode" />
    </view>
    <!-- 遥控器模式控制栏 -->
    <view v-if="props.mode === 'remote'" class="flex flex-row items-center h-40 max-h-1/3 border-t border-border">
      <view class="flex-1 flex h-full items-center justify-center border-r border-border" hover-class="bg-accent text-accent-foreground" @tap="handlePrev">
        <view class="i-lucide-chevron-left size-8" />
      </view>
      <view class="flex-1 flex h-full items-center justify-center" hover-class="bg-accent text-accent-foreground" @tap="handleNext">
        <view class="i-lucide-chevron-right size-8" />
      </view>
    </view>
  </ControlPanelPage>
</template>

<style lang="css" scoped>
@reference "../../app.css";

.lyric-line {
  @apply flex flex-row items-center gap-2 mx-2 px-2 py-1.5 min-h-8 rounded-md first:mt-2 last:mb-2;
}

.line-current {
  @apply bg-primary text-primary-foreground;
}

.line-highlight {
  @apply text-theme-foreground;
}

.line-current.line-highlight {
  @apply text-primary-foreground;
}
</style>
