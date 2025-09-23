type Data = {
  list: WechatMiniprogram.BlueToothDevice[]
  // connectingDevice: WechatMiniprogram.BlueToothDevice | null
  connectingDeviceId: string | null
}

Component({
  options: {
    pureDataPattern: /^_/,
  },
  properties: {
    iconClass: {
      type: String,
      value: '',
    },
    title: {
      type: String,
      value: '',
    },
    active: {
      type: Boolean,
      value: false,
    },
  },
})