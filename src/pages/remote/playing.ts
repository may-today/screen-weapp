import lottie from 'lottie-miniprogram'

Page({
  data: {
    connected: false,
  },
  state: {} as Record<string, any>,
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
    wx.closeBluetoothAdapter()
    // this.ani.destroy()
  },
  jumpToDeviceConnectPage() {
    wx.navigateTo({
      url: '/pages/remote/device-connect',
    })
  },
})
