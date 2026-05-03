<script setup lang="ts">
import { computed } from 'wevu'
import { storeToRefs } from 'wevu/store'
import { useConnectStore } from '@/stores/connect'

const connectStore = useConnectStore()
const { currentScreenMeta } = storeToRefs(connectStore)
const emit = defineEmits<{
  disconnect: []
}>()

const deviceImgSrc = computed(() => {
  if (currentScreenMeta.value) {
    return `../../assets/device-${currentScreenMeta.value.device}.png`
  }
  return `../../assets/device-unknown.png`
})

const handleDisconnect = () => {
  emit('disconnect')
}
</script>

<template>
  <view
    class="w-full h-full max-w-125 flex flex-col items-center justify-center px-4 py-3 gap-3 mx-auto"
  >
    <view
      class="shrink-0 flex items-center justify-center w-64 max-w-full p-2">
      <image :src="deviceImgSrc" class="w-full" mode="aspectFit" />
    </view>
    <text class="w-full font-medium text-center" overflow="ellipsis">{{ currentScreenMeta?.displayName }}</text>
    <button class="mt-6" @tap="handleDisconnect">断开连接</button>
  </view>
</template>
