import { computed, defineStore, ref } from 'wevu'
import type { SongDetail } from '@/types'
import { timeServer } from '@/utils/timeServer'

export const usePlayStateStore = defineStore('playState', () => {
  /** 当前歌曲数据 */
  const currentSongData = ref<SongDetail | null>(null)
  /** 当前歌词索引 */
  const currentLyricIndex = ref(-1)
  /** 自动播放 */
  const autoPlay = ref(false)
  /** 当前时间 */
  const currentTime = ref(0)

  /** 当前歌词行 */
  const currentLyricLine = computed(() => {
    if (
      currentSongData.value?.detail &&
      currentLyricIndex.value >= 0 &&
      currentLyricIndex.value < currentSongData.value.detail.length
    ) {
      return currentSongData.value.detail[currentLyricIndex.value]
    }
    return null
  })

  /** 当前歌曲时间轴索引映射 */
  const currentSongTimelineIndexMap = computed(() => {
    const map = new Map<number, number>()
    if (!currentSongData.value) {
      return map
    }
    currentSongData.value.detail.forEach((line, index) => {
      if (line.time >= 0) {
        map.set(line.time, index)
      }
    })
    // add last line, point to index -1
    if (map.size > 0) {
      // max time = song length in meta, or last line time + 20
      const maxTime = currentSongData.value.meta?.length || (Array.from(map.keys()).pop() ?? 0) + 20
      map.set(maxTime, -1)
    }
    return map
  })

  /** 当前歌曲是否支持自动播放 */
  const supportAutoPlay = computed<boolean>(() => {
    return currentSongTimelineIndexMap.value.size > 0
  })

  /** 重置 Store */
  const $reset = () => {
    currentSongData.value = null
    currentLyricIndex.value = -1
    autoPlay.value = false
    currentTime.value = 0
  }

  /** 设置当前歌曲数据 */
  const setCurrentSongData = (data: SongDetail | null) => {
    console.log('setCurrentSongData', data)
    currentSongData.value = data
    currentLyricIndex.value = -1
  }

  /** 设置当前时间 */
  const setCurrentTime = (time: number) => {
    currentTime.value = Math.max(0, time)
    // resume auto play
    if (autoPlay.value) {
      timeServer.pause()
      timeServer.start()
    }
  }

  /** 当前秒数+1 */
  const addCurrentTimeSecond = () => {
    currentTime.value += 1
    if (currentSongData.value) {
      // calc lyric index
      const lyricIndex = currentSongTimelineIndexMap.value.get(currentTime.value)
      if (lyricIndex !== undefined) {
        currentLyricIndex.value = lyricIndex
      }
    }
  }

  /** 设置当前歌词索引 */
  const setCurrentLyricIndex = (index: number, customTime?: number) => {
    wx.vibrateShort({ type: 'light' })
    currentLyricIndex.value = index
    if (index < 0) {
      timeServer.clear()
      return
    }
    if (customTime !== undefined) {
      // set current time by custom time
      currentTime.value = Math.max(0, customTime)
      return
    }
    // set current time by fetched lyric line
    const targetLyricLine = currentSongData.value?.detail[index]
    if (targetLyricLine && targetLyricLine.time >= 0) {
      currentTime.value = targetLyricLine.time
    }
  }

  /** 切换到下一行歌词 */
  const nextLyricLine = () => {
    if (currentSongData.value?.detail && currentLyricIndex.value < currentSongData.value.detail.length - 1) {
      currentLyricIndex.value += 1
    } else {
      currentLyricIndex.value = -1
    }
  }

  /** 切换到上一行歌词 */
  const prevLyricLine = () => {
    if (currentSongData.value?.detail && currentLyricIndex.value > 0) {
      currentLyricIndex.value -= 1
    } else {
      currentLyricIndex.value = -1
    }
  }

  /** 设置自动播放 */
  const setAutoPlay = (autoPlayState: boolean) => {
    autoPlay.value = autoPlayState
  }

  return {
    currentSongData,
    currentLyricIndex,
    autoPlay,
    currentTime,
    currentLyricLine,
    currentSongTimelineIndexMap,
    supportAutoPlay,
    $reset,
    setCurrentSongData,
    setCurrentTime,
    addCurrentTimeSecond,
    setCurrentLyricIndex,
    nextLyricLine,
    prevLyricLine,
    setAutoPlay,
  }
})
