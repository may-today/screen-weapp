import { usePlayState } from '@/stores/playState'

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
  private playState: ReturnType<typeof usePlayState> | null = null

  prepare() {
    if (this.worker) {
      return
    }
    this.worker = createNewWorker()
    this.worker.onMessage(this._messageHandler)
    this.playState = usePlayState()
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
      this.playState?.addCurrentTimeSecond()
    }
  }
  start() {
    this._postMessage('interval:start')
    this.playState?.setAutoPlay(true)
  }
  pause() {
    this._postMessage('interval:stop')
    this.playState?.setAutoPlay(false)
  }
  clear() {
    this.pause()
    this.playState?.setCurrentTime(0)
  }
}

export const timeServer = new TimeServer()
