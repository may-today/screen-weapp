import type { SongDetail } from "@/types"

Component({
  options: {
    pureDataPattern: /^_/,
  },
  properties: {
    active: {
      type: Boolean,
      value: false,
    },
    detail: {
      type: Object,
      value: <SongDetail>{},
    },
    extraInfo: {
      type: String,
      value: '',
    },
  },
})
