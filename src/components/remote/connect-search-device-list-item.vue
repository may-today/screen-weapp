<script setup lang="ts">
import { computed } from 'wevu'
import SignalIcon from '../signal-icon.vue'
import { getDeviceInfoFromUuid } from '@/utils/uuid'

const props = defineProps<{
  device: WechatMiniprogram.BlueToothDevice
}>()
const emits = defineEmits(['select'])

const parsedDeviceInfo = computed(() => {
  if (props.device?.advertisServiceUUIDs?.length === 1) {
    const deviceInfo = getDeviceInfoFromUuid(props.device.advertisServiceUUIDs[0])
    return deviceInfo
  }
  return null
})

const deviceImgSrc = computed(() => {
  if (parsedDeviceInfo.value) {
    return `../../assets/device-${parsedDeviceInfo.value.device}.png`
  }
  return `../../assets/device-unknown.png`
})

const handleSelectItem = () => {
  emits('select')
}

</script>

<template>
  <view class="bg-card p-3 pr-4 rounded-xl border border-border flex flex-row items-center gap-3">
    <view
      class="shrink-0 flex items-center justify-center size-14 p-2 rounded-md bg-neutral-100 dark:bg-neutral-700/30">
      <image :src="deviceImgSrc" class="h-full w-full" mode="aspectFit" />
    </view>
    <view class="flex-1 flex flex-col gap-1.5 overflow-hidden">
      <text class="w-full font-medium" overflow="ellipsis">{{ props.device.name }}</text>
      <view class="flex flex-row items-center gap-1.5 text-sm">
        <signal-icon :rssi="props.device.RSSI" />
        <text class="text-muted-foreground text-xs">{{ parsedDeviceInfo?.displayName }}</text>
      </view>
    </view>
    <button size="mini" @tap="handleSelectItem" class="shrink-0">
      连接
    </button>
  </view>
</template>
