<script setup lang="ts">
import ConnectStatus from './connect-status.vue';
import { useRouter } from 'wevu/router'

const router = useRouter()

const jumpToDeviceConnect = () => {
  router.push('/pages/remote/device-connect')
}
</script>

<template>
  <view class="flex flex-row items-center justify-between gap-2 px-2 py-2 bg-background border-b border-border"
    @tap="jumpToDeviceConnect">
    <connect-status />
    <text class="text-sm font-medium text-muted-foreground opacity-60">正在播放：xxxx</text>
  </view>
</template>
