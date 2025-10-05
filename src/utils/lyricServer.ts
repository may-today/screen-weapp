import { data } from '@/stores/data'
import { timeServer } from './timeServer'

export class LyricServer {
  setCurrentSongData = data.setCurrentSongData
}

export const lyricServer = new LyricServer()
