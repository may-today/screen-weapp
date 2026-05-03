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

const router = useRouter()
const transmit = useTransmitStore()

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
    message: '确定要退出遥控器吗？',
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
function jumpToScreenPage() {
  router.push('/pages/screen/index')
}
function jumpToRemotePage() {
  router.push('/pages/remote/playing')
}

</script>

<template>
  <view class="flex flex-col h-full">
    <remote-header />
    <ControlPanel panel-class="flex-1 overflow-hidden" mode="remote" />
    <!-- <remote-footer-tab /> -->
  </view>
</template>
