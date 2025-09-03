import { makeAutoObservable } from 'mobx-miniprogram'
import type { Command } from '@/types'

type MessageData = {
  /** 消息指令 */
  command: Command
  /** 消息附加数据 */
  payload?: string | number
}

type Message = {
  meta: {
    /** 消息时间戳 */
    timestamp: number
    /** 消息等级 */
    level: 'debug' | 'info' | 'error'
    /** 消息持续时间 */
    duration: number
  }
  data: MessageData
}

// const defaultDurations

// 消息种类：
// 1. 连接状态消息（连接授权、连接成功、连接中、连接断开）
// 2. 短指令消息（上一句、下一句、自动播放、黑屏、切歌id）
// 3. 长数据消息（歌词文本、自定义文字）

export class MessageStore {
  messageList = [] as Message[]

  constructor() {
    makeAutoObservable(this)
  }

  get latestMessage() {
    return this.messageList.length > 0 ? this.messageList[this.messageList.length - 1] : null
  }
  
  addMessage(data: MessageData, level: 'debug' | 'info' | 'error' = 'info') {
    this.messageList.push({
      meta: {
        timestamp: Date.now(),
        level,
        duration: 3000,
      },
      data,
    })
  }

  // setConnectStatus(connectStatus: ConnectStatus) {
  //   this.connectStatus = connectStatus
  // }
  // setDeviceId(deviceId: string) {
  //   this.deviceId = deviceId
  // }
  // setShowScreenFloatPanel(showScreenFloatPanel: boolean) {
  //   this.showScreenFloatPanel = showScreenFloatPanel
  // }
  // setShowConnectPanel(showConnectPanel: boolean) {
  //   this.showConnectPanel = showConnectPanel
  // }
}

export const message = new MessageStore()
