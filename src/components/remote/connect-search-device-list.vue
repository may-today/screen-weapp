<script setup lang="ts">
import ConnectSearchDeviceListItem from './connect-search-device-list-item.vue'

const props = defineProps<{
  list: WechatMiniprogram.BlueToothDevice[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  select: [device: WechatMiniprogram.BlueToothDevice]
}>()

const handleSelectItem = (item: WechatMiniprogram.BlueToothDevice) => {
  if (props.disabled) return
  wx.vibrateShort({ type: 'light' })
  emit('select', item)
}
</script>

<template>
  <view class="flex-1 flex flex-col px-4 pb-8 gap-3">
    <connect-search-device-list-item v-for="item in props.list" :key="item.deviceId" :device="item"
      @select="handleSelectItem(item)" />
  </view>
</template>
