<script setup lang="ts">
import { storeToRefs } from 'wevu'
import { usePlayStateStore } from '@/stores/playState'
import ScreenPageFullControlLayer from './screen-page-full-control-layer.vue'

const playState = usePlayStateStore()
const { currentSongData, currentLyricLine, currentLyricIndex } = storeToRefs(playState)
</script>

<template>
  <view class="screen">
    <block v-if="currentSongData">
      <block v-if="currentLyricIndex < 0">
        <text v-if="currentSongData.meta && currentSongData.meta.year" class="subtitle-text">
          {{ currentSongData.meta.year }}
        </text>
        <text class="title-text">{{ currentSongData.title }}</text>
      </block>
      <block v-if="currentLyricIndex >= 0 && currentLyricLine">
        <text class="lyric-text">{{ currentLyricLine.text }}</text>
      </block>
    </block>
    <screen-page-full-control-layer />
  </view>
</template>

<style lang="css" scoped>
.screen {
  position: relative;
  height: 100vh;
  width: 100vw;
  padding-top: 4vh;
  padding-bottom: 4vh;
  overflow: hidden;
}

.subtitle-text {
  display: block;
  font-size: 16vh;
  line-height: 1.25;
  color: #ffffff;
}

.title-text {
  display: block;
  font-size: 28vh;
  line-height: 1.25;
  color: #ffffff;
  font-weight: 700;
}

.lyric-text {
  display: block;
  font-size: 24vh;
  line-height: 1.25;
  text-align: center;
  color: #ffffff;
  font-weight: 700;
}
</style>
