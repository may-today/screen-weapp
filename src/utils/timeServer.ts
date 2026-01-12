import { data } from '@/stores/data'

const createNewWorker = () => {
  const worker = wx.createWorker('workers/index.js')
  worker.onProcessKilled(() => {
    createNewWorker()
  })
  return worker
}

type PostMessageEvent = 'interval:start' | 'interval:stop'

export class TimeServer {
  private worker: WechatMiniprogram.Worker | null = null
  // constructor() {
  //   this.worker = createNewWorker()
  // }
  prepare() {
    if (this.worker) {
      return
    }
    this.worker = createNewWorker()
    this.worker.onMessage(this._messageHandler)
  }
  destroy() {
    if (!this.worker) {
      return
    }
    this.clear()
    this.worker.terminate()
    this.worker = null
  }
  private _postMessage(event: PostMessageEvent) {
    if (!this.worker) {
      return
    }
    this.worker.postMessage({
      message: { event },
    })
  }
  private readonly _messageHandler: WechatMiniprogram.WorkerOnMessageCallback = (message) => {
    if (!message.message) {
      return
    }
    if (message.message.event === 'interval:update') {
      data.addCurrentTimeSecond()
    }
  }
  start() {
    this._postMessage('interval:start')
    data.setAutoPlay(true)
  }
  pause() {
    this._postMessage('interval:stop')
    data.setAutoPlay(false)
  }
  clear() {
    this.pause()
    data.setCurrentTime(0)
  }
}

export const timeServer = new TimeServer()
