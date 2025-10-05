export const parseDuration = (duration: number) => {
  if (duration < 0) {
    return ''
  }
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}
