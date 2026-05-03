<script setup lang="ts">
import { onReady, onUnload, ref } from 'wevu'
import { hooks } from '@/utils/hook'
import ControlPanelNavButton from './control-panel-nav-button.vue'
import ControlPanelPageLibrary from './control-panel-page-library.vue'
import ControlPanelPagePlaying from './control-panel-page-playing.vue'
import ControlPanelPageRemote from './control-panel-page-remote.vue'

const props = defineProps<{
  panelClass?: string
  mode?: 'remote' | 'screen'
}>()

const headerHeight = ref(0)
const rightMargin = ref(0)
const currentTab = ref('playing')

onReady(() => {
  calculateHeaderStyle()
  hooks.hook('trigger-tab', handleTriggerTab)
})

onUnload(() => {
  hooks.removeHook('trigger-tab', handleTriggerTab)
})

const calculateHeaderStyle = () => {
  const menuRect = wx.getMenuButtonBoundingClientRect()
  const windowInfo = wx.getWindowInfo()
  headerHeight.value = menuRect.top * 2 + menuRect.height
  rightMargin.value = Math.max(windowInfo.windowWidth, windowInfo.windowHeight) - menuRect.left
  console.log('calculateHeaderStyle', headerHeight.value, rightMargin.value)
}

const handleTabTap = (tab: string) => {
  currentTab.value = tab
}

const handleTriggerTab = (payload: { tab: string }) => {
  currentTab.value = payload.tab
}

const handleExit = () => {
  wx.showModal({
    content: '确定要退出屏幕吗？',
    success(res) {
      if (res.confirm) {
        wx.reLaunch({
          url: '/pages/index/index',
        })
      }
    },
  })
}
</script>

<template>
  <view class="flex-1 w-full h-full flex flex-row overflow-hidden bg-card text-foreground" :class="props.panelClass">
    <view class="flex flex-col p-2 border-r border-border shrink-0">
      <view class="flex-1">
        <ControlPanelNavButton icon-class="i-lucide-monitor" title="正在展示" :active="currentTab === 'playing'"
          @tap="handleTabTap('playing')" />
        <ControlPanelNavButton icon-class="i-lucide-library" title="内容库" :active="currentTab === 'library'"
          @tap="handleTabTap('library')" />
      </view>
      <block v-if="props.mode === 'screen'">
        <ControlPanelNavButton icon-class="i-lucide-log-out" title="退出屏幕" @tap="handleExit" />
        <ControlPanelNavButton icon-class="i-lucide-blend" title="遥控器" :active="currentTab === 'remote'"
          @tap="handleTabTap('remote')" />
      </block>
    </view>
    <view class="flex-1 overflow-hidden">
      <ControlPanelPagePlaying v-if="currentTab === 'playing'" :mode="props.mode" />
      <ControlPanelPageLibrary v-if="currentTab === 'library'" :mode="props.mode" />
      <ControlPanelPageRemote v-if="currentTab === 'remote'" />
    </view>
  </view>
</template>
