import { useUiStore } from '@/stores/ui'

export interface WebSearchTrackItem {
  id: string
  song_name: string
  song_name_original: string
  album_name: string
  artist: string
  duration: number
}

interface WebSearchListResponse {
  code: number
  error?: string
  data: {
    total: number
    list: WebSearchTrackItem[]
  }
}

interface WebSearchLyricResponse {
  code: number
  error?: string
  data: {
    content: string
  }
}

const screenApiHost = 'https://mayscreen-api.ddiu.site'

export const getTrackListByKeyword = (keyword: string) => {
  const ui = useUiStore()
  if (!keyword) {
    return []
  }
  return new Promise<WebSearchTrackItem[]>((resolve) => {
    ui.setGlobalLoading(true)
    wx.request({
      url: `${screenApiHost}/v1/search?keyword=${keyword}`,
      success: (res) => {
        ui.setGlobalLoading(false)
        const data = res.data as WebSearchListResponse
        if (!data || data.error) {
          console.error(data.error)
          resolve([])
        }
        resolve(data.data?.list || [])
      },
      fail: (err) => {
        ui.setGlobalLoading(false)
        wx.showToast({
          title: '加载失败',
          icon: 'error',
        })
        console.log('request failed', err)
        resolve([])
      },
    })
  })
}

export const getLyricBySongId = (songId: string) => {
  const ui = useUiStore()
  if (!songId) {
    return null
  }
  return new Promise<string | null>((resolve) => {
    ui.setGlobalLoading(true)
    wx.request({
      url: `${screenApiHost}/v1/lyric?id=${songId}`,
      success: (res) => {
        ui.setGlobalLoading(false)
        const data = res.data as WebSearchLyricResponse
        if (!data || data.error) {
          console.error(data.error)
          resolve('')
        }
        resolve(data.data?.content || null)
      },
      fail: (err) => {
        ui.setGlobalLoading(false)
        wx.showToast({
          title: '加载失败',
          icon: 'error',
        })
        console.log('request failed', err)
        resolve(null)
      },
    })
  })
}
