<script setup lang="ts">
import { useRouter } from 'wevu/router'
import { BleRemote } from '@/utils/bleRemote'
import ConnectStatus from '../connect-status.vue'

const router = useRouter()
const remoteNickName = BleRemote.getInstance().remoteNickName

const jumpToDeviceConnect = () => {
  router.push('/pages/remote/device-connect')
}
</script>

<template>
  <view class="flex flex-row items-center justify-between gap-2 px-2 py-2 bg-background border-b border-border">
    <connect-status extra-class="bg-card border border-border" @tap="jumpToDeviceConnect" mode="remote" />
    <text class="text-sm font-mono font-medium text-muted-foreground opacity-70">{{ remoteNickName }}</text>
  </view>
</template>
