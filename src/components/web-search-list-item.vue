<script setup lang="ts">
import type { WebSearchTrackItem } from '@/utils/webSearch'
import { formatDuration } from '@/utils/format'

const props = defineProps<{
  info: WebSearchTrackItem
}>()
</script>

<template>
  <view
    :id="info.id"
    class="flex flex-row items-center gap-1.5 mx-2 px-2 py-1.5 rounded-md min-h-8 first:mt-1.5 last:mb-1.5 overflow-hidden"
    hover-class="bg-accent text-accent-foreground"
  >
    <view class="flex-1 overflow-hidden">
      <text class="block w-full text-sm truncate" overflow="ellipsis">{{ info.song_name }} - {{ info.artist }}</text>
      <text class="block w-full text-sm text-muted-foreground truncate" overflow="ellipsis">{{ info.album_name }}</text>
    </view>
    <text
      v-if="info.duration"
      class="shrink-0 text-xs text-muted-foreground max-w-24 overflow-hidden text-ellipsis whitespace-nowrap"
    >
      {{ formatDuration(info.duration) }}
    </text>
  </view>
</template>
