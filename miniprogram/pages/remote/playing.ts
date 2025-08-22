Page({
  data: {
    connected: false,
  },
  state: {} as Record<string, any>,
  onLoad() {},
  onReady() {},
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
  },
  jumpToDeviceConnectPage() {
    wx.navigateTo({
      url: '/pages/remote/device-connect',
    })
  },
})
