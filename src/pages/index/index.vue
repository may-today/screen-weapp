<script setup lang="ts">
import { enableShare } from '@/utils/share'
import { useRouter } from 'wevu/router'

const router = useRouter()

definePageJson({
  backgroundColor: '#171717',
  backgroundColorBottom: '#171717',
  backgroundColorContent: '#171717',
  backgroundColorTop: '#171717',
  disableScroll: true,
  navigationBarBackgroundColor: '#171717',
  navigationBarTextStyle: 'white',
  navigationStyle: 'custom',
})

enableShare()

function jumpToScreenPage() {
  router.push('/pages/screen/index')
}
function jumpToRemotePage() {
  router.push('/pages/remote/index')
}

// const handleBgImageLoad = () => {
//   bgImageLoaded.value = true
// }
</script>

<template>
  <view class="dark absolute inset-0 bg-background -z-10">
    <mesh-gradient-background extra-class="absolute top-0 left-0 w-full h-full" />
    <!-- <image
    src=""
    class="absolute top-0 left-0 w-full h-full transition-opacity duration-800 {{ bgImageLoaded ? 'opacity-100' : 'opacity-0' }}"
    mode="aspectFill"
    bind:load="handleBgImageLoad"
  /> -->
  </view>
  <view class="dark index-container z-10 h-full w-full border-border text-foreground">
    <view class="mx-auto h-full w-full max-w-xl px-6 py-4">
      <view class="flex h-2/5 flex-col items-stretch justify-end gap-1 py-3">
        <text class="text-xs opacity-50">云端提词器</text>
        <image src="../../assets/logo.svg" class="logo" />
      </view>
      <view class="flex flex-row items-center justify-center gap-3 py-3">
        <view
          class="glass-button flex-3 p-4 transition-colors duration-300"
          hover-class="bg-black/50 text-accent-foreground"
          @tap="jumpToScreenPage"
        >
          <image src="../../assets/index-icon/screen.svg" class="size-6" />
          <text class="mt-4 block text-right text-sm font-bold opacity-70">歌曲提词器</text>
          <text class="mt-1 block text-right text-xs opacity-50">开启一个新屏幕</text>
        </view>
        <view
          class="glass-button flex-2 p-4 transition-colors duration-300"
          hover-class="bg-black/50 text-accent-foreground"
          @tap="jumpToRemotePage"
        >
          <image src="../../assets/index-icon/remote.svg" class="size-6" />
          <text class="mt-4 block text-right text-sm font-bold opacity-70">遥控</text>
          <text class="mt-1 block text-right text-xs opacity-50">控制附近的屏幕</text>
        </view>
      </view>
      <text class="mt-4 mb-3 block px-2 text-left text-sm font-bold opacity-60">更多工具</text>
      <view
        class="flex h-20 flex-row items-center justify-center rounded-xl border border-dashed border-border opacity-50"
      >
        <text class="text-sm opacity-60">暂未开放</text>
      </view>
    </view>
  </view>
</template>

<style lang="css" scoped>
.glass-button {
  position: relative;
  border-radius: 16px;
  box-shadow: 0 0.25em 0.375em hsla(0, 0%, 0%, 10%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background-image: linear-gradient(90deg, hsla(0, 0%, 100%, 0.2), hsla(0, 0%, 100%, 0.05));
}

.glass-button::before,
.glass-button::after {
  content: '';
  display: block;
  border-radius: inherit;
  position: absolute;
  inset: 0;
}

.glass-button::before {
  border: 1px solid hsl(0, 0%, 50%);
  mask-image: linear-gradient(135deg, hsl(0, 0%, 100%), hsla(0, 0%, 100%, 0) 50%);
}

.glass-button::after {
  border: 1px solid hsl(0, 0%, 30%);
  mask-image: linear-gradient(135deg, hsla(0, 0%, 100%, 0) 50%, hsl(0, 0%, 100%));
}

.index-container {
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 24%, rgba(0, 0, 0, 0.9) 60%);
}

.logo {
  width: 132px;
  height: 24px;
  opacity: 0.6;
}
</style>
