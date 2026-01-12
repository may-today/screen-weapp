import type { WebSearchTrackItem } from '@/utils/webSearch'

Component({
  options: {
    pureDataPattern: /^_/,
  },
  properties: {
    info: {
      type: Object,
      value: <WebSearchTrackItem>{},
    },
  },
})
