import { BleScreen } from '@/utils/bleScreen'

Page({
  data: {},
  state: {
    bleInstance: BleScreen.getInstance(),
  },
  onLoad() {
    // wx.setNavigationBarColor({
    //   frontColor: '#ffffff',
    //   backgroundColor: '#000000',
    // })
    wx.setKeepScreenOn({
      keepScreenOn: true,
    })
  },
  onReady() {},
  onShow() {
    wx.setKeepScreenOn({
      keepScreenOn: true,
    })
  },
  onHide() {},
  onUnload() {
    this.state.bleInstance.destroy()
    wx.setKeepScreenOn({
      keepScreenOn: false,
    })
  },
  // 启用遥控器功能
  async startListeningRemote() {
    await this.state.bleInstance.prepare()
    await this.state.bleInstance.startAdvertising()
  },
  stopListeningRemote() {
    this.state.bleInstance.destroy()
  },
})
