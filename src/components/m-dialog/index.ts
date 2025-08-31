Component({
  options: {
    pureDataPattern: /^_/,
  },
  properties: {
    show: {
      type: Boolean,
      value: false,
    },
    title: {
      type: String,
      value: '',
    },
    customStyle: {
      type: String,
      value: '',
    },
  },
  methods: {
    handleAfterLeave() {
      this.triggerEvent('close')
    },
    handleCloseButtonTap() {
      this.triggerEvent('close')
    },
  },
})
