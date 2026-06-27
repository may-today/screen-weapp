<script setup lang="ts">
const props = defineProps<{
  iconClass?: string
  title: string
  active: boolean
}>()

</script>

<template>
  <view
    class="inline-flex flex-row items-center gap-1 px-2 py-1.5 rounded-md border border-border text-xs"
    :class="{
      'bg-primary text-primary-foreground': props.active,
    }"
    hover-class="bg-accent text-accent-foreground"
  >
    <view :class="props.iconClass" />
    <text v-if="props.title">{{ props.title }}</text>
  </view>
</template>
