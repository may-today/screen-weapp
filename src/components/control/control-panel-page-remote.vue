<script setup lang="ts">
import { computed, onReady, onUnload, ref, storeToRefs } from 'wevu'
import { useConnectStore } from '@/stores/connect'
import { ConnectStatus } from '@/types/connect'
import { BleScreen } from '@/utils/bleScreen'
import ControlPanelPage from './control-panel-page.vue'
import SignalIcon from '../signal-icon.vue'

const connectStore = useConnectStore()
const { _screenConnectStatus, _screenRssi, currentRemoteMeta } = storeToRefs(connectStore)

const now = ref(Date.now())
const isStarting = ref(false)
const isStopping = ref(false)
const isDisconnecting = ref(false)
const screenNickName = ref<string | null>(null)
let durationTimer: ReturnType<typeof setInterval> | null = null

const isConnected = computed(() => _screenConnectStatus.value === ConnectStatus.Connected)
const isConnecting = computed(() => _screenConnectStatus.value === ConnectStatus.Connecting)
const isAuthorizing = computed(() => _screenConnectStatus.value === ConnectStatus.Authorizing)

const remoteDeviceIdText = computed(() => currentRemoteMeta.value?.deviceId || '')

const startListeningRemote = async () => {
  if (isStarting.value) return
  isStarting.value = true
  try {
    const bleScreen = BleScreen.getInstance()
    await bleScreen.prepare()
    screenNickName.value = bleScreen.screenNickName
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
    screenNickName.value = null
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
  <ControlPanelPage title="连接到遥控器">
    <template v-if="screenNickName" #header>
      <text class="text-xs text-muted-foreground font-mono">{{ screenNickName }}</text>
    </template>
    <!-- 未启用 -->
    <view v-if="_screenConnectStatus === ConnectStatus.Disabled" class="flex-1 flex flex-col items-center justify-center gap-3 px-6">
      <view class="i-lucide-bluetooth-off size-9 text-muted-foreground/50" />
      <text class="text-sm text-muted-foreground text-center">启用后可接受遥控器连接</text>
      <button :loading="isStarting" @tap="startListeningRemote">启用遥控器功能</button>
    </view>

    <!-- 等待连接 -->
    <view v-else-if="_screenConnectStatus === ConnectStatus.Disconnected" class="flex-1 flex flex-col items-center justify-center gap-3 px-6">
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
      </view>
      <signal-icon :rssi="_screenRssi" />
      <button :loading="isDisconnecting" @tap="disconnectRemote">断开连接</button>
    </view>
  </ControlPanelPage>
</template>
