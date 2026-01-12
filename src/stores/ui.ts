import { defineStore, ref } from 'wevu'

export const useUi = defineStore('ui', () => {
  const showScreenFloatPanel = ref(false)
  const setShowScreenFloatPanel = (show: boolean) => {
    showScreenFloatPanel.value = show
  }
  return { showScreenFloatPanel, setShowScreenFloatPanel }
})
