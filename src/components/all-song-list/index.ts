import { ComponentWithStore } from 'mobx-miniprogram-bindings'
import { data } from '@/stores/data'

ComponentWithStore({
  data: {},
  storeBindings: {
    store: data,
    fields: ['metaGroupList'] as const,
    actions: [] as const,
  },
  methods: {
  },
})
