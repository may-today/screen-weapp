Component({
  options: {
    pureDataPattern: /^_/,
    multipleSlots: true,
  },
  properties: {
    title: {
      type: String,
      value: '',
    },
  },
})