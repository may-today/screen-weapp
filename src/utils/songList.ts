import type { SearchItem, SongDetail, SongMeta } from '@/types'

export const generateDataDict = (list: SongDetail[]) => {
  const dict: Record<string, SongDetail> = {}
  list.forEach((song) => {
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

export const generateYearGroupList = (list: SongDetail[]) => {
  const groups: Record<string, SongMeta[]> = {}
  const others: SongMeta[] = []
  list.forEach((song) => {
    const meta: SongMeta = { title: song.title, slug: song.slug, index: song.index, meta: song.meta }
    const year = song.meta?.year
    if (year) {
      const key = String(year)
      if (!groups[key]) groups[key] = []
      groups[key].push(meta)
    }
    else {
      others.push(meta)
    }
  })
  const groupList = Object.keys(groups)
    .sort((a, b) => Number(b) - Number(a))
    .map(year => ({ index: year, list: groups[year] }))
  if (others.length) groupList.push({ index: '其他', list: others })
  return groupList
}

export const generateAlbumGroupList = (list: SongDetail[]) => {
  const groups: Record<string, SongMeta[]> = {}
  const others: SongMeta[] = []
  list.forEach((song) => {
    const meta: SongMeta = { title: song.title, slug: song.slug, index: song.index, meta: song.meta }
    const album = song.meta?.album?.trim()
    if (album) {
      if (!groups[album]) groups[album] = []
      groups[album].push(meta)
    }
    else {
      others.push(meta)
    }
  })
  const groupList = Object.keys(groups)
    .sort((a, b) => a.localeCompare(b))
    .map(album => ({ index: album, list: groups[album] }))
  if (others.length) groupList.push({ index: '其他', list: others })
  return groupList
}

export const searchByString = (str: string, list: SongDetail[]) => {
  const searchValue = str.replace(/\s*/g, '').toLowerCase()
  if (!searchValue) {
    return [] as SearchItem[]
  }
  const filteredList = list
    .map((item) => {
      const pureLyricArr = item.detail.map(line => line.text)
      const lyricLinesText = pureLyricArr.join('|').replace(/\s*/g, '').toLowerCase()
      if (!(item.title.toLowerCase().includes(searchValue) || lyricLinesText.includes(searchValue))) {
        return null
      }
      const matchType = item.title.toLowerCase().includes(searchValue) ? 'title' : 'lyric'
      const matchLinesBefore = pureLyricArr.filter(line =>
        line.replace(/\s*/g, '').toLowerCase().includes(searchValue),
      )
      const matchLines = Array.from(new Set(matchLinesBefore)).join('/')
      const highlightLines = item.detail
        .filter(line => line.isHighlight)
        .map(line => line.text)
        .join('/')
      return {
        slug: item.slug,
        data: item,
        matchType,
        matchLines,
        highlightLines,
      } as SearchItem
    })
    .filter(item => item !== null) as SearchItem[]
  filteredList.sort((a, b) => {
    if (a.matchType === 'title' && b.matchType === 'lyric') {
      return -1
    }
    if (a.matchType === 'lyric' && b.matchType === 'title') {
      return 1
    }
    return 0
  })
  return filteredList
}
