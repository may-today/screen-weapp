export const getIconClass = (type: string) => {
  if (type === 'default') {
    return 'i-lucide-circle-alert'
  } else if (type === 'error') {
    return 'i-lucide-circle-x'
  } else if (type === 'loading') {
    return 'i-lucide-loader-circle animate-spin'
  }
  return ''
}
