import { useConnectStore } from '@/stores/connect'
import { useTransmitStore } from '@/stores/transmit'
import { type BaseError, type SongDetail, Command } from '@/types'
import { ConnectStatus } from '@/types/connect'
import { ScreenSystem } from '@/types/device'
import { MayScreenCharacteristicUuid, openBluetoothAdapter } from './ble'
import { largeDataToChunks, parseLargeDataPacket, parseShortPacket, reassembleLargeData, shortCommandToPacket } from './packet'
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
  private _screenDeviceId = ''
  private _screenServiceUuid = ''
  private _mtu = 20
  private _connectStore = useConnectStore()
  private _transmitStore = useTransmitStore()
  private _lastHeartbeatAt = 0
  private _watchdogTimer: ReturnType<typeof setInterval> | null = null
  private _reconnectRetryCount = 0
  private _commandListener: ((command: Command, payload: string) => void) | null = null
  private _largeDataListener: ((data: string) => void) | null = null
  private readonly _screenChunkBuffer: Map<string, ArrayBuffer[]> = new Map()
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

  private _startWatchdog(): void {
    this._stopWatchdog()
    this._lastHeartbeatAt = Date.now()
    this._watchdogTimer = setInterval(() => {
      if (Date.now() - this._lastHeartbeatAt > BleRemote._HEARTBEAT_TIMEOUT) {
        _log('heartbeat timeout, reconnecting...')
        this._stopWatchdog()
        this._handleReconnect()
      }
    }, 3000)
  }

  private _stopWatchdog(): void {
    if (this._watchdogTimer) {
      clearInterval(this._watchdogTimer)
      this._watchdogTimer = null
      this._lastHeartbeatAt = 0
      this._reconnectRetryCount = 0
    }
  }

  private async _handleReconnect(): Promise<void> {
    this._connectStore.setRssi(null)
    if (!this._screenDeviceId || this._reconnectRetryCount >= BleRemote._RECONNECT_MAX_RETRIES) {
      _logError('reconnect exhausted, giving up')
      this._connectStore.setConnectStatus(ConnectStatus.Disconnected)
      this._screenDeviceId = ''
      this._screenServiceUuid = ''
      return
    }
    this._reconnectRetryCount++
    _log(`reconnect attempt ${this._reconnectRetryCount}/${BleRemote._RECONNECT_MAX_RETRIES}`)
    const deviceId = this._screenDeviceId
    try {
      await wx.closeBLEConnection({ deviceId }).catch(() => {})
      await this._delay(2000)
      await this.connectDevice(deviceId)
      _log('reconnect success')
    } catch (err) {
      _logError('reconnect failed', err)
      await this._handleReconnect()
    }
  }

  public destroy() {
    this._stopWatchdog()
    wx.closeBluetoothAdapter()
    this._commandListener = null
    this._largeDataListener = null
    this._screenChunkBuffer.clear()
    BleRemote._instance = null
    this._connectStore.setConnectStatus(ConnectStatus.Disabled)
    _log('destroy')
  }

  public setCommandListener(listener: (command: Command, payload: string) => void): void {
    this._commandListener = listener
  }

  public setLargeDataListener(listener: (data: string) => void): void {
    this._largeDataListener = listener
  }

  /** 处理来自屏幕端的长数据包（与 BleScreen._handleParseLargeData 对称） */
  private _handleParseLargeData(data: ArrayBuffer): void {
    const info = parseLargeDataPacket(data)
    const sessionId = `${info.totalPackets}`

    if (info.currentIndex === 0) {
      this._screenChunkBuffer.set(sessionId, [])
    }

    let targetSessionId = sessionId
    if (info.currentIndex > 0) {
      for (const [sid, chunks] of this._screenChunkBuffer.entries()) {
        if (sid === sessionId && chunks.length === info.currentIndex) {
          targetSessionId = sid
          break
        }
      }
    }

    const chunks = this._screenChunkBuffer.get(targetSessionId) || []
    chunks.push(data)
    this._screenChunkBuffer.set(targetSessionId, chunks)
    this._transmitStore.onLargeDataChunk(info.currentIndex + 1, info.totalPackets)

    if (chunks.length === info.totalPackets) {
      try {
        const completeData = reassembleLargeData(chunks)
        this._screenChunkBuffer.delete(targetSessionId)
        this._largeDataListener?.(completeData)
        this._transmitStore.onLargeDataComplete()
      } catch (error) {
        _logError('重组屏幕端数据失败:', error)
        this._screenChunkBuffer.delete(targetSessionId)
      }
    }
  }

  public async prepare(): Promise<void> {
    await openBluetoothAdapter('central')
    this._connectStore.setConnectStatus(ConnectStatus.Disconnected)
  }

  /** 开始扫描 Screen 设备 */
  public startScanning(onFound: (deviceList: WechatMiniprogram.BlueToothDevice[]) => void) {
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      // services: [MayScreenServiceUuid],
      interval: 2000,
    }).catch((err) => {
      _toastError(err, '搜索设备失败')
      wx.hideNavigationBarLoading()
    })
    wx.onBluetoothDeviceFound((res) => {
      // console.log('onBluetoothDeviceFound', res)
      if (res.devices !== undefined) {
        const filteredDevices = res.devices
          .filter((device) => {
            if (!device.name) {
              return false
            }
            if (device.advertisServiceUUIDs?.length !== 1) {
              return false
            }
            if (!device.advertisServiceUUIDs[0].startsWith('19970329-')) {
              return false
            }
            return true
          })
          .sort((a, b) => b.RSSI - a.RSSI)
        onFound(filteredDevices)
      }
    })
  }

  /** 停止扫描 Screen 设备 */
  public async stopScanning(): Promise<void> {
    await wx.stopBluetoothDevicesDiscovery()
  }

  /** 连接到某一个 Screen 设备 */
  public async connectDevice(deviceId: string): Promise<void> {
    // 阶段1. 建立连接
    this._connectStore.setConnectStatus(ConnectStatus.Connecting)
    await wx.createBLEConnection({ deviceId, timeout: 10_000 }).catch(async (e) => {
      _toastError(e, '连接设备失败')
      // wx.hideLoading()
      throw e
    })
    _log('createBLEConnection success')

    // 阶段2. 前期数据交换、授权阶段
    this._connectStore.setConnectStatus(ConnectStatus.Authorizing)
    const servicesRes = await wx.getBLEDeviceServices({ deviceId })
    _log('getBLEDeviceServices success', servicesRes.services)
    const serviceUuid = servicesRes.services.find((service) => service.uuid.startsWith('19970329-'))?.uuid
    if (!serviceUuid) {
      throw new Error('服务UUID不存在')
    }
    _log(`screen serviceUuid: ${serviceUuid}`)
    const deviceInfo = getDeviceInfoFromUuid(serviceUuid)
    _log(`screen deviceInfo: ${JSON.stringify(deviceInfo)}`)
    this._screenServiceUuid = serviceUuid
    this._screenDeviceId = deviceId
    this._connectStore.setCurrentScreenMeta(deviceInfo)
    const characteristicRes = await wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId: serviceUuid,
    })
    _log('getBLEDeviceCharacteristics success', characteristicRes.characteristics)
    // await this._delay(1000)
    this._connectStore.setConnectStatus(ConnectStatus.Connected)

    // 阶段3. 设置 MTU
    if (deviceInfo?.system === ScreenSystem.Android || deviceInfo?.system === ScreenSystem.HarmonyOS) {
      _log('setBLEMTU begin')
      wx.setBLEMTU({
        deviceId,
        mtu: 512,
        success: () => {
          _log('setBLEMTU success (mtu=512)')
          this._mtu = 512
        },
        fail: (err) => {
          _logError('setBLEMTU fail', err)
        },
      })
    }

    // 阶段4. 监听 notify 特征值
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
    wx.offBLECharacteristicValueChange()
    this._startWatchdog()
    wx.onBLECharacteristicValueChange((res) => {
      if (res.characteristicId === MayScreenCharacteristicUuid.status) {
        const value = new Uint8Array(res.value)
        this._lastHeartbeatAt = Date.now()
        _log('heartbeat received', value)
        if (value[0] === 0x01) {
          this._transmitStore.onCommandReceived()
          // if (this._connectStore.connectStatus.value !== ConnectStatus.Authorizing) {
            this._connectStore.setConnectStatus(ConnectStatus.Connected)
          // }
          wx.getBLEDeviceRSSI({
            deviceId: this._screenDeviceId,
            success: (rssiRes) => {
              this._connectStore.setRssi(rssiRes.RSSI)
              this.sendCommand(Command.Rssi, rssiRes.RSSI.toString(), true).catch(() => {})
            },
          })
        } else {
          this._connectStore.setConnectStatus(ConnectStatus.Disconnected)
        }
      } else if (res.characteristicId === MayScreenCharacteristicUuid.read) {
        const cmd = parseShortPacket(res.value)
        _log(`command from screen: ${Command[cmd.command] || 'unknown'} (${cmd.payload || null})`)
        if (cmd.command === Command.ReplyAuthorize) {
          this._connectStore.setConnectStatus(ConnectStatus.Connected)
        }
        this._commandListener?.(cmd.command, cmd.payload)
        this._transmitStore.onCommandReceived()
      } else if (res.characteristicId === MayScreenCharacteristicUuid.readLarge) {
        this._handleParseLargeData(res.value)
      }
    })
    await this.sendCommand(Command.Authorize, this._remoteNickName, true)
    wx.getBLEDeviceRSSI({
      deviceId,
      success: (rssiRes) => {
        this._connectStore.setRssi(rssiRes.RSSI)
        this.sendCommand(Command.Rssi, rssiRes.RSSI.toString(), true).catch(() => {})
      },
    })
  }

  /** 断开与 Screen 设备的连接 */
  public async disconnectDevice(deviceId: string): Promise<void> {
    this._stopWatchdog()
    this._screenDeviceId = ''
    this._screenServiceUuid = ''
    this._connectStore.setRssi(null)
    await wx.closeBLEConnection({ deviceId }).catch((err) => {
      _toastError(err, '断开连接失败')
    })
    this._connectStore.setConnectStatus(ConnectStatus.Disconnected)
  }

  /** 断开当前已连接的 Screen 设备 */
  public async disconnect(): Promise<void> {
    if (!this._screenDeviceId) return
    await this.disconnectDevice(this._screenDeviceId)
    this._screenDeviceId = ''
    this._screenServiceUuid = ''
  }

  /** 延迟函数 */
  private _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /** 发送单个数据包，带重试机制 */
  private async _sendChunk(
    deviceId: string,
    chunk: ArrayBuffer,
    maxRetries = 3,
    options: {
      largeData?: boolean
      silent?: boolean
    } = {}
  ): Promise<void> {
    let retryCount = 0

    while (retryCount <= maxRetries) {
      try {
        await wx.writeBLECharacteristicValue({
          deviceId,
          serviceId: this._screenServiceUuid,
          characteristicId: options.largeData
            ? MayScreenCharacteristicUuid.writeLarge
            : MayScreenCharacteristicUuid.write,
          writeType: 'write',
          value: chunk,
        })
        return
      } catch (err) {
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

  /** 发送长数据 */
  public async sendLargeData(data: string): Promise<void> {
    // 前置判断
    if (!this._screenDeviceId || !this._screenServiceUuid) {
      const err = new Error('未连接设备')
      _toastError(err as any, '发送数据失败')
      throw err
    }
    // 前置提示-数据过大需等待
    wx.showToast({
      title: '数据传输中，请稍候...',
      icon: 'none',
    })
    const chunks = largeDataToChunks(data, { maxPacketSize: this._mtu })
    _log(`sendLargeData: ${data} (${chunks.length} chunks)`)
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      // 发送当前包（包含重试机制）
      await this._sendChunk(this._screenDeviceId, chunk, 3, {
        largeData: true,
      })
      this._transmitStore.onLargeDataChunk(i + 1, chunks.length)
      _log(`sendLargeData success, chunk ${i + 1}/${chunks.length}`)
      // 如果不是最后一个包，延迟100毫秒后发送下一个包
      if (i < chunks.length - 1) {
        await this._delay(100)
      }
    }
    this._transmitStore.onLargeDataComplete()
    _log('sendLargeData success')
  }

  /** 发送完整歌曲数据（长数据指令） */
  public async sendSongData(song: SongDetail): Promise<void> {
    const envelope = JSON.stringify({ cmd: Command.ChangeSongData, data: song })
    await this.sendLargeData(envelope)
  }

  /** 发送短指令 */
  public async sendCommand(command: Command, payload: string, silent = false): Promise<void> {
    // 前置判断
    if (!this._screenDeviceId || !this._screenServiceUuid) {
      const err = new Error('未连接设备')
      _toastError(err as any, '发送数据失败')
      throw err
    }
    const chunks = shortCommandToPacket(command, payload)
    _log(`sendCommand: ${Command[command] || 'unknown'} (${payload || null})`)
    await this._sendChunk(this._screenDeviceId, chunks, 3, { silent })
    this._transmitStore.onCommandSent()
  }
}
