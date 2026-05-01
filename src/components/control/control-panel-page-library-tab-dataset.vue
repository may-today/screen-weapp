<script setup lang="ts">
import type { SongDetail } from '@/types'
import { onReady, ref, storeToRefs } from 'wevu'
import { useData } from '@/stores/data'
import { useUi } from '@/stores/ui'
import SongList from './song-list.vue'
import ControlPanelPage from './control-panel-page.vue'

const props = withDefaults(
  defineProps<{
    hidden?: boolean
  }>(),
  {
    hidden: false,
  },
)

const datasetDict = {
  mayday: {
    name: '五月天曲库',
    downUrl: 'https://wx-static.ddiu.site/dataset/mayday.json',
  },
  jayzhou: {
    name: '周杰伦曲库',
    downUrl: 'https://wx-static.ddiu.site/dataset/jayzhou.json',
  },
} as Record<
  string,
  {
    name: string
    downUrl: string
  }
>

const dataset = Object.entries(datasetDict).map(([key, item]) => ({
  id: key,
  ...item,
}))

const data = useData()
const ui = useUi()
const cacheKeys = ref<string[]>([])
const { currentDatasetId, currentDatasetName } = storeToRefs(data)

onReady(() => {
  refreshCacheKeys()
})

const refreshCacheKeys = async () => {
  const storageInfo = await wx.getStorageInfo()
  const storageKeys = storageInfo.keys
  const datasetKeys = storageKeys.filter(key => key.startsWith('dataset:')).map(key => key.replace('dataset:', ''))
  cacheKeys.value = datasetKeys
}

const handleResetDataset = () => {
  data.saveDetailList([])
}

const handleSetList = (id: string) => {
  if (id && !datasetDict[id]) {
    return
  }
  wx.showLoading({
    title: '加载中',
  })
  // read cache
  if (cacheKeys.value.includes(id)) {
    const detailList = wx.getStorageSync<SongDetail[]>(`dataset:${id}`)
    if (Array.isArray(detailList)) {
      data.saveDetailList(detailList, {
        id,
        name: datasetDict[id].name,
      })
      wx.hideLoading()
      return
    }
  }
  // request download
  ui.setGlobalLoading(true)
  wx.request({
    url: datasetDict[id].downUrl,
    success: async (res) => {
      ui.setGlobalLoading(false)
      wx.hideLoading()
      if (Array.isArray(res.data)) {
        data.saveDetailList(res.data, {
          id,
          name: datasetDict[id].name,
        })
        await wx.setStorage({
          key: `dataset:${id}`,
          data: res.data,
        })
        refreshCacheKeys()
      }
    },
    fail: (err) => {
      ui.setGlobalLoading(false)
      wx.showToast({
        title: '加载失败',
        icon: 'error',
      })
      console.log('request failed', err)
    },
  })
}
</script>

<template>
  <ControlPanelPage title="曲库" :hidden="props.hidden">
    <template #header>
      <view

        v-if="currentDatasetId"
        class="flex flex-row items-center gap-0.5 px-2 py-1 rounded-md border border-border text-xs"
        hover-class="bg-accent text-accent-foreground"
        @tap="handleResetDataset"
      >
        <text>{{ currentDatasetName }}</text>
        <view class="i-lucide-chevrons-up-down text-muted-foreground text-[10px]" />
      </view>
    </template>
    <!-- 曲库选择 -->
    <view v-if="!currentDatasetId" class="flex-1 px-4 py-3 space-y-2">
      <view
        v-for="item in dataset"
        :key="item.id"
        class="flex items-center justify-between px-3 py-2 text-sm rounded-md"
        hover-class="bg-accent text-accent-foreground"
        @tap="handleSetList(item.id)"
      >
        <text>{{ item.name }}</text>
        <view v-if="!cacheKeys.includes(item.id)" class="i-lucide-arrow-down-to-line text-muted-foreground text-xs" />
      </view>
    </view>
    <!-- 歌曲列表 -->
    <view v-else class="flex-1 overflow-hidden">
      <SongList />
    </view>
  </ControlPanelPage>
</template>
