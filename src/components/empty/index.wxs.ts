export const getIconClass = (type: string) => {
  if (type === 'default') {
    return 'i-lucide-circle-alert'
  }
  if (type === 'error') {
    return 'i-lucide-circle-x'
  }
  if (type === 'loading') {
    return 'i-lucide-loader-circle animate-spin'
  }
  return ''
}
