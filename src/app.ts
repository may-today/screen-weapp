import { BleRemote } from './utils/bleRemote'
import { BleScreen } from './utils/bleScreen'

// app.ts
App({
  globalData: {
    bleRemote: BleRemote.getInstance(),
    bleScreen: BleScreen.getInstance(),
  },
  onLaunch() {},
})
