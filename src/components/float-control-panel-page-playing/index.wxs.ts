export const parseTime = (inputNumber: number) => {
  if (inputNumber < 0) {
    return ''
  }
  const minutes = Math.floor(inputNumber / 60)
  const seconds = inputNumber % 60
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`
  const secondsStr = seconds < 10 ? `0${seconds}` : `${seconds}`
  return `${minutesStr}:${secondsStr}`
}

export const getLyricLineClass = (highlight: boolean, active: boolean) => {
  const baseClass = 'flex flex-row items-center gap-2 mx-2 px-2 py-1.5 min-h-8 rounded-md first:mt-2 last:mb-2'
  if (active) {
    return `${baseClass} bg-primary text-primary-foreground font-medium`
  }
  if (highlight) {
    return `${baseClass} text-theme-foreground`
  }
  return baseClass
}
