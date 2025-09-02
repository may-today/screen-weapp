export type BaseError = {
  /** 错误码 */
  errCode: number
  /** 错误原因 */
  errMsg: string
  /** 详细错误码 */
  errno?: number
}

export enum ConnectStatus {
  Disconnected = 0,
  Connecting,
  Authorizing,
  Connected,
}

export enum ScreenDevice {
  Phone = 1,
  Pad = 2,
  Computer = 3,
}

export enum ScreenSystem {
  Other = 0,
  iOS = 1,
  Android = 2,
  HarmonyOS = 3,
  Windows = 4,
  Mac = 5,
}

export enum Command {
  /** 连接授权请求 */
  Authorize = 1,
  /** 连接授权响应 */
  ReplyAuthorize = 2,
  /** 切换歌曲id */
  ChangeSongId = 11,
  /** 歌词上一句 */
  LyricPreviousLine = 12,
  /** 歌词下一句 */
  LyricNextLine = 13,
  /** 歌词自动播放 */
  LyricAutoPlay = 14,
  /** 屏幕黑屏 */
  ScreenBlackScreen = 21,
}
