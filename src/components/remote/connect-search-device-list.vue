<script setup lang="ts">
import ConnectSearchDeviceListItem from './connect-search-device-list-item.vue'
import { BleRemote } from '@/utils/bleRemote'

const props = defineProps<{
  list: WechatMiniprogram.BlueToothDevice[]
}>()

const bleRemote = BleRemote.getInstance()

const handleSelectItem = async (item: WechatMiniprogram.BlueToothDevice) => {
  wx.vibrateShort({ type: 'light' })
  try {
    await bleRemote.connectDevice(item.deviceId)
  } catch {
    // connectDevice 内部已 toast 错误
  }
}
</script>

<template>
  <view class="flex-1 flex flex-col px-4 pb-8 gap-3">
    <connect-search-device-list-item v-for="item in props.list" :key="item.deviceId" :device="item"
      @select="handleSelectItem(item)" />
  </view>
</template>
