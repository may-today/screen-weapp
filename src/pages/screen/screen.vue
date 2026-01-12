<script setup lang="ts">
import { onReady, onShow, onUnload } from 'wevu'
import { appState } from '@/stores/appState'
import { data } from '@/stores/data'
import { hooks } from '@/utils/hook'
import { timeServer } from '@/utils/timeServer'

definePageJson({
  backgroundColor: '#000000',
  backgroundColorBottom: '#000000',
  backgroundColorContent: '#000000',
  backgroundColorTop: '#000000',
  disableScroll: true,
  navigationBarBackgroundColor: '#000000',
  navigationBarRightButton: { hide: true },
  navigationBarTextStyle: 'white',
  navigationStyle: 'custom',
  pageOrientation: 'landscape',
  usingComponents: {
    'float-control-bar': '/components/float-control-bar',
  },
})

onReady(() => {
  console.log('onReady screen')
  wx.setKeepScreenOn({
    keepScreenOn: true,
  })
  timeServer.prepare()
  wx.enableAlertBeforeUnload({
    message: '确定要退出屏幕吗？',
  })
})
onShow(() => {
  console.log('onShow screen')
  wx.setKeepScreenOn({
    keepScreenOn: true,
  })
})
onUnload(() => {
  wx.setKeepScreenOn({
    keepScreenOn: false,
  })
  hooks.removeAllHooks()
  appState.clearState()
  data.clearState()
  timeServer.destroy()
})
</script>

<template>
  <view class="dark h-screen w-screen bg-black text-white">
    <screen-page />
    <float-control-bar />
    <!-- <float-status-bar /> -->
  </view>
</template>

<style lang="css" scoped>
page {
  background-color: #000000;
}
</style>
