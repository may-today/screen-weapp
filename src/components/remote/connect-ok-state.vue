<script setup lang="ts">
import { computed } from 'wevu'
import { storeToRefs } from 'wevu/store'
import { useConnectStore } from '@/stores/connect'

const props = defineProps<{
  text: string
  type: 'default' | 'error' | 'loading' | 'none'
}>()
const connectStore = useConnectStore()
const { currentScreenMeta } = storeToRefs(connectStore)

const deviceImgSrc = computed(() => {
  if (connectStore.currentScreenMeta.value) {
    return `../../assets/device-${connectStore.currentScreenMeta.value.device}.png`
  }
  return `../../assets/device-unknown.png`
})

const handleDisconnect = () => {
  // disconnect
  connectStore.setCurrentScreenMeta(null)
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
    <button class="mt-6" @tap="handleDisconnect">退出连接</button>
  </view>
</template>
