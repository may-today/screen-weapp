<script setup lang="ts">
import { onReady, onUnload, ref, storeToRefs } from 'wevu'
import { useUi } from '@/stores/ui'
import { hooks } from '@/utils/hook'
import FloatControlPanelNavButton from './float-control-panel-nav-button.vue'
import FloatControlPanelPageLibrary from './float-control-panel-page-library.vue'
import FloatControlPanelPagePlaying from './float-control-panel-page-playing.vue'

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
  <page-container
    :show="showScreenFloatPanel"
    overlay
    position="right"
    custom-style="width: 50%; margin-left: 50%; background-color: transparent;"
    @afterleave="handleClosePanel"
  >
    <view class="h-full w-full flex flex-col items-end justify-end" @tap.stop="handleClosePanel">
      <view
        class="flex-1 w-full max-w-125 max-h-150 flex flex-row overflow-hidden rounded-xl bg-card text-foreground opacity-85"
        @tap.stop="handleCatchTap"
      >
        <view class="flex flex-col p-2 border-r border-border shrink-0">
          <view class="flex-1">
            <FloatControlPanelNavButton
              icon-class="i-lucide-monitor"
              title="正在展示"
              :active="currentTab === 'playing'"
              @tap="handleTabTap('playing')"
            />
            <FloatControlPanelNavButton
              icon-class="i-lucide-library"
              title="内容库"
              :active="currentTab === 'library'"
              @tap="handleTabTap('library')"
            />
          </view>
          <FloatControlPanelNavButton icon-class="i-lucide-log-out" title="退出屏幕" @tap="handleExit" />
          <FloatControlPanelNavButton
            icon-class="i-lucide-blend"
            title="遥控器"
            :active="currentTab === 'remote'"
            @tap="handleTabTap('remote')"
          />
        </view>
        <view class="flex-1 overflow-hidden">
          <FloatControlPanelPagePlaying v-if="currentTab === 'playing'" />
          <FloatControlPanelPageLibrary v-if="currentTab === 'library'" />
          <!-- <float-control-panel-page-remote wx:if="{{currentTab === 'remote'}}" /> -->
        </view>
      </view>
    </view>
  </page-container>
</template>
