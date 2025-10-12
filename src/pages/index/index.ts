Page({
  data: {
    bgImageLoaded: false,
  },
  /** 跳转页面 */
  jumpToScreenPage() {
    wx.navigateTo({
      url: '/pages/screen/screen',
    })
  },
  jumpToRemotePage() {
    wx.showToast({
      title: '暂未开放',
      icon: 'none',
    })
    // wx.switchTab({
    //   url: '/pages/remote/playing',
    // })
  },
  handleBgImageLoad() {
    this.setData({
      bgImageLoaded: true,
    })
  },
})
