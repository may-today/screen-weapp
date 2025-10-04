import { hooks } from '@/utils/hook'

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
    wx.enableAlertBeforeUnload({
      message: '确定要退出屏幕吗？',
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
    hooks.removeAllHooks()
  },  
})
