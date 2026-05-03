<script setup lang="ts">
import { usePlayStateStore } from '@/stores/playState'
import { useUiStore } from '@/stores/ui'
import { BleScreen } from '@/utils/bleScreen'
import { Command } from '@/types'
import FloatControlPanel from './float-control-panel.vue'

type ControlBarButtonAction = 'prev' | 'next' | 'menu'

const playState = usePlayStateStore()
const ui = useUiStore()
const bleScreen = BleScreen.getInstance()

const buttonList: {
  id: ControlBarButtonAction
  iconClass: string
}[] = [
  { id: 'prev', iconClass: 'i-lucide-chevron-left' },
  { id: 'next', iconClass: 'i-lucide-chevron-right' },
  { id: 'menu', iconClass: 'i-lucide-menu' },
]

const handleButtonTap = (action: ControlBarButtonAction) => {
  wx.vibrateShort({ type: 'light' })
  if (action === 'menu') {
    ui.setShowScreenFloatPanel(true)
    return
  }
  if (action === 'prev') {
    playState.prevLyricLine()
    bleScreen.sendCommand(Command.LyricSetIndex, String(playState.currentLyricIndex)).catch(() => {})
    return
  }
  if (action === 'next') {
    playState.nextLyricLine()
    bleScreen.sendCommand(Command.LyricSetIndex, String(playState.currentLyricIndex)).catch(() => {})
    return
  }
}
</script>

<template>
  <view class="absolute bottom-4 right-4 flex gap-2 text-stone-600">
    <view
      v-for="item in buttonList"
      :key="item.id"
      class="border border-stone-600 size-8 rounded-md flex items-center justify-center"
      hover-class="bg-accent text-accent-foreground"
      @tap="handleButtonTap(item.id)"
    >
      <view :class="item.iconClass" class="text-sm" />
    </view>
  </view>
  <FloatControlPanel />
</template>
