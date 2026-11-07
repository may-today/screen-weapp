import type { SongDetail } from '@/types'

export const datasetDict: Record<string, { name: string, downUrl: string }> = {
  mayday: {
    name: '五月天曲库',
    downUrl: 'https://wx-static.ddiu.site/dataset/mayday.json',
  },
  jayzhou: {
    name: '周杰伦曲库',
    downUrl: 'https://wx-static.ddiu.site/dataset/jayzhou.json',
  },
  fhcq: {
    name: '凤凰传奇曲库',
    downUrl: 'https://wx-static.ddiu.site/dataset/fhcq.json',
  },
}

export function getDataset(id: string) {
  return Object.prototype.hasOwnProperty.call(datasetDict, id) ? datasetDict[id] : undefined
}

export function getCachedDataset(id: string): SongDetail[] | null {
  try {
    const cached = wx.getStorageSync<SongDetail[]>(`dataset:${id}`)
    return Array.isArray(cached) ? cached : null
  }
  catch {
    return null
  }
}

export function downloadDataset(id: string): Promise<SongDetail[]> {
  const dataset = getDataset(id)
  if (!dataset) return Promise.reject(new Error('Unknown dataset'))

  return new Promise((resolve, reject) => {
    wx.request({
      url: dataset.downUrl,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300 && Array.isArray(res.data)) {
          resolve(res.data as SongDetail[])
        }
        else {
          reject(new Error(`Dataset request failed: ${res.statusCode}`))
        }
      },
      fail: reject,
    })
  })
}
