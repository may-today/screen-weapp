// pages/screen/screen.ts
Page({
  data: {
    remoteStatus: 'off' as 'off' | 'waiting' | 'connected',
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
          // 手机蓝牙功能不可用，但此时小程序蓝牙模块已经初始化完成，监听蓝牙状态改变后可重新连入
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
    this.setData({
      remoteStatus: 'waiting',
    })
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
  stopListeningRemote() {
    // TODO: if connected to a device, close the connection
    // if (this.data.connected) {
    //   wx.closeBLEConnection({
    //     deviceId: this.data.deviceId,
    //   })
    // }
    this.setData({
      remoteStatus: 'off',
    })
  },
})
