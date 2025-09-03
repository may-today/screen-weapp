import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { message } from '@/stores/message'
import { Command } from '@/types'

Component({
  options: {
    pureDataPattern: /^_/,
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
  },
})
