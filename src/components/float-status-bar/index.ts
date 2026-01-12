import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { message } from '@/stores/message'

type Data = {}

ComponentWithStore({
  options: {
    pureDataPattern: /^_/,
  },
  data: <Data>{},
  storeBindings: {
    store: message,
    fields: ['latestMessage'] as const,
    actions: [] as const,
    // actions: {
    //   buttonTap: 'update',
    // } as const,
  },
  methods: {},
})
