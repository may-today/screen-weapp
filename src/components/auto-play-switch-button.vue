<script setup lang="ts">
import { storeToRefs } from 'wevu'
import { usePlayState } from '@/stores/playState'
import { formatDuration } from '@/utils/format'
import { timeServer } from '@/utils/timeServer'

const playState = usePlayState()
const { autoPlay, currentTime, supportAutoPlay } = storeToRefs(playState)

const handleButtonTap = () => {
  if (!supportAutoPlay.value) {
    return
  }
  wx.vibrateShort({ type: 'light' })
  if (autoPlay.value) {
    timeServer.pause()
  } else {
    timeServer.start()
  }
}
</script>

<template>
  <wxs module="parse" src="../wxs/parse.wxs.ts" />
  <view class="flex flex-row items-center gap-2">
    <text v-if="autoPlay" class="text-xs font-mono opacity-60">{{ parse.parseDuration(currentTime) }}</text>
    <view
      class="inline-flex flex-row items-center gap-1 px-2 py-1.5 rounded-md border border-border text-xs"
      :class="{
        'opacity-50': !supportAutoPlay,
      }"
      :hover-class="supportAutoPlay ? 'bg-accent text-accent-foreground' : ''"
      @tap="handleButtonTap"
    >
      <view
        v-show="supportAutoPlay"
        class="flex flex-row items-center gap-0.5 border rounded-sm px-1"
        :class="autoPlay ? 'state-enabled' : 'state-disabled'"
      >
        <view class="component-dot size-1.5 rounded-full" />
        <text class="text-[10px]">{{ autoPlay ? 'ON' : 'OFF' }}</text>
      </view>
      <text>{{ supportAutoPlay ? '自动播放' : '不支持自动播放' }}</text>
    </view>
  </view>
</template>

<style lang="css" scoped>
@reference "../app.css";

.state-enabled {
  @apply bg-emerald-400/20 border-emerald-400/40 text-emerald-400;
  .component-dot {
    @apply bg-emerald-400;
  }
}

.state-disabled {
  @apply bg-neutral-400/20 border-neutral-400/40 text-neutral-400;
  .component-dot {
    @apply bg-neutral-400;
  }
}
</style>
