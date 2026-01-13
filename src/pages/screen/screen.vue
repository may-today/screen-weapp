<script setup lang="ts">
import { onReady, onShow, onUnload } from 'wevu'
import FloatControlBar from '@/components/float-control-bar.vue'
import ScreenPage from '@/components/screen-page.vue'
import { useData } from '@/stores/data'
import { usePlayState } from '@/stores/playState'
import { useUi } from '@/stores/ui'
import { hooks } from '@/utils/hook'
import { timeServer } from '@/utils/timeServer'

const playState = usePlayState()
const data = useData()
const ui = useUi()

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
  ui.$reset()
  data.$reset()
  playState.$reset()
  timeServer.destroy()
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
