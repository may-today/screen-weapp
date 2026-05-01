<script setup lang="ts">
import { storeToRefs } from 'wevu'
import { useUi } from '@/stores/ui'

const props = withDefaults(
  defineProps<{
    title: string
    hidden?: boolean
  }>(),
  {
    title: '',
    hidden: false,
  },
)

const ui = useUi()
const { globalLoading } = storeToRefs(ui)
</script>

<template>
  <view class="flex flex-col h-full overflow-hidden" :hidden="hidden">
    <view class="relative flex flex-row items-center gap-3 h-12 px-4">
      <view class="absolute left-0 right-0 bottom-0 h-px bg-border" :class="{ 'loading-anim': globalLoading }" />
      <text class="font-semibold text-sm">{{ title }}</text>
      <slot name="header" />
    </view>
    <view class="flex-1 flex flex-col overflow-hidden">
      <slot />
    </view>
  </view>
</template>

<style lang="css" scoped>
.loading-anim::before {
  content: ' ';
  position: absolute;
  top: 0;
  bottom: 0;
  background-image: linear-gradient(90deg, #ffffff00 0%, #ffffff66 35%, #ffffff66 65%, #ffffff00 100%);
  width: 60%;
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-name: progress-bar-loop;
}

@keyframes progress-bar-loop {
  from {
    left: -60%;
  }
  to {
    left: 110%;
  }
}
</style>
