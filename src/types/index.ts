export interface SongMeta {
  title: string
  slug: string
  index: string
  meta: {
    artist?: string
    year?: number
    album?: string
    lyricist?: string
    composer?: string
    banlam?: boolean
    length?: number
    showTitle?: string
  }
}

export interface GroupListItem {
  index: string
  list: SongMeta[]
}

export type SongDetail = SongMeta & {
  detail: LyricLine[]
}

export interface LyricLine {
  time: number
  text: string
  isHighlight: boolean
  toneText?: string
  toneText2?: string
}

export interface SearchItem {
  slug: string
  data: SongDetail
  matchType: 'title' | 'lyric'
  matchLines: string
  highlightLines: string
}

export interface BaseError {
  /** 错误码 */
  errCode: number
  /** 错误原因 */
  errMsg: string
  /** 详细错误码 */
  errno?: number
}

export enum Command {
  /** 连接授权请求 */
  Authorize = 1,
  /** 连接授权响应 */
  ReplyAuthorize = 2,
  /** 切换歌曲id */
  ChangeSongId = 11,
  /** 跳转到指定歌词行（payload 为 index 字符串，-1 表示清除） */
  LyricSetIndex = 12,
  /** 切换歌曲完整数据（长数据指令，payload 为 SongDetail JSON 信封） */
  ChangeSongData = 13,
  /** 歌词自动播放 */
  LyricAutoPlay = 14,
  /** 屏幕黑屏 */
  ScreenBlackScreen = 21,
}
