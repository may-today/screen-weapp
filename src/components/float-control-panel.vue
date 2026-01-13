<script setup lang="ts">
import { onReady, onUnload, ref, storeToRefs } from 'wevu'
import FloatControlPanelNavButton from '@/components/float-control-panel-nav-button.vue'
import FloatControlPanelPageLibrary from '@/components/float-control-panel-page-library.vue'
import FloatControlPanelPagePlaying from '@/components/float-control-panel-page-playing.vue'
import { useUi } from '@/stores/ui'
import { hooks } from '@/utils/hook'

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

const handleTabTap = (e: WechatMiniprogram.CustomEvent) => {
  const { tab } = e.currentTarget.dataset
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
    @afterleave="handleClosePanel"
    custom-style="width: 50%; margin-left: 50%; background-color: transparent;"
  >
    <view class="h-full w-full flex flex-col items-end justify-end">
      <view
        class="flex-1 w-full max-w-[500px] max-h-[600px] flex flex-row overflow-hidden rounded-xl bg-card text-foreground opacity-85"
      >
        <view class="flex flex-col p-2 border-r border-border shrink-0">
          <view class="flex-1">
            <FloatControlPanelNavButton
              icon-class="i-lucide-monitor"
              title="正在展示"
              :active="currentTab === 'playing'"
              data-tab="playing"
              @tap="handleTabTap"
            />
            <FloatControlPanelNavButton
              icon-class="i-lucide-library"
              title="内容库"
              :active="currentTab === 'library'"
              data-tab="library"
              @tap="handleTabTap"
            />
          </view>
          <FloatControlPanelNavButton icon-class="i-lucide-log-out" title="退出屏幕" @tap="handleExit" />
          <FloatControlPanelNavButton
            icon-class="i-lucide-blend"
            title="遥控器"
            :active="currentTab === 'remote'"
            data-tab="remote"
            @tap="handleTabTap"
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
