<script setup lang="ts">
const props = defineProps<{
  iconClass?: string
  title: string
  active?: boolean
}>()
</script>

<template>
  <view
    class="flex flex-col items-center justify-center gap-0.5 mb-1 p-1 rounded-md border border-border"
    :class="{
      'bg-primary text-primary-foreground': props.active,
    }"
    hover-class="bg-accent text-accent-foreground"
  >
    <view :class="props.iconClass" class="text-sm" />
    <text v-if="props.title" class="text-[10px]">{{ props.title }}</text>
  </view>
</template>
