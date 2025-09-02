import type { BleRemote } from '@/utils/bleRemote'

Page({
  data: {
    deviceList: [] as WechatMiniprogram.BlueToothDevice[],
  },
  state: {
    bleInstance: getApp().globalData.bleRemote as BleRemote,
  },
  async onLoad() {
    await this.state.bleInstance.prepare()
    this.startSearchDevices()
  },
  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {
    this.state.bleInstance.stopScanning()
  },
  // 开始扫描
  startSearchDevices() {
    this.state.bleInstance.startScanning((deviceList) => {
      console.log('deviceList', deviceList)
      this.setData({
        deviceList,
      })
    })
  },
  async handleConnectSuccess() {
    wx.navigateBack()
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
  // handleSendLargeData() {
  //   this.state.bleInstance.sendLargeData(this.data.deviceId, '我好想好想飞/逃离这个疯狂世界/那么多苦 那么多累/那么多莫名的泪水/我好想好想飞/逃离这个疯狂的世界/如果是你 发现了我/也别将我挽回')
  // },
})
