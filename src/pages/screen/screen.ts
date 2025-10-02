Page({
  data: {},
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
    wx.setKeepScreenOn({
      keepScreenOn: false,
    })
  },  
})
