import type { LyricLine } from '@/types'

const timeReg = /\[\d{2}:\d{2}(\.\d+)?\]/g
const metaReg = /^\[([a-z]+):([^\]]*)\]/

// [01:02.03] -> 62.03
const convertTimeToSeconds = (timeStr: string) => {
  if (!(timeStr?.startsWith('[') && timeStr.endsWith(']'))) {
    return -1
  }
  const arr = timeStr.slice(1, -1).split(':')
  if (arr.length !== 2) {
    return -1
  }
  const minutes = Number.parseInt(arr[0], 10)
  const seconds = Number.parseFloat(arr[1])
  if (minutes > 0) {
    const sc = minutes * 60 + seconds
    return Math.round(sc)
  }
  return Math.round(seconds)
}

const parseLyricLine = (line: string, offsetTime = 0): LyricLine[] => {
  if (timeReg.test(line)) {
    const lyricLines: LyricLine[] = []
    const timeMatches = line.match(timeReg)
    if (!timeMatches) {
      return lyricLines
    }
    for (const timeMatch of timeMatches) {
      const time = convertTimeToSeconds(timeMatch)
      const text = line.replace(timeMatch, '').trim()
      const lyricLine = {
        time: time + offsetTime,
        text: text.startsWith('!') ? text.slice(1) : text,
        isHighlight: text.startsWith('!'),
      } satisfies LyricLine
      lyricLines.push(lyricLine)
    }
    return lyricLines
  }
  // simple line
  const lyricLine = {
    time: -1,
    text: line.startsWith('!') ? line.slice(1) : line,
    isHighlight: line.startsWith('!'),
  } satisfies LyricLine
  return [lyricLine]
}

export const parseRawLRCFile = (content: string) => {
  const rawLines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !!line)
  const metaRawLines = rawLines.filter((line) => metaReg.test(line))
  const meta = metaRawLines.reduce(
    (acc, line) => {
      const match = line.match(metaReg)
      if (!match) {
        return acc
      }
      acc[match[1]] = match[2]
      return acc
    },
    {} as Record<string, string>
  )
  const offsetTime = Number.isNaN(Number(meta?.offset)) ? 0 : Math.floor(Number(meta.offset) / 1000)
  const lyricRawLines = rawLines.filter((line) => !metaReg.test(line))
  const lyricLines: LyricLine[] = lyricRawLines
    .flatMap((line) => parseLyricLine(line, offsetTime))
    .sort((a, b) => a.time - b.time)
  console.log('parseRawLRCFile', content, meta, lyricLines)
  return lyricLines
}
