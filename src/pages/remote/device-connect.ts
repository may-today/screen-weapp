import type { BleRemote } from '@/utils/bleRemote'

Page({
  data: {
    deviceList: [] as WechatMiniprogram.BlueToothDevice[],
  },
  state: {
    bleInstance: getApp().globalData.bleRemote as BleRemote,
  },
  onLoad() {
    this.startSearchDevices()
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {
    this.state.bleInstance.stopScanning()
  },
  // 开始扫描
  startSearchDevices() {
    this.state.bleInstance.startScanning((deviceList) => {
      this.setData({
        deviceList,
      })
    })
  },
  async handleConnectSuccess() {
    wx.navigateBack()
  },
})
