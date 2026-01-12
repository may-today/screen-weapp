<script setup lang="ts">
  definePageJson({
    navigationBarBackgroundColor: '#171717',
    navigationBarTextStyle: 'white',
    navigationStyle: 'custom',
    backgroundColor: '#171717',
    backgroundColorContent: '#171717',
    backgroundColorTop: '#171717',
    backgroundColorBottom: '#171717',
    disableScroll: true,
  })
  const jumpToScreenPage = () => {
    wx.navigateTo({
      url: '/pages/screen/screen',
    })
  }
  const jumpToRemotePage = () => {
    wx.switchTab({
      url: '/pages/remote/playing',
    })
  }

  // const handleBgImageLoad = () => {
  //   bgImageLoaded.value = true
  // }
</script>

<template>
  <view class="dark absolute left-0 top-0 w-full h-full bg-background -z-10">
    <mesh-gradient-background extra-class="absolute top-0 left-0 w-full h-full" />
    <!-- <image
    src=""
    class="absolute top-0 left-0 w-full h-full transition-opacity duration-800 {{ bgImageLoaded ? 'opacity-100' : 'opacity-0' }}"
    mode="aspectFill"
    bind:load="handleBgImageLoad"
  /> -->
  </view>
  <view class="dark h-full w-full index-container text-foreground border-border z-10">
    <view class="h-full w-full max-w-xl mx-auto px-6 py-4">
      <view class="h-2/5 flex flex-col items-stretch justify-end gap-1 py-3">
        <text class="text-xs opacity-50">云端提词器</text>
        <image src="../../assets/logo.svg" class="logo" />
      </view>
      <view class="flex flex-row items-center justify-center gap-3 py-3">
        <view
          class="flex-3 p-4 glass-button transition-colors duration-300"
          hover-class="bg-black/50 text-accent-foreground"
          @tap="jumpToScreenPage"
        >
          <image src="@/assets/index-icon/screen.svg" class="size-6" />
          <text class="block text-sm opacity-70 mt-4 font-bold text-right">歌曲提词器</text>
          <text class="block text-xs opacity-50 mt-1 text-right">开启一个新屏幕</text>
        </view>
        <view
          class="flex-2 p-4 glass-button transition-colors duration-300"
          hover-class="bg-black/50 text-accent-foreground"
          @tap="jumpToRemotePage"
        >
          <image src="@/assets/index-icon/remote.svg" class="size-6" />
          <text class="block text-sm opacity-70 mt-4 font-bold text-right">遥控</text>
          <text class="block text-xs opacity-50 mt-1 text-right">控制附近的屏幕</text>
        </view>
      </view>
      <text class="block text-sm mt-4 mb-3 font-bold px-2 text-left opacity-60">更多工具</text>
      <view
        class="flex flex-row items-center justify-center h-20 border border-border border-dashed rounded-xl opacity-50"
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
    box-shadow: 0 0.25em 0.375em hsla(0, 0%, 0%, 0.1);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    background-image: linear-gradient(90deg, hsla(0, 0%, 100%, 0.2), hsla(0, 0%, 100%, 0.05));
  }

  .glass-button:before,
  .glass-button:after {
    border-radius: inherit;
    content: "";
    display: block;
    position: absolute;
    inset: 0;
  }

  .glass-button:before {
    border: 1px solid hsl(0, 0%, 50%);
    mask-image: linear-gradient(135deg, hsl(0, 0%, 100%), hsla(0, 0%, 100%, 0) 50%);
  }

  .glass-button:after {
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
