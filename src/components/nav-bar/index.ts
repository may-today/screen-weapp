Component({
  options: {
    pureDataPattern: /^_/,
  },
  data: {
    statusBarHeight: 0,
    navBarHeight: 0,
    innerPaddingRight: 0,
  },
  lifetimes: {
    attached() {
      this.calculateHeaderStyle()
    },
  },
  methods: {
    calculateHeaderStyle() {
      const menuRect = wx.getMenuButtonBoundingClientRect()
      const windowInfo = wx.getWindowInfo()
      console.log(windowInfo, menuRect)
      this.setData({
        statusBarHeight: windowInfo.statusBarHeight,
        navBarHeight: menuRect.bottom + menuRect.top - 2 * windowInfo.statusBarHeight,
        innerPaddingRight: windowInfo.windowWidth - menuRect.right + menuRect.width,
      })
    },
    handleCloseButtonTap() {
      wx.showModal({
        content: '确定要退出遥控器吗？已连接的屏幕将会断开连接。',
        success(res) {
          if (res.confirm) {
            wx.reLaunch({
              url: '/pages/index/index',
            })
          }
        },
      })
    },
    handleConnectStatusTap() {
      wx.navigateTo({
        url: '/pages/remote/device-status',
      })
    },
  },
})
