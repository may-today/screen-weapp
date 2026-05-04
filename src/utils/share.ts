import { onShareAppMessage, onShareTimeline } from 'wevu'

export const enableShare = (options?: {
  appMessage?: boolean
  timeline?: boolean
}) => {
  const shareAppMessageEnabled = options?.appMessage ?? true
  const shareTimelineEnabled = options?.timeline ?? true

  console.log('enableShare', { shareAppMessageEnabled, shareTimelineEnabled })

  const shareData = {
    title: 'MayScreen 云端提词器',
    path: '/pages/index/index',
  }

  if (shareAppMessageEnabled) {
    onShareAppMessage(() => ({
      ...shareData,
      imageUrl: 'https://wx-static.ddiu.site/mayscreen/shareimg.png',
    }))
  }
  if (shareTimelineEnabled) {
    onShareTimeline(() => shareData)
  }
}