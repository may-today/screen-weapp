import { defineStore, ref } from 'wevu'

export const useUi = defineStore('ui', () => {
  const showScreenFloatPanel = ref(false)
  const globalLoading = ref(false)

  const $reset = () => {
    showScreenFloatPanel.value = false
    globalLoading.value = false
  }
  const setShowScreenFloatPanel = (show: boolean) => {
    showScreenFloatPanel.value = show
  }
  const setGlobalLoading = (loading: boolean) => {
    globalLoading.value = loading
  }
  return { showScreenFloatPanel, globalLoading, $reset, setShowScreenFloatPanel, setGlobalLoading }
})
