import { makeAutoObservable } from 'mobx-miniprogram'

// 消息种类：
// 1. 连接状态消息（连接授权、连接成功、连接中、连接断开）
// 2. 短指令消息（上一句、下一句、自动播放、黑屏、切歌id）
// 3. 长数据消息（歌词文本、自定义文字）

export class MessageStore {
  messageList = [] as string[]

  constructor() {
    makeAutoObservable(this)
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
