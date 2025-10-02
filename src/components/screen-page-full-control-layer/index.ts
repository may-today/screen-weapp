import { data } from '@/stores/data'

Component({
  options: {
    pureDataPattern: /^_/,
  },
  data: {
    _gestureTouchStartY: 0,
  },
  methods: {
    handleClickAreaLeft() {
      data.prevLyricLine()
    },
    handleClickAreaRight() {
      data.nextLyricLine()
    },
    handleTouchStart(event: WechatMiniprogram.TouchEvent) {
      this.setData({
        _gestureTouchStartY: event.touches[0].clientY,
      })
    },
    handleTouchEnd(event: WechatMiniprogram.TouchEvent) {
      const gestureTouchEndY = event.changedTouches[0].clientY
      const gestureDeltaY = gestureTouchEndY - this.data._gestureTouchStartY
      if (Math.abs(gestureDeltaY) < 20) {
        return
      }
      if (gestureDeltaY > 0) {
        this.handleClickAreaLeft()
      } else {
        this.handleClickAreaRight()
      }
    },
  },
})