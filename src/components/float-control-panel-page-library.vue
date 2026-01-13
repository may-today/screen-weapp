<script setup lang="ts">
import { ref } from 'wevu'
import FloatControlPanelPageLibraryTabDataset from '@/components/float-control-panel-page-library-tab-dataset.vue'
import FloatControlPanelPageLibraryTabWebsearch from '@/components/float-control-panel-page-library-tab-websearch.vue'

const currentTab = ref<'dataset' | 'web-search'>('dataset')

const handleTabTap = (e: WechatMiniprogram.CustomEvent) => {
  const { tab } = e.currentTarget.dataset
  console.log('handleTabTap', e.currentTarget.dataset)
  currentTab.value = tab
}
</script>

<template>
  <view class="flex flex-col h-full">
    <view class="flex-1 overflow-hidden">
      <FloatControlPanelPageLibraryTabDataset v-if="currentTab === 'dataset'" />
      <FloatControlPanelPageLibraryTabWebsearch v-if="currentTab === 'web-search'" />
    </view>
    <view class="flex flex-row items-center h-12 px-3 border-t border-border gap-2 text-sm">
      <view
        class="px-2 py-1.5 rounded-md"
        :class="{
          'bg-secondary text-secondary-foreground font-medium': currentTab === 'dataset',
          'text-muted-foreground': currentTab !== 'dataset',
        }"
        hover-class="bg-accent text-accent-foreground"
        data-tab="dataset"
        @tap="handleTabTap"
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
        data-tab="web-search"
        @tap="handleTabTap"
      >
        <text>网络搜索</text>
      </view>
    </view>
  </view>
</template>
