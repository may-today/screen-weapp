import { ComponentWithComputed } from 'miniprogram-computed'
import { generateDataDict, generateMetaGroupList, searchByString } from '@/utils/songList'
import type { SongDetail, SearchItem } from '@/types'

type Data = {
  detailList: SongDetail[]
  searchInputValue: string
  filteredList: SearchItem[]
}

ComponentWithComputed({
  options: {
    pureDataPattern: /^_/,
  },
  data: <Data>{
    searchInputValue: '',
    filteredList: [] as SearchItem[],
  },
  properties: {
    detailList: {
      type: Array,
      value: <Data['detailList']>[],
    },
  },
  computed: {
    allDataDict(data) {
      return generateDataDict(data.detailList)
    },
    metaGroupList(data) {
      return generateMetaGroupList(data.detailList)
    },
  },
  methods: {
    handleSearch(event: WechatMiniprogram.Input) {
      const searchValue = event.detail.value.trim()
      this.setData({
        filteredList: searchByString(searchValue, this.data.detailList),
      })
    },
    handleClearSearch() {
      this.setData({
        searchInputValue: '',
        filteredList: [],
      })
    },
    handleSearchValueChange(event: WechatMiniprogram.Input) {
      const searchValue = event.detail.value.trim()
      this.setData({
        searchInputValue: searchValue,
      })
    },
  },
})
