<script setup lang="ts">
import { data } from '@/stores/data'
import { useUi } from '@/stores/ui'

defineComponentJson({
  usingComponents: {
    'float-control-panel': '/components/float-control-panel',
  },
})

type ControlBarButtonAction = 'prev' | 'next' | 'menu'

const ui = useUi()

const buttonList = [
  { id: 'prev', iconClass: 'i-lucide-chevron-left' },
  { id: 'next', iconClass: 'i-lucide-chevron-right' },
  { id: 'menu', iconClass: 'i-lucide-menu' },
] as {
  id: ControlBarButtonAction
  iconClass: string
}[]

const handleButtonTap = (e: WechatMiniprogram.TouchEvent) => {
  const action: ControlBarButtonAction = e.currentTarget.dataset.action
  wx.vibrateShort({ type: 'light' })
  if (action === 'menu') {
    ui.setShowScreenFloatPanel(true)
    return
  }
  if (action === 'prev') {
    return data.prevLyricLine()
  }
  if (action === 'next') {
    return data.nextLyricLine()
  }
}
</script>

<template>
  <view class="absolute bottom-4 right-4 flex gap-2 text-stone-600">
    <view
      v-for="item in buttonList"
      v-key="item.id"
      class="border border-stone-600 size-8 rounded-md flex items-center justify-center"
      hover-class="bg-accent text-accent-foreground"
      :data-action="item.id"
      @tap="handleButtonTap"
    >
      <view :class="item.iconClass" class="text-sm" />
    </view>
  </view>
  <float-control-panel />
</template>
