<script setup lang="ts">
import { usePlayState } from '@/stores/playState'
import { useUi } from '@/stores/ui'
import FloatControlPanel from './float-control-panel.vue'

type ControlBarButtonAction = 'prev' | 'next' | 'menu'

const playState = usePlayState()
const ui = useUi()

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
    return playState.prevLyricLine()
  }
  if (action === 'next') {
    return playState.nextLyricLine()
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
