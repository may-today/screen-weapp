// pages/screen/screen.ts
Page({
  data: {
    connected: false,
  },
  onLoad() {
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
    wx.closeBluetoothAdapter()
    wx.setKeepScreenOn({
      keepScreenOn: false,
    })
  },
  // 启用遥控器功能
  async startListeningRemote() {
    const res = await wx
      .openBluetoothAdapter({
        mode: 'peripheral',
      })
      .catch((err) => {
        console.log('openBluetoothAdapter error', err)
        if (err.errCode === 10001) {
          wx.onBluetoothAdapterStateChange((res) => {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              // this.startBluetoothDevicesDiscovery()
              console.log('onBluetoothAdapterStateChange available')
            }
          })
        }
      })
    console.log('openBluetoothAdapter success', res)
    // 监听连接
    wx.onBLEPeripheralConnectionStateChanged((res) => {
      console.log('onBLEPeripheralConnectionStateChanged', res)
      if (res.connected) {
        this.setData({
          connected: true,
        })
      }
    })
  },
})
