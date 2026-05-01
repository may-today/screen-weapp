<script setup lang="ts">
import { onReady, onUnload, ref, storeToRefs } from 'wevu'
import { useUi } from '@/stores/ui'
import { hooks } from '@/utils/hook'
import ControlPanel from '../control/control-panel.vue'

const ui = useUi()
const { showScreenFloatPanel } = storeToRefs(ui)
const headerHeight = ref(0)
const rightMargin = ref(0)
const currentTab = ref('playing')

onReady(() => {
  console.log('onReady float-control-panel')
  calculateHeaderStyle()
  hooks.hook('trigger-tab', handleTriggerTab)
})

onUnload(() => {
  console.log('onUnload float-control-panel')
  hooks.removeHook('trigger-tab', handleTriggerTab)
})

const calculateHeaderStyle = () => {
  const menuRect = wx.getMenuButtonBoundingClientRect()
  const windowInfo = wx.getWindowInfo()
  headerHeight.value = menuRect.top * 2 + menuRect.height
  rightMargin.value = Math.max(windowInfo.windowWidth, windowInfo.windowHeight) - menuRect.left
  console.log('calculateHeaderStyle', headerHeight.value, rightMargin.value)
}

const handleClosePanel = () => {
  ui.setShowScreenFloatPanel(false)
}

const handleCatchTap = () => {
}

const handleTriggerTab = (payload: { tab: string }) => {
  currentTab.value = payload.tab
}
</script>

<template>
  <page-container :show="showScreenFloatPanel" overlay position="right"
    custom-style="width: 50%; margin-left: 50%; background-color: transparent;" @afterleave="handleClosePanel">
    <view class="h-full w-full flex flex-col items-end justify-end" @tap.stop="handleClosePanel">
      <ControlPanel panel-class="max-w-125 max-h-150 rounded-xl opacity-85 rounded-xl" @tap.stop="handleCatchTap" mode="screen" />
    </view>
  </page-container>
</template>
