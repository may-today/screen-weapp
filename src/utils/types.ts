export type BaseError = {
  /** 错误码 */
  errCode: number
  /** 错误原因 */
  errMsg: string
  /** 详细错误码 */
  errno?: number
}
