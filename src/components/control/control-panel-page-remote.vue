<script setup lang="ts">
import { computed, onReady, onUnload, ref, storeToRefs } from 'wevu'
import { useConnectStore } from '@/stores/connect'
import { ConnectStatus } from '@/types/connect'
import { BleScreen } from '@/utils/bleScreen'
import ControlPanelPage from './control-panel-page.vue'

const connectStore = useConnectStore()
const { connectStatus, currentRemoteMeta, rssi } = storeToRefs(connectStore)

const now = ref(Date.now())
const isStarting = ref(false)
const isStopping = ref(false)
const isDisconnecting = ref(false)
let durationTimer: ReturnType<typeof setInterval> | null = null

const isConnected = computed(() => connectStatus.value === ConnectStatus.Connected)
const isConnecting = computed(() => connectStatus.value === ConnectStatus.Connecting)
const isAuthorizing = computed(() => connectStatus.value === ConnectStatus.Authorizing)

const rssiLabel = computed(() => {
  const v = rssi.value
  if (v === null) return ''
  if (v >= -60) return '信号极强'
  if (v >= -70) return '信号强'
  if (v >= -80) return '信号中'
  if (v >= -90) return '信号弱'
  return '信号极弱'
})

const connectedDuration = computed(() => {
  const connectedAt = currentRemoteMeta.value?.connectedAt
  if (!connectedAt) return '--'
  const totalSeconds = Math.max(0, Math.floor((now.value - connectedAt) / 1000))
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const seconds = (totalSeconds % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
})

const remoteDeviceIdText = computed(() => currentRemoteMeta.value?.deviceId || '等待握手')

const startListeningRemote = async () => {
  if (isStarting.value) return
  isStarting.value = true
  try {
    const bleScreen = BleScreen.getInstance()
    await bleScreen.prepare()
    await bleScreen.startAdvertising()
  }
  finally {
    isStarting.value = false
  }
}

const stopListeningRemote = async () => {
  if (isStopping.value) return
  isStopping.value = true
  try {
    await BleScreen.getInstance().destroy()
  }
  finally {
    isStopping.value = false
  }
}

const disconnectRemote = async () => {
  if (isDisconnecting.value) return
  isDisconnecting.value = true
  try {
    await BleScreen.getInstance().disconnectRemote()
  }
  finally {
    isDisconnecting.value = false
  }
}

onReady(() => {
  durationTimer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnload(() => {
  if (durationTimer) {
    clearInterval(durationTimer)
    durationTimer = null
  }
})
</script>

<template>
  <ControlPanelPage title="遥控器">
    <!-- 未启用 -->
    <view v-if="connectStatus === ConnectStatus.Disabled" class="flex-1 flex flex-col items-center justify-center gap-3 px-6">
      <view class="i-lucide-bluetooth-off size-9 text-muted-foreground/50" />
      <text class="text-sm text-muted-foreground text-center">启用后可接受遥控器连接</text>
      <button :loading="isStarting" @tap="startListeningRemote">启用遥控器功能</button>
    </view>

    <!-- 等待连接 -->
    <view v-else-if="connectStatus === ConnectStatus.Disconnected" class="flex-1 flex flex-col items-center justify-center gap-3 px-6">
      <view class="i-lucide-bluetooth size-8 text-muted-foreground/40 animate-pulse" />
      <view class="flex flex-col items-center gap-1">
        <text class="text-base font-medium">等待遥控器连接</text>
        <text class="text-sm text-muted-foreground text-center">遥控器功能已启用</text>
      </view>
      <button :loading="isStopping" @tap="stopListeningRemote">关闭遥控器功能</button>
    </view>

    <!-- 连接 / 鉴权占位 -->
    <view v-else-if="isConnecting || isAuthorizing" class="flex-1 flex flex-col items-center justify-center gap-3 px-6">
      <view class="i-lucide-loader-circle size-9 text-theme-foreground animate-spin" />
      <view class="flex flex-col items-center gap-1">
        <text class="text-base font-medium">{{ isConnecting ? '遥控器正在连接' : '正在确认遥控器' }}</text>
        <text class="text-sm text-muted-foreground text-center">{{ remoteDeviceIdText }}</text>
      </view>
      <button :loading="isStopping" @tap="stopListeningRemote">关闭遥控器功能</button>
    </view>

    <!-- 已连接：展示信号强度 -->
    <view v-else-if="isConnected" class="flex-1 flex flex-col items-center justify-center gap-5 px-6">
      <view class="flex flex-col items-center gap-1">
        <text class="text-sm text-muted-foreground">已连接遥控器</text>
        <text class="text-xl font-semibold">{{ currentRemoteMeta?.nickName || '遥控器' }}</text>
        <text class="font-mono text-sm text-muted-foreground">{{ connectedDuration }}</text>
      </view>
      <view class="flex flex-col items-center gap-2">
        <view class="relative size-12 text-4xl">
          <view class="absolute inset-0 i-lucide-signal text-neutral-700" />
          <view class="absolute inset-0 i-lucide-signal"
            :class="{
              'text-green-500': rssi !== null && rssi >= -60,
              'text-green-400': rssi !== null && rssi >= -70 && rssi < -60,
              'text-yellow-500': rssi !== null && rssi >= -80 && rssi < -70,
              'text-orange-500': rssi !== null && rssi >= -90 && rssi < -80,
              'text-red-500': rssi !== null && rssi !== null && rssi < -90,
              'text-neutral-700': rssi === null,
            }"
          />
        </view>
        <text class="text-2xl font-mono font-medium tabular-nums">
          {{ rssi !== null ? `${rssi} dBm` : '--' }}
        </text>
        <text class="text-sm text-muted-foreground">{{ rssiLabel }}</text>
      </view>
      <button :loading="isDisconnecting" @tap="disconnectRemote">断开连接</button>
    </view>
  </ControlPanelPage>
</template>
