type Data = {
  device: WechatMiniprogram.BlueToothDevice
}

Component({
  properties: {
    device: {
      type: Object,
      value: {},
    },
  },
  data: <Data>{}
})