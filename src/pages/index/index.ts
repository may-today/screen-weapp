Page({
  data: {
    motto: 'Hello World',
  },
  /** 跳转页面 */
  jumpToScreenPage() {
    wx.navigateTo({
      url: '/pages/screen/screen',
    })
  },
  jumpToRemotePage() {
    wx.switchTab({
      url: '/pages/remote/playing',
    })
  },
  jumpToTestPage() {
    wx.navigateTo({
      url: '/pages/test/index',
    })
  },
})
