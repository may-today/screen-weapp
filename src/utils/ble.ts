export const MayScreenCharacteristicUuid = {
  /** 状态读，用于获取设备状态 remote -> screen */
  status: '00001000-1000-1000-8000-00805F9B34FB',
  /** 短通信读，用于发送 20 字节内消息指令 screen -> remote */
  read: '00001001-1000-1000-8000-00805F9B34FB',
  /** 长通信读，用于发送大量数据 screen -> remote */
  readLarge: '00002001-1000-1000-8000-00805F9B34FB',
  /** 短通信写，用于接收 20 字节内消息指令 remote -> screen */
  write: '00001002-1000-1000-8000-00805F9B34FB',
  /** 长通信写，用于接收大量数据 remote -> screen */
  writeLarge: '00002002-1000-1000-8000-00805F9B34FB',
} as const

export const openBluetoothAdapter = async (mode: 'central' | 'peripheral') => {
  try {
    const res = await wx.openBluetoothAdapter({
      mode,
    })
    console.log('openBluetoothAdapter success', res)
    return
  } catch (err: any) {
    if (err.errCode === 10_001) {
      // 手机蓝牙功能不可用，但此时小程序蓝牙模块已经初始化完成，监听蓝牙状态改变后可重新连入
      return new Promise<void>((resolve) => {
        wx.onBluetoothAdapterStateChange((res) => {
          if (res.available) {
            resolve()
          }
        })
      })
    }
    console.log('openBluetoothAdapter error', err)
    throw err
  }
}
