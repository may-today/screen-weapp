<script setup lang="ts">
  import { onReady, onShow, onUnload } from 'wevu'
  import { appState } from '@/stores/appState'
  import { data } from '@/stores/data'
  import { hooks } from '@/utils/hook'
  import { timeServer } from '@/utils/timeServer'

  definePageJson({
    pageOrientation: 'landscape',
    navigationBarBackgroundColor: '#000000',
    navigationBarTextStyle: 'white',
    navigationStyle: 'custom',
    backgroundColor: '#000000',
    backgroundColorContent: '#000000',
    backgroundColorTop: '#000000',
    backgroundColorBottom: '#000000',
    disableScroll: true,
    navigationBarRightButton: { hide: true },
  })

  onReady(() => {
    wx.setKeepScreenOn({
      keepScreenOn: true,
    })
    timeServer.prepare()
    wx.enableAlertBeforeUnload({
      message: '确定要退出屏幕吗？',
    })
  })
  onShow(() => {
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
