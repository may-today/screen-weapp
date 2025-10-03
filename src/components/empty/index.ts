Component({
  options: {
    pureDataPattern: /^_/,
  },
  properties: {
    text: {
      type: String,
      value: '',
    },
    type: {
      type: String,
      value: <'default' | 'error' | 'loading' | 'none'>'default',
    },
    extraClass: {
      type: String,
      value: '',
    },
  },
})
