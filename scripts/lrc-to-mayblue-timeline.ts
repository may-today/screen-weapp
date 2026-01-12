import path from 'node:path'
import { parseRawLRCFile } from '../src/utils/lyric'

const inputPath = path.join(__dirname, 'input.txt')
const outputPath = path.join(__dirname, 'output.txt')
const inputText = await Bun.file(inputPath).text()

const lyricLines = parseRawLRCFile(inputText)
console.log(lyricLines)
const timelineText = lyricLines.map((line) => `${line.time},${line.text}`).join('\n')
console.log(timelineText)

await Bun.write(outputPath, timelineText)
