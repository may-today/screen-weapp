<script setup lang="ts">
import { computed, storeToRefs } from 'wevu'
import { usePlayStateStore } from '@/stores/playState'
import { formatDuration } from '@/utils/format'
import { timeServer } from '@/utils/timeServer'
import { BleScreen } from '@/utils/bleScreen'
import { Command } from '@/types'

const props = withDefaults(defineProps<{
  mode?: 'remote' | 'screen'
}>(), { mode: 'remote' })

const playState = usePlayStateStore()
const { autoPlay, currentTime, supportAutoPlay } = storeToRefs(playState)

const currentTimeFormatted = computed(() => formatDuration(currentTime.value))

const handleButtonTap = () => {
  if (!supportAutoPlay.value) {
    return
  }
  wx.vibrateShort({ type: 'light' })
  const next = !autoPlay.value
  if (next) {
    timeServer.start()
  } else {
    timeServer.pause()
  }
  if (props.mode === 'screen') {
    BleScreen.getInstance().sendCommand(Command.LyricAutoPlay, next ? '1' : '0').catch(() => {})
  }
}
</script>

<template>
  <view class="flex flex-row items-center gap-2">
    <text v-if="autoPlay" class="text-xs font-mono opacity-60">{{ currentTimeFormatted }}</text>
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
@reference "../../app.css";

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
