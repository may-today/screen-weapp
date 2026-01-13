import routes from 'weapp-vite/auto-routes'
import { defineAppJson } from 'weapp-vite/json'

export default defineAppJson({
  $schema: 'https://vite.icebreaker.top/app.json',
  pages: routes.pages,
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
