// TODO:
// 设备类型: 1. 手机 2. 平板 3. 电脑
// 系统类型：1. iOS 2. Android 3. HarmonyOS 4. PC
// 网络类型： 1. 移动网络 2. WiFi 3. 无网络
// 屏幕分辨率：8位 16进制
// 用户id：转为12位 16进制
export const MayScreenServiceUuid = '00619319-1997-0329-5525-EA95C2EE6000'
export const MayScreenCharacteristicUuid = {
  songId: '00001001-1000-1000-8000-00805F9B34FB',
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
