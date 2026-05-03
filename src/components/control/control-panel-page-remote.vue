<script setup lang="ts">
import { computed, storeToRefs } from 'wevu'
import { useConnectStore } from '@/stores/connect'
import { ConnectStatus } from '@/types/connect'
import { BleScreen } from '@/utils/bleScreen'
import ControlPanelPage from './control-panel-page.vue'

const connectStore = useConnectStore()
const { connectStatus, rssi } = storeToRefs(connectStore)

const bleScreen = BleScreen.getInstance()

const isConnected = computed(() => connectStatus.value === ConnectStatus.Connected)
const isWaiting = computed(
  () => connectStatus.value === ConnectStatus.Disconnected
    || connectStatus.value === ConnectStatus.Connecting
    || connectStatus.value === ConnectStatus.Authorizing,
)

const rssiLabel = computed(() => {
  const v = rssi.value
  if (v === null) return ''
  if (v >= -60) return '信号极强'
  if (v >= -70) return '信号强'
  if (v >= -80) return '信号中'
  if (v >= -90) return '信号弱'
  return '信号极弱'
})

const startListeningRemote = async () => {
  await bleScreen.prepare()
  await bleScreen.startAdvertising()
}
</script>

<template>
  <ControlPanelPage title="遥控器">
    <!-- 未启用 -->
    <view v-if="connectStatus === ConnectStatus.Disabled" class="flex-1 flex flex-col items-center justify-center gap-3 px-6">
      <text class="text-sm text-muted-foreground text-center">启用后可接受遥控器连接</text>
      <button @tap="startListeningRemote">启用遥控器功能</button>
    </view>

    <!-- 等待连接 -->
    <view v-else-if="isWaiting" class="flex-1 flex flex-col items-center justify-center gap-2">
      <view class="i-lucide-bluetooth size-8 text-muted-foreground/40 animate-pulse" />
      <text class="text-sm text-muted-foreground">等待遥控器连接...</text>
    </view>

    <!-- 已连接：展示信号强度 -->
    <view v-else-if="isConnected" class="flex-1 flex flex-col items-center justify-center gap-4">
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
    </view>
  </ControlPanelPage>
</template>
