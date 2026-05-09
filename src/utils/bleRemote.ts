import TextEncoder from 'miniprogram-text-encoder'
import { useConnectStore } from '@/stores/connect'
import { useTransmitStore } from '@/stores/transmit'
import { type BaseError, Command } from '@/types'
import { ConnectStatus, type ScreenConnectionState } from '@/types/connect'
import { ScreenSystem } from '@/types/device'
import { MayScreenCharacteristicUuid, openBluetoothAdapter } from './ble'
import { compressPayload, decompressPayload, largeDataToChunks, parseLargeDataPacket, parseShortPacket, reassembleLargeDataRaw, shortCommandToPacket } from './packet'
import { getDeviceInfoFromUuid } from './uuid'

const _log = (...args: any[]) => {
  console.log('[BLE:Remote]', ...args)
}

const _logError = (...args: any[]) => {
  console.error('[BLE:Remote]', ...args)
}

const _toastError = (err: BaseError, message: string) => {
  const codePrefix = err?.errCode ? `[${err.errCode}] ` : ''
  const errnoSuffix = err?.errno ? ` (errno: ${err.errno})` : ''
  const title = `${codePrefix}${message}${errnoSuffix}`
  _logError(title, err)
  wx.showToast({
    title,
    icon: 'none',
  })
}

/** BLE Remote，指令发送端 */
export class BleRemote {
  private static _instance: BleRemote | null = null
  private static readonly _HEARTBEAT_TIMEOUT = 12_000
  private static readonly _RECONNECT_MAX_RETRIES = 3

  private readonly _screens: Map<string, ScreenConnectionState> = new Map()
  private _listenerRegistered = false

  private _connectStore = useConnectStore()
  private _transmitStore = useTransmitStore()
  private _commandListener: ((command: Command, payload: string) => void) | null = null
  private _largeDataListener: ((data: string) => void) | null = null
  private readonly _remoteNickName = BleRemote._createRemoteNickName()

  constructor() {
    this._connectStore = useConnectStore()
    this._transmitStore = useTransmitStore()
  }

  public static getInstance(): BleRemote {
    if (!BleRemote._instance) {
      BleRemote._instance = new BleRemote()
    }
    return BleRemote._instance
  }

  private static _createRemoteNickName(): string {
    const shortId = Math.floor(Math.random() * 0x10000).toString(16).toUpperCase().padStart(4, '0')
    return `R-${shortId}`
  }

  public get remoteNickName(): string {
    return this._remoteNickName
  }

  public get connectedScreens(): ScreenConnectionState[] {
    return [...this._screens.values()].filter(s => s.status === ConnectStatus.Connected)
  }

  public get hasConnectedScreen(): boolean {
    return this.connectedScreens.length > 0
  }

  // ── 全局特征值变化路由 ────────────────────────────────────────────────

  private _handleCharacteristicValueChange(
    res: WechatMiniprogram.OnBLECharacteristicValueChangeCallbackResult,
  ): void {
    const screen = this._screens.get(res.deviceId)
    if (!screen) return

    if (res.characteristicId === MayScreenCharacteristicUuid.status) {
      const value = new Uint8Array(res.value)
      screen.lastHeartbeatAt = Date.now()
      _log(`heartbeat from ${res.deviceId}`, value)
      if (value[0] === 0x01) {
        screen.status = ConnectStatus.Connected
        this._transmitStore.onCommandReceived()
        this._connectStore.updateScreen(res.deviceId, {
          status: ConnectStatus.Connected,
          lastHeartbeatAt: screen.lastHeartbeatAt,
        })
        wx.getBLEDeviceRSSI({
          deviceId: res.deviceId,
          success: (rssiRes) => {
            this._connectStore.updateScreen(res.deviceId, { rssi: rssiRes.RSSI })
            this._sendCommandToDevice(res.deviceId, Command.Rssi, rssiRes.RSSI.toString(), true).catch(() => {})
          },
        })
      }
      else {
        screen.status = ConnectStatus.Disconnected
        this._connectStore.updateScreen(res.deviceId, { status: ConnectStatus.Disconnected })
      }
    }
    else if (res.characteristicId === MayScreenCharacteristicUuid.read) {
      const cmd = parseShortPacket(res.value)
      _log(`command from screen ${res.deviceId}: ${Command[cmd.command] || 'unknown'} (${cmd.payload || null})`)
      if (cmd.command === Command.ReplyAuthorize) {
        screen.status = ConnectStatus.Connected
        this._connectStore.updateScreen(res.deviceId, { status: ConnectStatus.Connected })
      }
      this._commandListener?.(cmd.command, cmd.payload)
      this._transmitStore.onCommandReceived()
    }
    else if (res.characteristicId === MayScreenCharacteristicUuid.readLarge) {
      this._handleParseLargeData(res.deviceId, res.value)
    }
  }

  // ── Per-device 看门狗 ──────────────────────────────────────────────────

  private _startWatchdog(deviceId: string): void {
    const screen = this._screens.get(deviceId)
    if (!screen) return
    this._stopWatchdog(deviceId)
    screen.lastHeartbeatAt = Date.now()
    screen.watchdogTimer = setInterval(() => {
      const s = this._screens.get(deviceId)
      if (!s) return
      if (Date.now() - s.lastHeartbeatAt > BleRemote._HEARTBEAT_TIMEOUT) {
        _log(`heartbeat timeout for ${deviceId}, reconnecting...`)
        clearInterval(s.watchdogTimer!)
        s.watchdogTimer = null
        this._handleReconnect(deviceId)
      }
    }, 3000)
  }

  private _stopWatchdog(deviceId: string): void {
    const s = this._screens.get(deviceId)
    if (!s?.watchdogTimer) return
    clearInterval(s.watchdogTimer)
    s.watchdogTimer = null
    s.lastHeartbeatAt = 0
    s.reconnectRetryCount = 0
  }

  private async _handleReconnect(deviceId: string): Promise<void> {
    const screen = this._screens.get(deviceId)
    if (!screen) return
    this._connectStore.updateScreen(deviceId, { rssi: null })
    if (screen.reconnectRetryCount >= BleRemote._RECONNECT_MAX_RETRIES) {
      _logError(`reconnect exhausted for ${deviceId}, removing`)
      this._screens.delete(deviceId)
      this._connectStore.removeScreen(deviceId)
      return
    }
    screen.reconnectRetryCount++
    _log(`reconnect attempt ${screen.reconnectRetryCount}/${BleRemote._RECONNECT_MAX_RETRIES} for ${deviceId}`)
    try {
      await wx.closeBLEConnection({ deviceId }).catch(() => {})
      await this._delay(2000)
      this._screens.delete(deviceId)
      this._connectStore.removeScreen(deviceId)
      await this.connectDevice(deviceId)
      _log(`reconnect success for ${deviceId}`)
    }
    catch (err) {
      _logError(`reconnect failed for ${deviceId}`, err)
      await this._handleReconnect(deviceId)
    }
  }

  // ── 生命周期 ────────────────────────────────────────────────────────────

  public async prepare(): Promise<void> {
    await openBluetoothAdapter('central')
    this._connectStore.setAdapterReady(true)
    if (!this._listenerRegistered) {
      this._listenerRegistered = true
      wx.onBLECharacteristicValueChange(res => this._handleCharacteristicValueChange(res))
    }
  }

  public destroy() {
    void this.disconnect()
    wx.closeBluetoothAdapter()
    this._commandListener = null
    this._largeDataListener = null
    this._listenerRegistered = false
    BleRemote._instance = null
    this._connectStore.$reset()
    _log('destroy')
  }

  // ── 扫描 ───────────────────────────────────────────────────────────────

  public startScanning(onFound: (deviceList: WechatMiniprogram.BlueToothDevice[]) => void) {
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      interval: 2000,
    }).catch((err) => {
      _toastError(err, '搜索设备失败')
    })
    wx.onBluetoothDeviceFound((res) => {
      if (res.devices !== undefined) {
        const filteredDevices = res.devices
          .filter((device) => {
            if (!device.name) return false
            if (device.advertisServiceUUIDs?.length !== 1) return false
            if (!device.advertisServiceUUIDs[0].startsWith('19970329-')) return false
            return true
          })
          .sort((a, b) => b.RSSI - a.RSSI)
        onFound(filteredDevices)
      }
    })
  }

  public async stopScanning(): Promise<void> {
    await wx.stopBluetoothDevicesDiscovery()
  }

  // ── 连接 ───────────────────────────────────────────────────────────────

  public async connectDevice(deviceId: string): Promise<void> {
    if (this._screens.has(deviceId)) {
      _log(`connectDevice: ${deviceId} already tracked, skipping`)
      return
    }

    const initialState: ScreenConnectionState = {
      deviceId,
      serviceUuid: '',
      meta: null,
      status: ConnectStatus.Connecting,
      mtu: 20,
      rssi: null,
      lastHeartbeatAt: 0,
      reconnectRetryCount: 0,
      watchdogTimer: null,
      chunkBuffer: new Map(),
    }
    this._screens.set(deviceId, initialState)
    this._connectStore.upsertScreen(initialState)

    try {
      // 阶段1. 建立连接
      await wx.createBLEConnection({ deviceId, timeout: 10_000 }).catch(async (e) => {
        _toastError(e, '连接设备失败')
        throw e
      })
      _log('createBLEConnection success', deviceId)

      // 阶段2. 服务发现 + 授权阶段
      initialState.status = ConnectStatus.Authorizing
      this._connectStore.updateScreen(deviceId, { status: ConnectStatus.Authorizing })
      const servicesRes = await wx.getBLEDeviceServices({ deviceId })
      _log('getBLEDeviceServices success', servicesRes.services)
      const serviceUuid = servicesRes.services.find(service => service.uuid.startsWith('19970329-'))?.uuid
      if (!serviceUuid) {
        throw new Error('服务UUID不存在')
      }
      _log(`screen serviceUuid: ${serviceUuid}`)
      const deviceInfo = getDeviceInfoFromUuid(serviceUuid)
      _log(`screen deviceInfo: ${JSON.stringify(deviceInfo)}`)

      const screen = this._screens.get(deviceId)!
      screen.serviceUuid = serviceUuid
      screen.meta = deviceInfo
      this._connectStore.updateScreen(deviceId, { serviceUuid, meta: deviceInfo })

      await wx.getBLEDeviceCharacteristics({ deviceId, serviceId: serviceUuid })
      _log('getBLEDeviceCharacteristics success')
      screen.status = ConnectStatus.Connected
      this._connectStore.updateScreen(deviceId, { status: ConnectStatus.Connected })

      // 阶段3. 设置 MTU（Android/HarmonyOS）
      if (deviceInfo?.system === ScreenSystem.Android || deviceInfo?.system === ScreenSystem.HarmonyOS) {
        _log('setBLEMTU begin')
        wx.setBLEMTU({
          deviceId,
          mtu: 512,
          success: () => {
            _log('setBLEMTU success (mtu=512)')
            this._screens.get(deviceId)!.mtu = 512
            this._connectStore.updateScreen(deviceId, { mtu: 512 })
          },
          fail: (err) => {
            _logError('setBLEMTU fail', err)
          },
        })
      }

      // 阶段4. 开启通知（复用 prepare() 中注册的全局监听器，无需 off/on）
      await wx.notifyBLECharacteristicValueChange({
        deviceId,
        serviceId: serviceUuid,
        characteristicId: MayScreenCharacteristicUuid.status,
        state: true,
      })
      await wx.notifyBLECharacteristicValueChange({
        deviceId,
        serviceId: serviceUuid,
        characteristicId: MayScreenCharacteristicUuid.read,
        state: true,
      })
      await wx.notifyBLECharacteristicValueChange({
        deviceId,
        serviceId: serviceUuid,
        characteristicId: MayScreenCharacteristicUuid.readLarge,
        state: true,
      })
      _log('notifyBLECharacteristicValueChange success')

      this._startWatchdog(deviceId)
      await this._sendCommandToDevice(deviceId, Command.Authorize, this._remoteNickName, true)
      wx.getBLEDeviceRSSI({
        deviceId,
        success: (rssiRes) => {
          this._connectStore.updateScreen(deviceId, { rssi: rssiRes.RSSI })
          this._sendCommandToDevice(deviceId, Command.Rssi, rssiRes.RSSI.toString(), true).catch(() => {})
        },
      })
    }
    catch (err) {
      this._screens.delete(deviceId)
      this._connectStore.removeScreen(deviceId)
      throw err
    }
  }

  public async disconnectDevice(deviceId: string): Promise<void> {
    this._stopWatchdog(deviceId)
    this._screens.delete(deviceId)
    this._connectStore.removeScreen(deviceId)
    await wx.closeBLEConnection({ deviceId }).catch((err) => {
      _toastError(err, '断开连接失败')
    })
  }

  public async disconnect(): Promise<void> {
    const deviceIds = [...this._screens.keys()]
    await Promise.all(deviceIds.map(id => this.disconnectDevice(id)))
  }

  // ── 监听器 ─────────────────────────────────────────────────────────────

  public setCommandListener(listener: (command: Command, payload: string) => void): void {
    this._commandListener = listener
  }

  public setLargeDataListener(listener: (data: string) => void): void {
    this._largeDataListener = listener
  }

  // ── 大数据重组（per-device buffer）────────────────────────────────────

  private _handleParseLargeData(deviceId: string, data: ArrayBuffer): void {
    const screen = this._screens.get(deviceId)
    if (!screen) return
    const info = parseLargeDataPacket(data)
    const sessionId = `${info.totalPackets}`

    if (info.currentIndex === 0) {
      screen.chunkBuffer.set(sessionId, [])
    }

    let targetSessionId = sessionId
    if (info.currentIndex > 0) {
      for (const [sid, chunks] of screen.chunkBuffer.entries()) {
        if (sid === sessionId && chunks.length === info.currentIndex) {
          targetSessionId = sid
          break
        }
      }
    }

    const chunks = screen.chunkBuffer.get(targetSessionId) || []
    chunks.push(data)
    screen.chunkBuffer.set(targetSessionId, chunks)
    this._transmitStore.onLargeDataChunk(info.currentIndex + 1, info.totalPackets)

    if (chunks.length === info.totalPackets) {
      try {
        const rawBytes = reassembleLargeDataRaw(chunks)
        const completeData = decompressPayload(rawBytes)
        screen.chunkBuffer.delete(targetSessionId)
        this._largeDataListener?.(completeData)
        this._transmitStore.onLargeDataComplete()
      }
      catch (error) {
        _logError('重组屏幕端数据失败:', error)
        screen.chunkBuffer.delete(targetSessionId)
      }
    }
  }

  // ── 数据发送 ───────────────────────────────────────────────────────────

  private _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async _sendChunk(
    deviceId: string,
    chunk: ArrayBuffer,
    maxRetries = 3,
    options: {
      largeData?: boolean
      silent?: boolean
    } = {},
  ): Promise<void> {
    const screen = this._screens.get(deviceId)
    if (!screen) throw new Error(`Device ${deviceId} not connected`)

    let retryCount = 0
    while (retryCount <= maxRetries) {
      try {
        await wx.writeBLECharacteristicValue({
          deviceId,
          serviceId: screen.serviceUuid,
          characteristicId: options.largeData
            ? MayScreenCharacteristicUuid.writeLarge
            : MayScreenCharacteristicUuid.write,
          writeType: 'write',
          value: chunk,
        })
        return
      }
      catch (err) {
        retryCount++
        if (retryCount > maxRetries) {
          _logError(`包发送失败，已重试 ${maxRetries} 次`, err)
          if (!options.silent) _toastError(err as any, '发送数据包失败')
          throw err
        }
        _log(`包发送失败，正在重试第 ${retryCount} 次...`)
        await this._delay(100)
      }
    }
  }

  private async _sendCommandToDevice(
    deviceId: string,
    command: Command,
    payload: string,
    silent = false,
  ): Promise<void> {
    const chunk = shortCommandToPacket(command, payload)
    await this._sendChunk(deviceId, chunk, 3, { silent })
  }

  /** 发送短指令（广播到所有已连接的 Screen） */
  public async sendCommand(command: Command, payload: string, silent = false): Promise<void> {
    const connected = [...this._screens.values()].filter(
      s => s.status === ConnectStatus.Connected && s.serviceUuid,
    )
    if (!connected.length) {
      const err = new Error('未连接设备')
      if (!silent) _toastError(err as any, '发送数据失败')
      throw err
    }
    const chunk = shortCommandToPacket(command, payload)
    _log(`sendCommand broadcast: ${Command[command] || 'unknown'} (${payload || null}) → ${connected.length} screens`)
    const results = await Promise.allSettled(
      connected.map(s => this._sendChunk(s.deviceId, chunk, 3, { silent })),
    )
    this._transmitStore.onCommandSent()
    const failures = results.filter(r => r.status === 'rejected')
    if (failures.length === connected.length) {
      throw (failures[0] as PromiseRejectedResult).reason
    }
  }

  /** 发送长指令（广播到所有已连接的 Screen，逐块并行） */
  public async sendLongCommand(command: Command, payload: any): Promise<void> {
    const connected = [...this._screens.values()].filter(
      s => s.status === ConnectStatus.Connected && s.serviceUuid,
    )
    if (!connected.length) {
      const err = new Error('未连接设备')
      _toastError(err as any, '发送数据失败')
      throw err
    }

    // 取所有已连接设备中的最小 MTU，确保分包后每台设备都能接收
    const effectiveMtu = Math.min(...connected.map(s => s.mtu))

    const envelope = JSON.stringify({ cmd: command, data: payload })
    let data: string | Uint8Array
    if (command === Command.ChangeSongData) {
      const bytes = new TextEncoder().encode(envelope)
      data = compressPayload(bytes)
    }
    else {
      data = envelope
    }

    wx.showToast({
      title: '数据传输中，请稍候...',
      icon: 'none',
    })
    const chunks = largeDataToChunks(data, { maxPacketSize: effectiveMtu })
    _log(`sendLargeData broadcast: ${chunks.length} chunks → ${connected.length} screens`)

    for (let i = 0; i < chunks.length; i++) {
      // 每块先并行发到所有设备，再发下一块
      await Promise.all(
        connected.map(s => this._sendChunk(s.deviceId, chunks[i], 3, { largeData: true })),
      )
      this._transmitStore.onLargeDataChunk(i + 1, chunks.length)
      _log(`sendLargeData chunk ${i + 1}/${chunks.length} sent to ${connected.length} screens`)
      if (i < chunks.length - 1) {
        await this._delay(20)
      }
    }
    this._transmitStore.onLargeDataComplete()
    _log('sendLargeData broadcast complete')
  }
}
