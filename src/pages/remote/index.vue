<script setup lang="ts">
import { onReady, onShow, onUnload } from 'wevu'
import { useRouter } from 'wevu/router'
import RemoteHeader from '@/components/remote/remote-header.vue'
// import RemoteFooterTab from '@/components/remote/remote-footer-tab.vue';
import ControlPanel from '@/components/control/control-panel.vue'
import { timeServer } from '@/utils/timeServer'
import { hooks } from '@/utils/hook'
import { BleRemote } from '@/utils/bleRemote'
import { useTransmitStore } from '@/stores/transmit'
import { usePlayStateStore } from '@/stores/playState'
import { useDataStore } from '@/stores/data'
import { Command } from '@/types'

const transmit = useTransmitStore()
const playState = usePlayStateStore()
const dataStore = useDataStore()

const bleRemote = BleRemote.getInstance()
bleRemote.setCommandListener((command, payload) => {
  switch (command) {
    case Command.LyricSetIndex:
      playState.setCurrentLyricIndex(parseInt(payload))
      break
    case Command.LyricAutoPlay:
      playState.setAutoPlay(payload === '1')
      break
    case Command.ChangeSongId: {
      const song = dataStore.allDataDict.value[payload]
      if (song) playState.setCurrentSongData(song)
      break
    }
  }
})
bleRemote.setLargeDataListener((raw) => {
  try {
    const envelope = JSON.parse(raw)
    if (envelope.cmd === Command.ChangeSongData && envelope.data) {
      playState.setCurrentSongData(envelope.data)
    }
  }
  catch (e) {
    console.error('[Remote] Failed to parse large data from screen:', e)
  }
})

definePageJson({
  backgroundColor: '#171717',
  backgroundColorBottom: '#171717',
  backgroundColorContent: '#171717',
  backgroundColorTop: '#171717',
  disableScroll: true,
  navigationBarBackgroundColor: '#171717',
  navigationBarTitleText: '遥控器',
})

onReady(() => {
  wx.setKeepScreenOn({
    keepScreenOn: true,
  })
  timeServer.prepare()
  wx.enableAlertBeforeUnload({
    message: '确定要退出遥控器吗？将会断开与屏幕的连接',
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
  transmit.$reset()
  timeServer.destroy()
  BleRemote.getInstance().destroy()
})
</script>

<template>
  <view class="flex flex-col h-full">
    <remote-header />
    <ControlPanel panel-class="flex-1 overflow-hidden" mode="remote" />
    <!-- <remote-footer-tab /> -->
  </view>
</template>
