import { makeAutoObservable } from 'mobx-miniprogram'
import type { GroupListItem, LyricLine, SongDetail } from '@/types'
import { generateDataDict, generateMetaGroupList } from '@/utils/songList'
import { timeServer } from '@/utils/timeServer'

export class DataStore {
  allDataList = [] as SongDetail[]
  allDataDict = {} as Record<string, SongDetail>
  metaGroupList = [] as GroupListItem[]
  currentDatasetId = ''
  currentDatasetName = ''
  currentSongData = null as SongDetail | null
  currentLyricIndex = -1
  currentTime = 0
  autoPlay = false

  constructor() {
    makeAutoObservable(this)
  }

  get currentLyricLine(): LyricLine | null {
    if (
      this.currentSongData?.detail &&
      this.currentLyricIndex >= 0 &&
      this.currentLyricIndex < this.currentSongData.detail.length
    ) {
      return this.currentSongData.detail[this.currentLyricIndex]
    }
    return null
  }

  get currentSongTimelineIndexMap(): Map<number, number> {
    const map = new Map<number, number>()
    if (!this.currentSongData) {
      return map
    }
    this.currentSongData.detail.forEach((line, index) => {
      if (line.time >= 0) {
        map.set(line.time, index)
      }
    })
    // add last line, point to index -1
    if (map.size > 0) {
      // max time = song length in meta, or last line time + 20
      const maxTime = this.currentSongData.meta?.length || Array.from(map.keys()).pop()! + 20
      map.set(maxTime, -1)
    }
    return map
  }

  get supportAutoPlay() {
    return this.currentSongTimelineIndexMap.size > 0
  }

  clearState() {
    this.allDataList = []
    this.allDataDict = {}
    this.metaGroupList = []
    this.currentDatasetId = ''
    this.currentDatasetName = ''
    this.currentSongData = null
    this.currentLyricIndex = -1
    this.autoPlay = false
    this.currentTime = 0
  }

  saveDetailList(
    data: SongDetail[],
    info?: {
      id: string
      name: string
    }
  ) {
    this.allDataList = data
    this.allDataDict = generateDataDict(data)
    this.metaGroupList = generateMetaGroupList(data)
    this.currentDatasetId = info?.id || ''
    this.currentDatasetName = info?.name || ''
  }

  setCurrentSongData(data: SongDetail | null) {
    console.log('setCurrentSongData', data)
    this.currentSongData = data
    this.setCurrentLyricIndex(-1)
  }

  setCurrentTime(time: number) {
    if (time < 0) {
      time = 0
    }
    this.currentTime = time
    // resume auto play
    if (this.autoPlay) {
      timeServer.pause()
      timeServer.start()
    }
  }

  addCurrentTimeSecond() {
    this.currentTime += 1
    if (this.currentSongData) {
      // calc lyric index
      const lyricIndex = this.currentSongTimelineIndexMap.get(this.currentTime)
      if (lyricIndex !== undefined) {
        this.setCurrentLyricIndex(lyricIndex)
      }
    }
  }

  setCurrentLyricIndex(index: number, customTime?: number) {
    wx.vibrateShort({ type: 'light' })
    this.currentLyricIndex = index
    if (index < 0) {
      timeServer.clear()
      return
    }
    // set current time by custom time
    if (customTime !== undefined) {
      this.setCurrentTime(customTime)
      return
    }
    // set current time by fetched lyric line
    const targetLyricLine = this.currentSongData?.detail[index]
    if (targetLyricLine && targetLyricLine.time >= 0) {
      this.setCurrentTime(targetLyricLine.time)
    }
  }

  nextLyricLine() {
    if (this.currentSongData?.detail && this.currentLyricIndex < this.currentSongData.detail.length - 1) {
      this.setCurrentLyricIndex(this.currentLyricIndex + 1)
    } else {
      this.setCurrentLyricIndex(-1)
    }
  }

  prevLyricLine() {
    if (this.currentSongData?.detail && this.currentLyricIndex > 0) {
      this.setCurrentLyricIndex(this.currentLyricIndex - 1)
    } else {
      this.setCurrentLyricIndex(-1)
    }
  }

  setAutoPlay(autoPlay: boolean) {
    this.autoPlay = autoPlay
  }
}

export const data = new DataStore()
