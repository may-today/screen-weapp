<script setup lang="ts">
import { computed, storeToRefs } from 'wevu'
import SignalIcon from '../signal-icon.vue'
import { useConnectStore } from '@/stores/connect'
import { ConnectStatus } from '@/types/connect'

const connectStore = useConnectStore()
const { connectStatus, rssi } = storeToRefs(connectStore)

const statusText = computed(() => {
  switch (connectStatus.value) {
    case ConnectStatus.Connected:
      return '已连接'
    case ConnectStatus.Connecting:
    case ConnectStatus.Authorizing:
      return '连接中...'
    default:
      return '未连接'
  }
})
</script>

<template>
  <view class="inline-flex flex-row items-center gap-1 px-2 py-1 bg-card border border-border rounded-full">
    <signal-icon :rssi="rssi ?? -100" />
    <text class="text-xs text-muted-foreground">{{ statusText }}</text>
  </view>
</template>
