import { makeAutoObservable } from 'mobx-miniprogram'
import { ConnectStatus } from '@/types'

export class AppStateStore {
  connectStatus = ConnectStatus.Disconnected
  connected = false
  deviceId = ''
  showScreenFloatPanel = false
  showConnectPanel = false
  globalLoading = false

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
  setGlobalLoading(loading: boolean) {
    this.globalLoading = loading
  }
}

export const appState = new AppStateStore()
