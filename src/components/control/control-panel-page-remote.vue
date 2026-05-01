<script setup lang="ts">
import { storeToRefs } from 'wevu/store'
import { useConnectStore } from '@/stores/connect'
import ControlPanelPage from './control-panel-page.vue'
import { BleScreen } from '@/utils/bleScreen'

const connectStore = useConnectStore()
const { connectStatus } = storeToRefs(connectStore)

const bleScreen = BleScreen.getInstance()

const startListeningRemote = async () => {
  await bleScreen.prepare()
  await bleScreen.startAdvertising()
}
</script>

<template>
  <ControlPanelPage title="遥控器">
    <text>connectStatus: {{ connectStatus }}</text>
    <button @tap="startListeningRemote">启用遥控器功能</button>
  </ControlPanelPage>
</template>
