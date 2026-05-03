<script setup lang="ts">
import { computed } from 'wevu'
import { storeToRefs } from 'wevu/store'
import { useConnectStore } from '@/stores/connect'
import { ConnectStatus } from '@/types/connect'

const connectStore = useConnectStore()
const { connectStatus } = storeToRefs(connectStore)

const isVisible = computed(() => connectStatus.value !== ConnectStatus.Disabled)

const isConnecting = computed(
  () =>
    connectStatus.value === ConnectStatus.Connecting ||
    connectStatus.value === ConnectStatus.Authorizing,
)

const dotClass = computed(() => {
  switch (connectStatus.value) {
    case ConnectStatus.Connected:
      return 'dot-connected'
    case ConnectStatus.Connecting:
    case ConnectStatus.Authorizing:
      return 'dot-connecting'
    default:
      return 'dot-disconnected'
  }
})

const statusText = computed(() => {
  switch (connectStatus.value) {
    case ConnectStatus.Connected:
      return '已连接'
    case ConnectStatus.Connecting:
    case ConnectStatus.Authorizing:
      return '连接中...'
    default:
      return '等待连接'
  }
})
</script>

<template>
  <view v-if="isVisible" class="status-badge">
    <view class="dot" :class="[dotClass, { 'dot-pulse': isConnecting }]" />
    <text class="status-text">{{ statusText }}</text>
  </view>
</template>

<style lang="css" scoped>
@reference "../../app.css";

.status-badge {
  @apply absolute bottom-4 left-4 flex flex-row items-center gap-1.5 rounded-full px-2.5 py-1.5;
  background-color: rgba(0, 0, 0, 0.55);
}

.dot {
  @apply size-2 flex-shrink-0 rounded-full;
}

.dot-disconnected {
  @apply bg-amber-500/70;
}

.dot-connecting {
  @apply bg-yellow-400;
}

.dot-connected {
  @apply bg-emerald-400;
}

.dot-pulse {
  animation: pulse-dot 1.4s ease-in-out infinite;
}

.status-text {
  @apply text-xs text-white/80;
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.75);
  }
}
</style>
