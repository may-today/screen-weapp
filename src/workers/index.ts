// 声明全局 worker 变量
declare const worker: WechatMiniprogram.Worker

let interval: number

const _postMessage = (event: string) => {
  worker.postMessage({
    message: { event },
  })
}

worker.onMessage((res) => {
  if (!res.message) return
  if (res.message.event === 'interval:start') {
    startInterval()
  } else if (res.message.event === 'interval:stop') {
    stopInterval()
  }
})

const startInterval = () => {
  stopInterval()
  interval = setInterval(() => {
    _postMessage('interval:update')
  }, 1000)
}

const stopInterval = () => {
  clearInterval(interval)
  interval = 0
}
