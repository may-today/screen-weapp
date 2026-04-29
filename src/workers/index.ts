declare const worker: WechatMiniprogram.Worker

let interval: number | NodeJS.Timeout = 0

function _postMessage(event: string) {
  worker.postMessage({
    message: { event },
  })
}

function stopInterval() {
  clearInterval(interval)
  interval = 0
}

function startInterval() {
  stopInterval()
  interval = setInterval(() => {
    _postMessage('interval:update')
  }, 1000)
}

worker.onMessage((res) => {
  if (!res.message) {
    return
  }
  if (res.message.event === 'interval:start') {
    startInterval()
  }
  else if (res.message.event === 'interval:stop') {
    stopInterval()
  }
})
