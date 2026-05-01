<script setup lang="ts">
import { computed } from 'wevu';

const props = defineProps<{
  rssi: number
}>()

const rssiClass = computed(() => {
  if (props.rssi >= -60) {
    // 非常强
    return 'i-lucide-signal text-green-500'
  } else if (props.rssi >= -70) {
    // 强
    return 'i-lucide-signal-high text-green-500'
  } else if (props.rssi >= -80) {
    // 中
    return 'i-lucide-signal-medium text-yellow-500'
  } else if (props.rssi >= -90) {
    // 弱
    return 'i-lucide-signal-low text-orange-500'
  } else {
    // 非常弱
    return 'i-lucide-signal-zero text-red-500'
  }
})
</script>

<template>
  <view class="relative text-sm size-4">
    <view class="absolute i-lucide-signal text-neutral-700" />
    <view class="absolute" :class="rssiClass" />
  </view>
</template>
