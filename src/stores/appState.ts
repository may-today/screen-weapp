import { makeAutoObservable } from 'mobx-miniprogram'
import { ConnectStatus } from '@/types'

export class AppState {
  connectStatus = ConnectStatus.Disconnected
  connected = false
  deviceId = ''
  showScreenFloatPanel = false
  showConnectPanel = false

  constructor() {
    makeAutoObservable(this)
  }

  setConnectStatus(connectStatus: ConnectStatus) {
    this.connectStatus = connectStatus
  }
  setDeviceId(deviceId: string) {
    this.deviceId = deviceId
  }
  setShowScreenFloatPanel(showScreenFloatPanel: boolean) {
    this.showScreenFloatPanel = showScreenFloatPanel
  }
  setShowConnectPanel(showConnectPanel: boolean) {
    this.showConnectPanel = showConnectPanel
  }
}

export const appState = new AppState()

// export const appStateStore = observable({
//   connected: false,
//   deviceId: '',

//   // 计算属性
//   // get sum() {
//   //   return this.deviceId
//   // },

//   // actions
//   // update: action(function () {
//   //   const sum = this.sum
//   //   this.numA = this.numB
//   //   this.numB = sum
//   // }),
//   setDeviceId: action((deviceId: string) => {
//     appStateStore.deviceId = deviceId
//   }),
// })
