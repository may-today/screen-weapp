Page({
  data: {},
  state: {},
  onLoad() {},
  onHide() {},
  handleOpenConnectNewDevicePage() {
    wx.navigateTo({
      url: '/pages/remote/device-connect',
    })
  },
})
