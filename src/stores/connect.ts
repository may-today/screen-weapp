import { computed, defineStore, ref } from 'wevu'
import type { ScreenMeta } from '@/types/device'
import type { ScreenConnectionState } from '@/types/connect'
import { ConnectStatus } from '@/types/connect'

export interface RemoteMeta {
  nickName: string
  deviceId?: string
  connectedAt: number
}

export const useConnectStore = defineStore('connect', () => {
  // Remote 侧：多 screen 连接 Map（bleRemote 写入）
  const screens = ref<Map<string, ScreenConnectionState>>(new Map())
  // Screen 侧：单 remote 连接（bleScreen 写入）
  const currentRemoteMeta = ref<RemoteMeta | null>(null)
  // 蓝牙适配器是否已初始化（替代原来的 ConnectStatus.Disabled）
  const adapterReady = ref(false)

  // ── 向后兼容的聚合计算属性（remote 侧，现有组件无需修改）──
  const connectStatus = computed<ConnectStatus>(() => {
    const vals = [...screens.value.values()]
    if (vals.some(s => s.status === ConnectStatus.Connected)) return ConnectStatus.Connected
    if (vals.some(s => s.status === ConnectStatus.Authorizing)) return ConnectStatus.Authorizing
    if (vals.some(s => s.status === ConnectStatus.Connecting)) return ConnectStatus.Connecting
    return ConnectStatus.Disconnected
  })

  const currentScreenMeta = computed<ScreenMeta | null>(() => {
    const first = [...screens.value.values()].find(s => s.status === ConnectStatus.Connected)
    return first?.meta ?? null
  })

  const rssi = computed<number | null>(() => {
    const vals = [...screens.value.values()]
      .filter(s => s.status === ConnectStatus.Connected && s.rssi !== null)
      .map(s => s.rssi as number)
    if (!vals.length) return null
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
  })

  // ── Screen 侧原有单值状态（bleScreen 专用）──
  const _screenConnectStatus = ref<ConnectStatus>(ConnectStatus.Disabled)
  const _screenRssi = ref<number | null>(null)

  // ── Map 操作方法 ──
  const upsertScreen = (state: ScreenConnectionState) => {
    screens.value.set(state.deviceId, state)
    screens.value = new Map(screens.value)
  }

  const updateScreen = (deviceId: string, patch: Partial<ScreenConnectionState>) => {
    const existing = screens.value.get(deviceId)
    if (!existing) return
    screens.value.set(deviceId, { ...existing, ...patch })
    screens.value = new Map(screens.value)
  }

  const removeScreen = (deviceId: string) => {
    screens.value.delete(deviceId)
    screens.value = new Map(screens.value)
  }

  const clearScreens = () => {
    screens.value = new Map()
  }

  // ── Screen 侧方法（保留原接口，供 bleScreen 调用）──
  const setConnectStatus = (status: ConnectStatus) => {
    console.log('ConnectStatus (screen) changed:', ConnectStatus[status])
    _screenConnectStatus.value = status
  }

  const setRssi = (val: number | null) => {
    _screenRssi.value = val
  }

  const setCurrentRemoteMeta = (meta: RemoteMeta | null) => {
    currentRemoteMeta.value = meta
  }

  const setAdapterReady = (v: boolean) => {
    adapterReady.value = v
  }

  const $reset = () => {
    clearScreens()
    currentRemoteMeta.value = null
    adapterReady.value = false
    _screenConnectStatus.value = ConnectStatus.Disabled
    _screenRssi.value = null
  }

  return {
    // Remote 侧多屏幕 API
    screens,
    upsertScreen,
    updateScreen,
    removeScreen,
    clearScreens,
    adapterReady,
    setAdapterReady,
    // 向后兼容的聚合计算属性（remote 模式）
    connectStatus,
    currentScreenMeta,
    rssi,
    // Screen 侧原有接口
    currentRemoteMeta,
    setCurrentRemoteMeta,
    _screenConnectStatus,
    _screenRssi,
    setConnectStatus,
    setRssi,
    $reset,
  }
})
