<script setup lang="ts">
import { computed, onUnload, ref } from 'wevu'
import { storeToRefs } from 'wevu/store'
import ConnectSearchDeviceList from '@/components/remote/connect-search-device-list.vue'
import ConnectOkState from '@/components/remote/connect-ok-state.vue'
import { useConnectStore } from '@/stores/connect'
import { BleRemote } from '@/utils/bleRemote'
import { ConnectStatus } from '@/types/connect'
import { enableShare } from '@/utils/share'

const connectStore = useConnectStore()
const { connectStatus, currentScreenMeta, rssi } = storeToRefs(connectStore)
const bleRemote = BleRemote.getInstance()

const searchedDeviceList = ref<WechatMiniprogram.BlueToothDevice[]>([])
const selectedDevice = ref<WechatMiniprogram.BlueToothDevice | null>(null)
const isScanning = ref(false)
const isStartingScan = ref(false)
const isDisconnecting = ref(false)

definePageJson({
  backgroundColor: '#171717',
  backgroundColorBottom: '#171717',
  backgroundColorContent: '#171717',
  backgroundColorTop: '#171717',
  disableScroll: true,
  navigationBarBackgroundColor: '#171717',
  navigationBarTitleText: '连接屏幕',
})

enableShare({ timeline: false })

const isConnecting = computed(
  () => connectStatus.value === ConnectStatus.Connecting || connectStatus.value === ConnectStatus.Authorizing,
)

const statusTitle = computed(() => {
  if (connectStatus.value === ConnectStatus.Authorizing) return '正在确认屏幕'
  if (connectStatus.value === ConnectStatus.Connecting) return '正在连接屏幕'
  if (isScanning.value) return '正在查找屏幕'
  return '查找屏幕'
})

const selectedDeviceName = computed(() => {
  if (currentScreenMeta.value?.displayName) return currentScreenMeta.value.displayName
  if (selectedDevice.value?.name) return selectedDevice.value.name
  return '屏幕设备'
})

const stopScan = async () => {
  if (!isScanning.value) return
  isScanning.value = false
  await bleRemote.stopScanning().catch(() => { })
}

onUnload(() => {
  void stopScan()
})

const handleStartScan = async () => {
  if (isStartingScan.value || isConnecting.value) return
  isStartingScan.value = true
  searchedDeviceList.value = []
  selectedDevice.value = null
  try {
    if (connectStatus.value === ConnectStatus.Disabled) {
      await bleRemote.prepare()
    }
    bleRemote.startScanning((deviceList) => {
      searchedDeviceList.value = deviceList
    })
    isScanning.value = true
  }
  catch (err) {
    console.error('[RemoteConnect] start scan failed', err)
    wx.showToast({
      title: '开启查找失败',
      icon: 'none',
    })
  }
  finally {
    isStartingScan.value = false
  }
}

const handleSelectDevice = async (device: WechatMiniprogram.BlueToothDevice) => {
  if (isConnecting.value) return
  selectedDevice.value = device
  await stopScan()
  try {
    await bleRemote.connectDevice(device.deviceId)
    await stopScan()
  }
  catch (err) {
    console.error('[RemoteConnect] connect failed', err)
    connectStore.setConnectStatus(ConnectStatus.Disconnected)
  }
}

const handleDisconnect = async () => {
  if (isDisconnecting.value) return
  isDisconnecting.value = true
  await stopScan()
  try {
    await bleRemote.disconnect()
  }
  finally {
    connectStore.setCurrentScreenMeta(null)
    connectStore.setRssi(null)
    connectStore.setConnectStatus(ConnectStatus.Disconnected)
    searchedDeviceList.value = []
    selectedDevice.value = null
    isDisconnecting.value = false
  }
}

const handleRefreshScan = async () => {
  await stopScan()
  await handleStartScan()
}
</script>

<template>
  <view class="flex h-full flex-col bg-background text-foreground">
    <view class="flex flex-1 px-4 pt-6 pb-4 flex-col overflow-hidden gap-4">
      <view class="shrink-0">
        <text class="block text-2xl font-semibold">{{ statusTitle }}</text>
        <text class="mt-2 block text-sm text-muted-foreground">
          {{ connectStatus === ConnectStatus.Connected ? '遥控器已准备好发送控制指令' : '选择附近的 MayScreen 屏幕设备' }}
        </text>
      </view>

      <view v-if="connectStatus === ConnectStatus.Disabled"
        class="flex flex-1 flex-col items-center justify-center gap-5">
        <view class="flex size-20 items-center justify-center rounded-full bg-card text-theme-foreground">
          <view class="i-lucide-bluetooth-searching size-10" />
        </view>
        <view class="flex flex-col items-center gap-2">
          <text class="text-lg font-medium">尚未开启查找</text>
          <text class="text-center text-sm text-muted-foreground">开启蓝牙查找后可连接屏幕端</text>
        </view>
        <button :loading="isStartingScan" @tap="handleStartScan">搜索设备</button>
      </view>

      <view v-else-if="connectStatus === ConnectStatus.Disconnected" class="flex min-h-0 flex-1 flex-col gap-4">
        <view class="flex flex-row items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
          <view class="flex flex-row items-center gap-2">
            <view class="i-lucide-radar size-5 text-theme-foreground" :class="{ 'animate-pulse': isScanning }" />
            <text class="text-sm text-muted-foreground">{{ isScanning ? '搜索中...' : '搜索已停止' }}</text>
          </view>
          <view class="flex flex-row items-center gap-2">
            <button v-if="isScanning" size="mini" @tap="stopScan">停止</button>
            <button v-else size="mini" :loading="isStartingScan" @tap="handleRefreshScan">开始搜索</button>
          </view>
        </view>

        <connect-search-device-list v-if="searchedDeviceList.length > 0" :list="searchedDeviceList"
          @select="handleSelectDevice" />
        <view v-else class="flex flex-1 flex-col items-center justify-center gap-3 pb-16">
          <text class="text-sm text-muted-foreground">{{ isScanning ? '暂未发现屏幕设备' : '搜索已停止' }}</text>
        </view>
      </view>

      <view v-else-if="isConnecting" class="flex flex-1 flex-col items-center justify-center gap-4">
        <view class="flex size-20 items-center justify-center rounded-full bg-card text-theme-foreground">
          <view class="i-lucide-loader-circle size-10 animate-spin" />
        </view>
        <view class="flex flex-col items-center gap-2">
          <text class="text-lg font-medium">{{ selectedDeviceName }}</text>
          <text class="text-center text-sm text-muted-foreground">
            {{ connectStatus === ConnectStatus.Authorizing ? '正在读取屏幕信息' : '正在建立蓝牙连接' }}
          </text>
        </view>
      </view>

      <view v-else-if="connectStatus === ConnectStatus.Connected" class="flex min-h-0 flex-1 flex-col gap-4">
        <view class="rounded-lg border border-border bg-card px-4 py-3">
          <view class="flex flex-row items-center justify-between gap-3">
            <view class="flex flex-col gap-1">
              <text class="text-sm text-muted-foreground">已连接</text>
              <text class="font-medium">{{ selectedDeviceName }}</text>
            </view>
            <signal-icon :rssi="rssi" />
          </view>
        </view>
        <connect-ok-state v-if="currentScreenMeta" @disconnect="handleDisconnect" />
        <view v-else class="flex flex-1 flex-col items-center justify-center gap-3 px-6">
          <view class="i-lucide-circle-check size-10 text-theme-foreground" />
          <text class="text-sm text-muted-foreground">连接成功</text>
          <button :loading="isDisconnecting" @tap="handleDisconnect">断开连接</button>
        </view>
      </view>
    </view>
  </view>
</template>
