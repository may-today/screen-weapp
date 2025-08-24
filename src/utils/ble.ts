export class BleInstance {
  private static instance: BleInstance | null = null
  private constructor() {}

  public static getInstance(): BleInstance {
    if (!BleInstance.instance) {
      BleInstance.instance = new BleInstance()
    }
    return BleInstance.instance
  }

  public destroy() {
    wx.closeBluetoothAdapter()
    BleInstance.instance = null
  }

  public async openBluetoothAdapterAndRun(callback: () => void) {
    const res = await wx.openBluetoothAdapter().catch((err) => {
      if (err.errCode === 10001) {
        // 手机蓝牙功能不可用，但此时小程序蓝牙模块已经初始化完成，监听蓝牙状态改变后可重新连入
        wx.onBluetoothAdapterStateChange((res) => {
          if (res.available) {
            callback()
          }
        })
      }
      console.log('openBluetoothAdapter error', err)
      throw err
    })
    console.log('openBluetoothAdapter success', res)
    callback()
  }

  public async startBluetoothDevicesDiscovery() {
    const res = await wx.startBluetoothDevicesDiscovery().catch((err) => {
      console.log('startBluetoothDevicesDiscovery error', err)
    })
  }
}
