<script setup lang="ts">
import { onReady, onShow, onUnload } from 'wevu'
import { storeToRefs } from 'wevu/store'
import FloatControlBar from '@/components/screen/float-control-bar.vue'
import ConnectStatus from '@/components/connect-status.vue'
import ScreenPage from '@/components/screen/screen-page.vue'
import { useDataStore } from '@/stores/data'
import { usePlayStateStore } from '@/stores/playState'
import { useUiStore } from '@/stores/ui'
import { useConnectStore } from '@/stores/connect'
import { useTransmitStore } from '@/stores/transmit'
import { hooks } from '@/utils/hook'
import { timeServer } from '@/utils/timeServer'
import { BleScreen } from '@/utils/bleScreen'
import { Command } from '@/types'
import { enableShare } from '@/utils/share'

const playState = usePlayStateStore()
const data = useDataStore()
const ui = useUiStore()
const connectStore = useConnectStore()
const transmit = useTransmitStore()
const { allDataDict } = storeToRefs(data)

const bleScreen = BleScreen.getInstance()
bleScreen.setCommandListener((command, payload) => {
  switch (command) {
    case Command.LyricSetIndex:
      playState.setCurrentLyricIndex(parseInt(payload))
      break
    case Command.LyricAutoPlay:
      if (payload === '1') {
        timeServer.start()
      } else {
        timeServer.pause()
      }
      break
    case Command.ChangeSongId: {
      const song = allDataDict.value[payload]
      if (song) playState.setCurrentSongData(song)
      break
    }
    case Command.ScreenBlackScreen:
      console.log('[Screen] TODO: black screen')
      break
    case Command.Rssi:
      connectStore.setRssi(parseInt(payload))
      break
  }
})
bleScreen.setLargeDataListener((raw) => {
  try {
    const envelope = JSON.parse(raw)
    if (envelope.cmd === Command.ChangeSongData && envelope.data) {
      playState.setCurrentSongData(envelope.data)
    }
  }
  catch (e) {
    console.error('[Screen] Failed to parse large data:', e)
  }
})

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

enableShare({ timeline: false })

onReady(() => {
  wx.setKeepScreenOn({
    keepScreenOn: true,
  })
  timeServer.prepare()
  wx.enableAlertBeforeUnload({
    message: '确定要退出屏幕吗？将会断开与所有遥控器的连接',
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
  transmit.$reset()
  timeServer.destroy()
  void BleScreen.getInstance().destroy({ resetInstance: true })
})
</script>

<template>
  <view class="dark h-screen w-screen bg-black text-white">
    <ScreenPage />
    <FloatControlBar />
    <view class="absolute bottom-4 left-4">
      <ConnectStatus mode="screen" />
    </view>
  </view>
</template>

<style lang="css" scoped>
page {
  background-color: #000000;
}
</style>
