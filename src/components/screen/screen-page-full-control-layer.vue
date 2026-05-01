<script setup lang="ts">
import { ref } from 'wevu'
import { usePlayState } from '@/stores/playState'

const playState = usePlayState()

const _gestureTouchStartY = ref(0)

const handleClickAreaLeft = () => {
  playState.prevLyricLine()
}

const handleClickAreaRight = () => {
  playState.nextLyricLine()
}

const handleTouchStart = (event: WechatMiniprogram.TouchEvent) => {
  _gestureTouchStartY.value = event.touches[0].clientY
}

const handleTouchEnd = (event: WechatMiniprogram.TouchEvent) => {
  const gestureTouchEndY = event.changedTouches[0].clientY
  const gestureDeltaY = gestureTouchEndY - _gestureTouchStartY.value
  if (Math.abs(gestureDeltaY) < 20) {
    return
  }
  if (gestureDeltaY > 0) {
    handleClickAreaLeft()
  } else {
    handleClickAreaRight()
  }
}
</script>

<template>
  <view class="full-control-area" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
    <view class="control-area control-area-left" @tap="handleClickAreaLeft" />
    <view class="control-area control-area-middle" />
    <view class="control-area control-area-right" @tap="handleClickAreaRight" />
  </view>
</template>

<style lang="css" scoped>
.full-control-area {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: row;
  align-items: stretch;
}

.full-control-area .control-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
