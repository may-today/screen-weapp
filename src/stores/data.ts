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

  constructor() {
    makeAutoObservable(this)
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
  }
}

export const data = new DataStore()
