<script setup lang="ts">
import { onReady, onShow, onUnload } from 'wevu'
import FloatControlBar from '@/components/screen/float-control-bar.vue'
import ScreenPage from '@/components/screen/screen-page.vue'
import { useDataStore } from '@/stores/data'
import { usePlayStateStore } from '@/stores/playState'
import { useUiStore } from '@/stores/ui'
import { useConnectStore } from '@/stores/connect'
import { hooks } from '@/utils/hook'
import { timeServer } from '@/utils/timeServer'
import { BleScreen } from '@/utils/bleScreen'

const playState = usePlayStateStore()
const data = useDataStore()
const ui = useUiStore()
const connect = useConnectStore()

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
  ui.$reset()
  data.$reset()
  playState.$reset()
  timeServer.destroy()
  BleScreen.getInstance().destroy()
})
</script>

<template>
  <view class="dark h-screen w-screen bg-black text-white">
    <ScreenPage />
    <FloatControlBar />
    <!-- <float-status-bar /> -->
  </view>
</template>

<style lang="css" scoped>
page {
  background-color: #000000;
}
</style>
