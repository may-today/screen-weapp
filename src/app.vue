<script setup lang="ts">
import autoRoutes from 'weapp-vite/auto-routes'
import { onHide, onLaunch, onShow } from 'wevu'
import { wpi } from 'wevu/api'
import { createRouter } from 'wevu/router'

defineAppJson({
  pages: autoRoutes.pages,
  entryPagePath: 'pages/index/index',
  subPackages: autoRoutes.subPackages,
  window: {
    navigationBarBackgroundColor: '#171717',
    navigationBarTextStyle: 'white',
    backgroundColor: '#171717',
    backgroundTextStyle: 'dark',
    navigationBarTitleText: 'MayScreen',
    navigationStyle: 'default',
  },
  // tabBar: {
  //   color: '#7a7aa0',
  //   selectedColor: '#2f2b5f',
  //   backgroundColor: '#ffffff',
  //   borderStyle: 'white',
  //   list: [
  //     {
  //       pagePath: 'pages/index/index',
  //       text: '首页',
  //       iconPath: 'tabbar/home.png',
  //       selectedIconPath: 'tabbar/home-active.png',
  //     },
  //     {
  //       pagePath: 'pages/data/index',
  //       text: '数据',
  //       iconPath: 'tabbar/data.png',
  //       selectedIconPath: 'tabbar/data-active.png',
  //     },
  //     {
  //       pagePath: 'pages/form/index',
  //       text: '表单',
  //       iconPath: 'tabbar/form.png',
  //       selectedIconPath: 'tabbar/form-active.png',
  //     },
  //     {
  //       pagePath: 'pages/list/index',
  //       text: '清单',
  //       iconPath: 'tabbar/list.png',
  //       selectedIconPath: 'tabbar/list-active.png',
  //     },
  //     {
  //       pagePath: 'pages/ability/index',
  //       text: '能力',
  //       iconPath: 'tabbar/ability.png',
  //       selectedIconPath: 'tabbar/ability-active.png',
  //     },
  //   ],
  // },
  style: 'v2',
  componentFramework: 'glass-easel',
  sitemapLocation: 'sitemap.json',
  resizable: true,
  enablePassiveEvent: true,
  workers: 'workers',
})

const logger = wpi.getLogManager({ level: 1 })

const router = createRouter({
  routes: autoRoutes.entries.map(path => ({
    name: path,
    path: `/${path}`,
  })),
})

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
