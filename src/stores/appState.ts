import { makeAutoObservable } from 'mobx-miniprogram'

export enum ConnectStatus {
  Disconnected = 0,
  Connecting,
  Connected,
}

export class AppState {
  connectStatus = ConnectStatus.Disconnected
  connected = false
  deviceId = ''

  constructor() {
    makeAutoObservable(this)
  }

  setConnectStatus(connectStatus: ConnectStatus) {
    this.connectStatus = connectStatus
  }
  setDeviceId(deviceId: string) {
    this.deviceId = deviceId
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
