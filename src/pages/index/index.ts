import Message from 'tdesign-miniprogram/message/index'

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
    Message.error({
      context: this,
      offset: [4, 20],
      content: '这是一条错误提示通知12121212',
    })
  },
})
