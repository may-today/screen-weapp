Page({
  data: {
    motto: 'Hello World',
  },
  /** 跳转页面 */
  jumpToScreenPage() {
    console.log('jumpToScreenPage')
    wx.navigateTo({
      url: '/pages/screen/screen',
    })
  },
  jumpToRemotePage() {
    console.log('jumpToRemotePage')
    wx.switchTab({
      url: '/pages/remote/playing',
    })
  },
})
