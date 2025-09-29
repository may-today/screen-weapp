import { makeAutoObservable } from 'mobx-miniprogram'
import type { GroupListItem, SongDetail } from '@/types'
import { generateDataDict, generateMetaGroupList } from '@/utils/songList'

export class DataStore {
  allDataDict = {} as Record<string, SongDetail>
  metaGroupList = [] as GroupListItem[]

  constructor() {
    makeAutoObservable(this)
  }

  saveDetailList(data: SongDetail[]) {
    this.allDataDict = generateDataDict(data)
    this.metaGroupList = generateMetaGroupList(data)
  }
}

export const data = new DataStore()
