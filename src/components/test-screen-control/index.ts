import { message } from '@/stores/message'
import { Command } from '@/types'
import type { BleScreen } from '@/utils/bleScreen'

Component({
  options: {
    pureDataPattern: /^_/,
  },
  data: {
    _bleInstance: getApp().globalData.bleScreen as BleScreen,
  },
  methods: {
    sendAuthorizeMessage() {
      message.addMessage({
        command: Command.Authorize,
      })
    },
    sendChangeSongIdMessage() {
      message.addMessage({
        command: Command.ChangeSongId,
        payload: '1234567890',
      })
    },
    async startListeningRemote() {
      await this.data._bleInstance.prepare()
      await this.data._bleInstance.startAdvertising()
    },
    stopListeningRemote() {
      this.data._bleInstance.destroy()
    },
  },
})
