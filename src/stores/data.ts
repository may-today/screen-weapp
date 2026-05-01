import { defineStore, ref } from 'wevu'
import type { GroupListItem, SongDetail } from '@/types'
import { generateDataDict, generateMetaGroupList } from '@/utils/songList'

export const useDataStore = defineStore('data', () => {
  /** 当前曲库ID */
  const currentDatasetId = ref('')
  /** 当前曲库名称 */
  const currentDatasetName = ref('')
  const allDataList = ref<SongDetail[]>([])
  const allDataDict = ref<Record<string, SongDetail>>({})
  const metaGroupList = ref<GroupListItem[]>([])

  /** 重置 Store */
  const $reset = () => {
    currentDatasetId.value = ''
    currentDatasetName.value = ''
    allDataList.value = []
    allDataDict.value = {}
    metaGroupList.value = []
  }

  /** 设置歌曲列表 */
  const saveDetailList = (
    data: SongDetail[],
    info?: {
      id: string
      name: string
    }
  ) => {
    allDataList.value = data
    allDataDict.value = generateDataDict(data)
    metaGroupList.value = generateMetaGroupList(data)
    currentDatasetId.value = info?.id || ''
    currentDatasetName.value = info?.name || ''
  }

  return {
    currentDatasetId,
    currentDatasetName,
    allDataList,
    allDataDict,
    metaGroupList,
    $reset,
    saveDetailList,
  }
})
