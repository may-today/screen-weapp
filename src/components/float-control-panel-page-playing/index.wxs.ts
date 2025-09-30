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
