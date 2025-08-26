import { BleRemote } from '@/utils/bleRemote'

// function inArray(arr, key, val) {
//   for (let i = 0; i < arr.length; i++) {
//     if (arr[i][key] === val) {
//       return i
//     }
//   }
//   return -1
// }

// // ArrayBuffer转16进度字符串示例
// function ab2hex(buffer) {
//   var hexArr = Array.prototype.map.call(new Uint8Array(buffer), function (bit) {
//     return ('00' + bit.toString(16)).slice(-2)
//   })
//   return hexArr.join('')
// }

Page({
  data: {
    deviceList: [] as WechatMiniprogram.BlueToothDevice[],
    connected: false,
    deviceId: '',
  },
  state: {
    bleInstance: BleRemote.getInstance(),
  },
  async onLoad() {
    wx.showNavigationBarLoading()
    await this.state.bleInstance.prepare()
    this.startSearchDevices()
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {
    this.state.bleInstance.stopScanning()
    this.state.bleInstance.destroy()
  },
  // 开始扫描
  startSearchDevices() {
    this.state.bleInstance.startScanning((deviceList) => {
      this.setData({
        deviceList,
      })
    })
  },
  handleDeviceClick(e: WechatMiniprogram.TouchEvent) {
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceId
    console.log('handleDeviceClick', deviceId)
    this.createBLEConnection(deviceId)
  },
  async createBLEConnection(deviceId: string) {
    this.state.bleInstance.stopScanning()
    await this.state.bleInstance.connectDevice(deviceId)
    this.setData({
      connected: true,
      deviceId,
    })
  },
  // async getBLEDeviceCharacteristics(deviceId: string, serviceId: string) {
  //   const res = await wx.getBLEDeviceCharacteristics({
  //     deviceId,
  //     serviceId,
  //   })
  //   // for (let i = 0; i < res.characteristics.length; i++) {
  //   //   let item = res.characteristics[i]
  //   //   if (item.properties.read) {
  //   //     wx.readBLECharacteristicValue({
  //   //       deviceId,
  //   //       serviceId,
  //   //       characteristicId: item.uuid,
  //   //     })
  //   //   }
  //   //   if (item.properties.write) {
  //   //     this.setData({
  //   //       canWrite: true,
  //   //     })
  //   //     this._deviceId = deviceId
  //   //     this._serviceId = serviceId
  //   //     this._characteristicId = item.uuid
  //   //     this.writeBLECharacteristicValue()
  //   //   }
  //   //   if (item.properties.notify || item.properties.indicate) {
  //   //     wx.notifyBLECharacteristicValueChange({
  //   //       deviceId,
  //   //       serviceId,
  //   //       characteristicId: item.uuid,
  //   //       state: true,
  //   //     })
  //   //   }
  //   // }
  //   // 操作之前先监听，保证第一时间获取数据
  //   // wx.onBLECharacteristicValueChange((characteristic) => {
  //   //   const idx = inArray(this.data.chs, 'uuid', characteristic.characteristicId)
  //   //   const data = {}
  //   //   if (idx === -1) {
  //   //     data[`chs[${this.data.chs.length}]`] = {
  //   //       uuid: characteristic.characteristicId,
  //   //       value: ab2hex(characteristic.value),
  //   //     }
  //   //   } else {
  //   //     data[`chs[${idx}]`] = {
  //   //       uuid: characteristic.characteristicId,
  //   //       value: ab2hex(characteristic.value),
  //   //     }
  //   //   }
  //   //   // data[`chs[${this.data.chs.length}]`] = {
  //   //   //   uuid: characteristic.characteristicId,
  //   //   //   value: ab2hex(characteristic.value)
  //   //   // }
  //   //   this.setData(data)
  //   // })
  // },
  handleSendData() {
    this.state.bleInstance.sendData(this.data.deviceId, '我好想好想飞/逃离这个疯狂世界/那么多苦 那么多累/那么多莫名的泪水/我好想好想飞/逃离这个疯狂的世界/如果是你 发现了我/也别将我挽回')
  },
})
