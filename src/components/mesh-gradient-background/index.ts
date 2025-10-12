Component({
  options: {
    pureDataPattern: /^_/,
  },
  data: {
    backgroundIndex: 1,
  },
  properties: {
    extraClass: {
      type: String,
      value: '',
    },
  },
  pageLifetimes: {
    show() {
      const randomIndex = Math.floor(Math.random() * 5) + 1
      // const randomIndex = 5
      this.setData({
        backgroundIndex: randomIndex,
      })
    },
  }
})
