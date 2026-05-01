<script setup lang="ts">
import { onReady, onShow, onUnload, ref } from 'wevu'
import { storeToRefs } from 'wevu/store'
import ConnectSearchDeviceList from '@/components/remote/connect-search-device-list.vue'
import ConnectOkState from '@/components/remote/connect-ok-state.vue'
import { useConnectStore } from '@/stores/connect'
import { BleRemote } from '@/utils/bleRemote'
import { ConnectStatus } from '@/types/connect'

const connectStore = useConnectStore()
const { connectStatus } = storeToRefs(connectStore)
const bleRemote = BleRemote.getInstance()

const searchedDeviceList = ref<WechatMiniprogram.BlueToothDevice[]>([])

definePageJson({
  backgroundColor: '#171717',
  backgroundColorBottom: '#171717',
  backgroundColorContent: '#171717',
  backgroundColorTop: '#171717',
  disableScroll: true,
  navigationBarBackgroundColor: '#171717',
  navigationBarTitleText: '连接屏幕',
})

onReady(() => {
  
})
onShow(() => {
  
})
onUnload(() => {
  bleRemote.stopScanning()
})

const handleStartScan = async () => {
  await bleRemote.prepare()
  bleRemote.startScanning((deviceList) => {
    searchedDeviceList.value = deviceList
  })
}
</script>

<template>
  <view class="flex flex-col h-full">
    <block v-if="connectStatus === ConnectStatus.Disabled">
      <text>未开启</text>
      <button @tap="handleStartScan">搜索设备</button>
    </block>
    <block v-if="connectStatus === ConnectStatus.Disconnected">
      <text>设备搜索中</text>
      <connect-search-device-list :list="searchedDeviceList" />
    </block>
    <block v-if="connectStatus === ConnectStatus.Connected">
      <text>已连接</text>
      <connect-ok-state v-if="connectStore.currentScreenMeta" />
    </block>
  </view>
</template>
