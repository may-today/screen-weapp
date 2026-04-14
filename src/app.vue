<script setup lang="ts">
import autoRoutes from 'weapp-vite/auto-routes'
import { onHide, onLaunch, onShow } from 'wevu'
import { wpi } from 'wevu/api'
import { createRouter } from 'wevu/router'

defineAppJson({
  $schema: 'https://vite.icebreaker.top/app.json',
  pages: autoRoutes.pages,
  entryPagePath: 'pages/index/index',
  window: {
    navigationBarBackgroundColor: '#171717',
    navigationBarTextStyle: 'white',
    backgroundColor: '#171717',
    backgroundTextStyle: 'dark',
    navigationBarTitleText: 'MayScreen',
    navigationStyle: 'default',
  },
  // "tabBar": {
  //   "list": [
  //     {
  //       "pagePath": "pages/remote/playing",
  //       "text": "正在展示"
  //     },
  //     {
  //       "pagePath": "pages/remote/library",
  //       "text": "内容库"
  //     }
  //   ]
  // },
  lazyCodeLoading: 'requiredComponents',
  style: 'v2',
  componentFramework: 'glass-easel',
  resizable: true,
  enablePassiveEvent: true,
  resolveAlias: {
    '@/*': '/*',
  },
  workers: 'workers',
})

const logger = wpi.getLogManager({ level: 1 })

const router = createRouter()

router.beforeEach((to, from) => {
  logger.info('[wevu-template-router] beforeEach', {
    to: to?.fullPath,
    from: from.fullPath,
  })
  return true
})

router.beforeResolve((to, from) => {
  logger.info('[wevu-template-router] beforeResolve', {
    to: to?.fullPath,
    from: from.fullPath,
  })
  return true
})

router.afterEach((to, from, failure) => {
  logger.info('[wevu-template-router] afterEach', {
    to: to?.fullPath,
    from: from.fullPath,
    failureType: failure?.type,
  })
})

router.onError((error, context) => {
  logger.info('[wevu-template-router] onError', {
    error: error instanceof Error ? error.message : String(error),
    mode: context.mode,
    to: context.to?.fullPath,
    from: context.from.fullPath,
    failureType: context.failure.type,
  })
})

onShow(() => {
  logger.info('[weapp-vite-wevu-template] app show')
})

onHide(() => {
  logger.info('[weapp-vite-wevu-template] app hide')
})

onLaunch(() => {
  logger.info('[weapp-vite-wevu-template] app launch')
})
</script>

<style src="./app.css"></style>
