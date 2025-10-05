import { hooks } from '@/utils/hook'
import { appState } from '@/stores/appState'
import { data } from '@/stores/data'
import { timeServer } from '@/utils/timeServer'

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
    appState.clearState()
    data.clearState()
    timeServer.destroy()
  },  
})
