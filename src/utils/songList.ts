import type { SongMeta, SongDetail } from '@/types'

// export const datasetConfig = {
//   mayday: {
//     name: '五月天',
//     downUrl: 'https://wx-static.ddiu.site/dataset/mayday.json',
//   },
//   jayzhou: {
//     name: '周杰伦',
//     downUrl: 'https://wx-static.ddiu.site/dataset/jayzhou.json',
//   },
// } as Record<string, {
//   name: string
//   downUrl: string
// }>

export const generateDataDict = (list: SongDetail[]) => {
  const dict: Record<string, SongDetail> = {}
  list.forEach(song => {
    dict[song.slug] = song
  })
  return dict
}

export const generateMetaGroupList = (list: SongDetail[]) => {
  const indexGroup: Record<string, SongMeta[]> = {}
  list.forEach((song) => {
    if (!indexGroup[song.index]) {
      indexGroup[song.index] = []
    }
    const meta = {
      title: song.title,
      slug: song.slug,
      meta: song.meta,
    } as SongMeta
    indexGroup[song.index].push(meta)
  })
  const groupList = Object.keys(indexGroup).map(index => ({
    index,
    list: indexGroup[index],
  }))
  return groupList
}
