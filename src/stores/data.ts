import { makeAutoObservable } from 'mobx-miniprogram'
import type { GroupListItem, SongDetail } from '@/types'
import { generateDataDict, generateMetaGroupList } from '@/utils/songList'

export class DataStore {
  allDataList = [] as SongDetail[]
  allDataDict = {} as Record<string, SongDetail>
  metaGroupList = [] as GroupListItem[]
  currentDatasetId = ''
  currentDatasetName = ''
  currentSongData = null as SongDetail | null
  currentLyricIndex = -1

  constructor() {
    makeAutoObservable(this)
  }

  get currentLyricLine() {
    if (
      this.currentSongData?.detail &&
      this.currentLyricIndex >= 0 &&
      this.currentLyricIndex < this.currentSongData.detail.length
    ) {
      return this.currentSongData.detail[this.currentLyricIndex]
    }
    return null
  }

  saveDetailList(data: SongDetail[], info?: {
    id: string
    name: string
  }) {
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

  setCurrentLyricIndex(index: number) {
    wx.vibrateShort({ type: 'light' })
    this.currentLyricIndex = index
  }

  nextLyricLine() {
    if (
      this.currentSongData?.detail &&
      this.currentLyricIndex < this.currentSongData.detail.length - 1
    ) {
      this.setCurrentLyricIndex(this.currentLyricIndex + 1)
    } else {
      this.setCurrentLyricIndex(-1)
    }
  }

  prevLyricLine() {
    if (
      this.currentSongData?.detail &&
      this.currentLyricIndex > 0
    ) {
      this.setCurrentLyricIndex(this.currentLyricIndex - 1)
    } else {
      this.setCurrentLyricIndex(-1)
    }
  }
}

export const data = new DataStore()
