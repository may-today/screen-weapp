export const MayScreenCharacteristicUuid = {
  songId: '00001001-1000-1000-8000-00805F9B34FB',
  read: '00001001-1000-1000-8000-00805F9B34FB',
  write: '00001002-1000-1000-8000-00805F9B34FB',
}

export const openBluetoothAdapter = async (mode: 'central' | 'peripheral') => {
  try {
    const res = await wx.openBluetoothAdapter({
      mode,
    })
    console.log('openBluetoothAdapter success', res)
    return
  } catch (err: any) {
    if (err.errCode === 10001) {
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
