<script setup lang="ts">
import { computed } from 'wevu'

const props = defineProps<{
  text: string
  type: 'default' | 'error' | 'loading' | 'none'
  extraClass?: string
  actionText?: string
  actionLoading?: boolean
}>()

const emit = defineEmits<{
  action: []
}>()

const iconClass = computed(() => {
  if (props.type === 'default') {
    return 'i-lucide-circle-alert'
  }
  if (props.type === 'error') {
    return 'i-lucide-circle-x'
  }
  if (props.type === 'loading') {
    return 'i-lucide-loader-circle animate-spin'
  }
  return ''
})
</script>

<template>
  <view
    class="w-full h-full flex flex-col items-center justify-center gap-3 px-4 py-3 text-muted-foreground"
    :class="props.extraClass"
  >
    <view v-if="type !== 'none'" :class="iconClass" class="text-[36px] opacity-40" />
    <text v-if="text" class="text-sm opacity-40">{{ text }}</text>
    <button v-if="props.actionText" size="mini" :loading="props.actionLoading" @tap="emit('action')">
      {{ props.actionText }}
    </button>
  </view>
</template>
