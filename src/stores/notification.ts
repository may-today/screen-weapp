import { makeAutoObservable } from 'mobx-miniprogram'
import { ConnectStatus } from '@/types'

// 消息种类：
// 1. 连接授权消息
// 2. 连接状态消息（连接成功、连接中、连接断开）
// 3. 短通信消息（上一句、下一句、自动播放、黑屏、切歌id）
// 4. 长通信消息（歌词文本、自定义文字）

export class NotificationStore {
  notificationList = [] as string[]

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

export const notification = new NotificationStore()
