<script setup lang="ts">
import { ref, watch, computed } from 'wevu'
import { storeToRefs } from 'wevu/store'
import { useConnectStore } from '@/stores/connect'
import { useTransmitStore } from '@/stores/transmit'
import { ConnectStatus } from '@/types/connect'
import SignalIcon from './signal-icon.vue'

const props = defineProps<{
  extraClass?: string
}>()

const connectStore = useConnectStore()
const { connectStatus, rssi } = storeToRefs(connectStore)

const transmitStore = useTransmitStore()
const { commandReceivedAt, commandSentAt, largeDataProgress } = storeToRefs(transmitStore)

const isConnecting = computed(
  () =>
    connectStatus.value === ConnectStatus.Connecting ||
    connectStatus.value === ConnectStatus.Authorizing,
)

const dotClass = computed(() => {
  switch (connectStatus.value) {
    case ConnectStatus.Disconnected:
      return 'dot-disabled'
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
    case ConnectStatus.Disconnected:
      return '未开启'
    case ConnectStatus.Connected:
      return '已连接'
    case ConnectStatus.Connecting:
    case ConnectStatus.Authorizing:
      return '连接中...'
    default:
      return '等待连接'
  }
})

const showTransmit = computed(() => connectStatus.value === ConnectStatus.Connected)
const isLargeData = computed(() => largeDataProgress.value !== null)
const progressPercent = computed(() =>
  largeDataProgress.value
    ? Math.round((largeDataProgress.value.current / largeDataProgress.value.total) * 100)
    : 0,
)

const flashReceive = ref(false)
const flashSend = ref(false)
let receiveTimer: ReturnType<typeof setTimeout> | null = null
let sendTimer: ReturnType<typeof setTimeout> | null = null

watch(commandReceivedAt, () => {
  if (receiveTimer !== null) clearTimeout(receiveTimer)
  flashReceive.value = true
  receiveTimer = setTimeout(() => {
    flashReceive.value = false
    receiveTimer = null
  }, 700)
})

watch(commandSentAt, () => {
  if (sendTimer !== null) clearTimeout(sendTimer)
  flashSend.value = true
  sendTimer = setTimeout(() => {
    flashSend.value = false
    sendTimer = null
  }, 700)
})
</script>

<template>
  <view class="status-badge" :class="props.extraClass">
    <signal-icon :rssi="rssi" />
    <view class="dot" :class="[dotClass, { 'dot-pulse': isConnecting }]" />
    <text class="status-text">{{ statusText }}</text>
    <template v-if="showTransmit">
      <view class="tx-sep" />
      <view v-if="isLargeData" class="tx-progress-track">
        <view class="tx-progress-fill" :style="{ width: progressPercent + '%' }" />
      </view>
      <view
        v-else
        class="tx-dot"
        :class="{ 'tx-flash-receive': flashReceive, 'tx-flash-send': flashSend }"
      />
    </template>
  </view>
</template>

<style lang="css" scoped>
@reference "../app.css";

.status-badge {
  @apply flex flex-row items-center gap-1.5 rounded-full px-2.5 py-1.5;
}

.dot {
  @apply size-2 flex-shrink-0 rounded-full;
}

.dot-disabled {
  @apply bg-neutral-700;
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

.tx-sep {
  @apply w-px self-stretch bg-white/20;
}

.tx-dot {
  @apply size-2 flex-shrink-0 rounded-full bg-white/15;
}

.tx-flash-receive {
  animation: flash-receive 0.7s ease-out forwards;
}

.tx-flash-send {
  animation: flash-send 0.7s ease-out forwards;
}

.tx-progress-track {
  @apply h-1 w-10 overflow-hidden rounded-full bg-white/20;
}

.tx-progress-fill {
  @apply h-full rounded-full bg-cyan-400;
  transition: width 0.15s ease-out;
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

@keyframes flash-receive {
  0% {
    background-color: rgb(34 211 238);
    transform: scale(1.5);
    opacity: 1;
  }
  100% {
    background-color: rgb(255 255 255 / 0.15);
    transform: scale(1);
    opacity: 0.3;
  }
}

@keyframes flash-send {
  0% {
    background-color: rgb(251 191 36);
    transform: scale(1.5);
    opacity: 1;
  }
  100% {
    background-color: rgb(255 255 255 / 0.15);
    transform: scale(1);
    opacity: 0.3;
  }
}
</style>
