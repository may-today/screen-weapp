<script setup lang="ts">
import { computed, onUnload, ref } from 'wevu'
import { storeToRefs } from 'wevu/store'
import ConnectSearchDeviceList from '@/components/remote/connect-search-device-list.vue'
import { useConnectStore } from '@/stores/connect'
import { BleRemote } from '@/utils/bleRemote'
import { ConnectStatus } from '@/types/connect'
import { ScreenDevice } from '@/types/device'
import { enableShare } from '@/utils/share'

const connectStore = useConnectStore()
const { screens, adapterReady } = storeToRefs(connectStore)
const bleRemote = BleRemote.getInstance()

const searchedDeviceList = ref<WechatMiniprogram.BlueToothDevice[]>([])
const isScanning = ref(false)
const isStartingScan = ref(false)
const disconnectingIds = ref<Set<string>>(new Set())

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

const connectedScreens = computed(() =>
  [...screens.value.values()].filter(s => s.status === ConnectStatus.Connected),
)

const connectingScreens = computed(() =>
  [...screens.value.values()].filter(
    s => s.status === ConnectStatus.Connecting || s.status === ConnectStatus.Authorizing,
  ),
)

const hasAnyScreen = computed(() => screens.value.size > 0)
const screenList = computed(() => [...screens.value.values()])

// 过滤掉已在 screens Map 中的设备（已连接或正在连接）
const filteredSearchList = computed(() =>
  searchedDeviceList.value.filter(d => !screens.value.has(d.deviceId)),
)

const statusTitle = computed(() => {
  if (!adapterReady.value) return '连接屏幕'
  if (connectingScreens.value.length > 0) return '正在连接屏幕'
  if (connectedScreens.value.length > 0) return `已连接 ${connectedScreens.value.length} 台屏幕`
  if (isScanning.value) return '正在查找屏幕'
  return '查找屏幕'
})

const deviceImgSrc = (device: number | undefined) => {
  if (device && device !== ScreenDevice.Phone) return `../../assets/device-${device}.png`
  return '../../assets/device-1.png'
}

const stopScan = async () => {
  if (!isScanning.value) return
  isScanning.value = false
  await bleRemote.stopScanning().catch(() => {})
}

onUnload(() => {
  void stopScan()
})

const handleStartScan = async () => {
  if (isStartingScan.value) return
  isStartingScan.value = true
  searchedDeviceList.value = []
  try {
    if (!adapterReady.value) {
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
  if (screens.value.has(device.deviceId)) {
    wx.showToast({ title: '该设备已连接', icon: 'none' })
    return
  }
  try {
    await bleRemote.connectDevice(device.deviceId)
  }
  catch (err) {
    console.error('[RemoteConnect] connect failed', err)
  }
}

const handleDisconnectOne = async (deviceId: string) => {
  if (disconnectingIds.value.has(deviceId)) return
  const next = new Set(disconnectingIds.value)
  next.add(deviceId)
  disconnectingIds.value = next
  try {
    await bleRemote.disconnectDevice(deviceId)
  }
  finally {
    const after = new Set(disconnectingIds.value)
    after.delete(deviceId)
    disconnectingIds.value = after
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

      <!-- 标题区 -->
      <view class="shrink-0">
        <text class="block text-2xl font-semibold">{{ statusTitle }}</text>
        <text class="mt-2 block text-sm text-muted-foreground">
          {{
            connectedScreens.length > 0
              ? '可继续搜索并连接更多屏幕设备'
              : '选择附近的 MayScreen 屏幕设备'
          }}
        </text>
      </view>

      <!-- 未初始化：尚未开启查找 -->
      <view v-if="!adapterReady" class="flex flex-1 flex-col items-center justify-center gap-5">
        <view class="flex size-20 items-center justify-center rounded-full bg-card text-theme-foreground">
          <view class="i-lucide-bluetooth-searching size-10" />
        </view>
        <view class="flex flex-col items-center gap-2">
          <text class="text-lg font-medium">尚未开启查找</text>
          <text class="text-center text-sm text-muted-foreground">开启蓝牙查找后可连接屏幕端</text>
        </view>
        <button :loading="isStartingScan" @tap="handleStartScan">搜索设备</button>
      </view>

      <!-- 已初始化：连接列表 + 扫描区域共存 -->
      <view v-else class="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">

        <!-- 已连接的屏幕列表 -->
        <view v-if="hasAnyScreen" class="shrink-0 flex flex-col gap-2">
          <text class="text-xs font-medium text-muted-foreground uppercase tracking-wide">已连接的屏幕</text>
          <view
            v-for="screen in screenList"
            :key="screen.deviceId"
            class="rounded-lg border border-border bg-card px-4 py-3 flex flex-row items-center gap-3"
          >
            <image :src="deviceImgSrc(screen.meta?.device)" class="size-10 shrink-0" mode="aspectFit" />
            <view class="flex-1 flex flex-col gap-0.5 min-w-0">
              <text class="font-medium" :numberOfLines="1">{{ screen.meta?.nickName || '设备信息获取中' }}</text>
              <text v-if="screen.meta?.displayName" class="text-xs text-muted-foreground font-mono">{{ screen.meta?.displayName }}</text>
              <view
                v-if="screen.status === ConnectStatus.Connecting || screen.status === ConnectStatus.Authorizing"
                class="flex flex-row items-center gap-1"
              >
                <view class="i-lucide-loader-circle size-3 text-yellow-400 animate-spin" />
                <text class="text-xs text-yellow-400">
                  {{ screen.status === ConnectStatus.Authorizing ? '确认中' : '连接中' }}
                </text>
              </view>
            </view>
            <signal-icon v-if="screen.status === ConnectStatus.Connected" :rssi="screen.rssi" />
            <button
              size="mini"
              :loading="disconnectingIds.has(screen.deviceId)"
              @tap="handleDisconnectOne(screen.deviceId)"
            >断开</button>
          </view>
        </view>

        <!-- 扫描控制栏 -->
        <view class="shrink-0 flex flex-row items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
          <view class="flex flex-row items-center gap-2">
            <view class="i-lucide-radar size-5 text-theme-foreground" :class="{ 'animate-pulse': isScanning }" />
            <text class="text-sm text-muted-foreground">{{ isScanning ? '搜索中...' : '搜索已停止' }}</text>
          </view>
          <view class="flex flex-row items-center gap-2">
            <button v-if="isScanning" size="mini" @tap="stopScan">停止</button>
            <button v-else size="mini" :loading="isStartingScan" @tap="handleRefreshScan">开始搜索</button>
          </view>
        </view>

        <!-- 扫描结果（过滤已连接设备） -->
        <connect-search-device-list
          v-if="filteredSearchList.length > 0"
          :list="filteredSearchList"
          @select="handleSelectDevice"
        />
        <view v-else class="flex flex-1 flex-col items-center justify-center gap-3 pb-16">
          <text class="text-sm text-muted-foreground text-center">
            {{ isScanning ? '暂未发现新的屏幕设备\n请在屏幕端开启遥控器功能' : '搜索已停止' }}
          </text>
        </view>

      </view>
    </view>
  </view>
</template>
