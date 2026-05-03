import { defineStore, ref } from 'wevu'

export const useTransmitStore = defineStore('transmit', () => {
  const commandReceivedAt = ref(0)
  const commandSentAt = ref(0)
  const largeDataProgress = ref<{ current: number; total: number } | null>(null)

  const onCommandReceived = () => { commandReceivedAt.value = Date.now() }
  const onCommandSent = () => { commandSentAt.value = Date.now() }
  const onLargeDataChunk = (current: number, total: number) => {
    largeDataProgress.value = { current, total }
  }
  const onLargeDataComplete = () => { largeDataProgress.value = null }
  const $reset = () => {
    commandReceivedAt.value = 0
    commandSentAt.value = 0
    largeDataProgress.value = null
  }

  return {
    commandReceivedAt,
    commandSentAt,
    largeDataProgress,
    onCommandReceived,
    onCommandSent,
    onLargeDataChunk,
    onLargeDataComplete,
    $reset,
  }
})
