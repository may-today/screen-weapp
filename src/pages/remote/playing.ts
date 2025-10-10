import type { BleRemote } from '@/utils/bleRemote'
import { Command } from '@/types'

Page({
  data: {},
  state: {
    bleInstance: getApp().globalData.bleRemote as BleRemote,
  },
  onLoad() {},
  onReady() {
    // this.createSelectorQuery().select('#canvas').node(res => {
    //   const canvas = res.node
    //   const context = canvas.getContext('2d')
    //   canvas.width = 600
    //   canvas.height = 600
    //   lottie.setup(canvas)
    //   this.ani = lottie.loadAnimation({
    //     loop: true,
    //     autoplay: true,
    //     animationData: require('./a.json'),
    //     rendererSettings: {
    //       context,
    //     },
    //   })
    // }).exec()
  },
  onShow() {
    wx.setKeepScreenOn({
      keepScreenOn: true,
    })
  },
  onHide() {
    wx.setKeepScreenOn({
      keepScreenOn: false,
    })
  },
  onUnload() {
    this.state.bleInstance.destroy()
  },
  jumpToDeviceConnectPage() {
    wx.navigateTo({
      url: '/pages/remote/device-connect',
    })
  },
  sendCommand() {
    this.state.bleInstance.sendCommand(Command.ChangeSongId, '1234567890')
  },
  sendLargeData() {
    this.state.bleInstance.sendLargeData('我好想好想飞/逃离这个疯狂世界/那么多苦 那么多累/那么多莫名的泪水/我好想好想飞/逃离这个疯狂的世界/如果是你 发现了我/也别将我挽回')
  },
})
