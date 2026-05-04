<script setup lang="ts">
import { computed, onReady, onUnload, ref, storeToRefs } from 'wevu'
import { useRouter } from 'wevu/router'
import { hooks } from '@/utils/hook'
import { useConnectStore } from '@/stores/connect'
import { ConnectStatus } from '@/types/connect'
import ControlPanelNavButton from './control-panel-nav-button.vue'
import ControlPanelPageLibrary from './control-panel-page-library.vue'
import ControlPanelPagePlaying from './control-panel-page-playing.vue'
import ControlPanelPageRemote from './control-panel-page-remote.vue'
import Empty from '../empty.vue'

const props = defineProps<{
  panelClass?: string
  mode?: 'remote' | 'screen'
}>()

const router = useRouter()
const connectStore = useConnectStore()
const { connectStatus } = storeToRefs(connectStore)

const isRemoteConnected = computed(() => connectStatus.value === ConnectStatus.Connected)
const isRemoteConnecting = computed(
  () => connectStatus.value === ConnectStatus.Connecting || connectStatus.value === ConnectStatus.Authorizing,
)

const handleConnectTap = () => {
  router.push('/pages/remote/device-connect')
}

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
    content: '确定要退出屏幕吗？将会断开与所有遥控器的连接',
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
      <Empty
        v-if="props.mode === 'remote' && !isRemoteConnected && !isRemoteConnecting"
        type="none"
        text="尚未连接到屏幕"
        action-text="去连接"
        @action="handleConnectTap"
      />
      <Empty
        v-else-if="props.mode === 'remote' && isRemoteConnecting"
        type="loading"
        text="正在连接屏幕..."
      />
      <block v-else>
        <ControlPanelPagePlaying v-if="currentTab === 'playing'" :mode="props.mode" />
        <ControlPanelPageLibrary v-if="currentTab === 'library'" :mode="props.mode" />
        <ControlPanelPageRemote v-if="currentTab === 'remote'" />
      </block>
    </view>
  </view>
</template>
