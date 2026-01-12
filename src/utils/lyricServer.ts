import { data } from '@/stores/data'

export class LyricServer {
  setCurrentSongData = data.setCurrentSongData
}

export const lyricServer = new LyricServer()
