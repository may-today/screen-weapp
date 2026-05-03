<script setup lang="ts">
import { ref } from 'wevu'
import ControlPanelPageLibraryTabDataset from './control-panel-page-library-tab-dataset.vue'
import ControlPanelPageLibraryTabWebsearch from './control-panel-page-library-tab-websearch.vue'

const props = withDefaults(defineProps<{
  mode?: 'remote' | 'screen'
}>(), { mode: 'remote' })

const currentTab = ref<'dataset' | 'web-search'>('dataset')

const handleTabTap = (tab: 'dataset' | 'web-search') => {
  currentTab.value = tab
}
</script>

<template>
  <view class="flex flex-col h-full">
    <view class="flex-1 overflow-hidden">
      <ControlPanelPageLibraryTabDataset v-if="currentTab === 'dataset'" :mode="props.mode" />
      <ControlPanelPageLibraryTabWebsearch v-if="currentTab === 'web-search'" :mode="props.mode" />
    </view>
    <view class="flex flex-row items-center h-12 px-3 border-t border-border gap-2 text-sm">
      <view
        class="px-2 py-1.5 rounded-md"
        :class="{
          'bg-secondary text-secondary-foreground font-medium': currentTab === 'dataset',
          'text-muted-foreground': currentTab !== 'dataset',
        }"
        hover-class="bg-accent text-accent-foreground"
        @tap="handleTabTap('dataset')"
      >
        <text>曲库</text>
      </view>
      <view
        class="px-2 py-1.5 rounded-md"
        :class="{
          'bg-secondary text-secondary-foreground font-medium': currentTab === 'web-search',
          'text-muted-foreground': currentTab !== 'web-search',
        }"
        hover-class="bg-accent text-accent-foreground"
        @tap="handleTabTap('web-search')"
      >
        <text>网络搜索</text>
      </view>
    </view>
  </view>
</template>
