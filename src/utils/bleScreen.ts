import { appState } from '@/stores/appState'
import { MayScreenCharacteristicUuid, openBluetoothAdapter } from './ble'
import { reassembleLargeData, parseLargeDataPacket, parseShortPacket, shortCommandToPacket } from './packet'
import { generateServiceUuid } from './uuid'
import { type BaseError, Command, ConnectStatus } from '@/types'

const _log = (...args: any[]) => {
  console.log('[BLE:Screen]', ...args)
}

const _logError = (...args: any[]) => {
  console.error('[BLE:Screen]', ...args)
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

/** BLE Screen，指令接收端 */
export class BleScreen {
  private static _instance: BleScreen | null = null
  private _server: WechatMiniprogram.BLEPeripheralServer | null = null
  private _isAdvertising: boolean = false
  /** 缓冲区，key为sessionId，value为chunks数组 */
  private _chunkBuffer: Map<string, ArrayBuffer[]> = new Map()
  private _serviceUuid: string = ''
  private _mtu: number = 20
  private _remoteDeviceId: string = ''

  public static getInstance(): BleScreen {
    if (!BleScreen._instance) {
      BleScreen._instance = new BleScreen()
    }
    return BleScreen._instance
  }

  public destroy() {
    wx.closeBluetoothAdapter()
    this._chunkBuffer.clear()
    BleScreen._instance = null
    _log('destroy')
  }

  public async prepare(): Promise<void> {
    this._serviceUuid = generateServiceUuid()
    await openBluetoothAdapter('peripheral')
    const serverRes = await wx.createBLEPeripheralServer()
    const server = serverRes?.server
    if (!server) {
      throw new Error('createBLEPeripheralServer failed')
    }
    await Promise.all([
      this._prepareService(server, {
        uuid: this._serviceUuid,
      }),
      this._bindServiceListeners(server),
    ])
    this._server = server
    this._bindConnectionListeners()
  }

  /** 为服务创建 Service */
  private async _prepareService(
    server: WechatMiniprogram.BLEPeripheralServer,
    options: {
      uuid: string
    }
  ): Promise<void> {
    const buffer = new ArrayBuffer(2)
    const dataView = new DataView(buffer)
    dataView.setUint8(0, 0)
    dataView.setUint8(1, 0)
    return new Promise((resolve, reject) => {
      server.addService({
        service: {
          uuid: options.uuid,
          characteristics: [
            {
              uuid: MayScreenCharacteristicUuid.status,
              properties: {
                read: true,
                notify: true,
              },
              permission: {
                readable: true,
              },
              value: buffer,
            },
            {
              uuid: MayScreenCharacteristicUuid.read,
              properties: {
                read: true,
                notify: true,
              },
              permission: {
                readable: true,
              },
              value: buffer,
            },
            {
              uuid: MayScreenCharacteristicUuid.readLarge,
              properties: {
                read: true,
                notify: true,
              },
              permission: {
                readable: true,
              },
              value: buffer,
            },
            {
              uuid: MayScreenCharacteristicUuid.write,
              properties: {
                write: true,
                writeNoResponse: true,
              },
              permission: {
                writeable: true,
              },
              value: buffer,
            },
            {
              uuid: MayScreenCharacteristicUuid.writeLarge,
              properties: {
                write: true,
                writeNoResponse: true,
              },
              permission: {
                writeable: true,
              },
              value: buffer,
            },
          ],
        },
        success: () => {
          _log('addService success')
          resolve()
        },
        fail: (err) => {
          _logError('addService fail', err)
          reject(err)
        },
      })
    })
  }

  /** 为 Service 绑定监听器 */
  private async _bindServiceListeners(server: WechatMiniprogram.BLEPeripheralServer): Promise<void> {
    server.onCharacteristicWriteRequest((res) => {
      if (res.characteristicId === MayScreenCharacteristicUuid.write) {
        // 短指令
        const commandDetail = parseShortPacket(res.value)
        _log(`receiveCommand: ${Command[commandDetail.command] || 'unknown'} (${commandDetail.payload || null})`)
      } else if (res.characteristicId === MayScreenCharacteristicUuid.writeLarge) {
        // 长数据
        this._handleParseLargeData(res.value)
      } else {
        _logError('unknown characteristicId', res.characteristicId)
        return
      }

      // 响应客户端
      server.writeCharacteristicValue({
        serviceId: res.serviceId,
        characteristicId: res.characteristicId,
        value: res.value,
        needNotify: true,
        callbackId: res.callbackId,
        success: () => {
          _log('writeCharacteristicValue success')
        },
        fail: (err) => {
          _logError('writeCharacteristicValue fail', err)
        },
      })
    })
    server.onCharacteristicReadRequest((res) => {
      _log('received read request')
      server.writeCharacteristicValue({
        serviceId: res.serviceId,
        characteristicId: res.characteristicId,
        value: new Uint8Array([0, 0]),
        needNotify: true,
        callbackId: res.callbackId,
        success: () => {
          _log('writeCharacteristicValue success')
        },
        fail: (err) => {
          _logError('writeCharacteristicValue fail', err)
        },
      })
    })
    server.onCharacteristicSubscribed((res) => {
      _log('onCharacteristicSubscribed', res)
    })
    server.onCharacteristicUnsubscribed((res) => {
      _log('onCharacteristicUnsubscribed', res)
    })
  }

  /** 绑定连接监听器 */
  private async _bindConnectionListeners(): Promise<void> {
    wx.onBLEPeripheralConnectionStateChanged((res) => {
      _log(`connection state changed: ${res.connected}`)
      if (res.connected) {
        appState.setConnectStatus(ConnectStatus.Connected)
      } else {
        appState.setConnectStatus(ConnectStatus.Disconnected)
      }
    })
    wx.onBLEMTUChange((res) => {
      _log(`setBLEMTU success (mtu=${res.mtu})`)
      this._mtu = res.mtu
    })
  }

  private async _handleParseLargeData(data: ArrayBuffer): Promise<void> {
    const info = parseLargeDataPacket(data)
    _log(`总包数=${info.totalPackets}, 当前包=${info.currentIndex}, 数据="${info.dataString}"`)

    // 使用sessionId来区分不同的传输会话，这里简单使用totalPackets作为sessionId
    // 在实际应用中，可能需要更复杂的sessionId生成策略
    const sessionId = `${info.totalPackets}`

    // 如果是第一个包，初始化缓冲区
    if (info.currentIndex === 0) {
      this._chunkBuffer.set(sessionId, [])
      _log(`开始新的传输会话: ${sessionId}`)
    }

    // 查找对应的缓冲区（如果当前包不是第一个包，需要找到对应的session）
    let targetSessionId = sessionId
    if (info.currentIndex > 0) {
      // 查找匹配的session（根据totalPackets匹配）
      for (const [sid, chunks] of this._chunkBuffer.entries()) {
        if (sid === sessionId && chunks.length === info.currentIndex) {
          targetSessionId = sid
          break
        }
      }
    }

    // 将当前包添加到缓冲区
    const chunks = this._chunkBuffer.get(targetSessionId) || []
    chunks.push(data)
    this._chunkBuffer.set(targetSessionId, chunks)

    _log(`已接收包 ${info.currentIndex + 1}/${info.totalPackets}`)

    // 检查是否接收完所有包
    if (chunks.length === info.totalPackets) {
      try {
        // 重组完整数据
        const completeData = reassembleLargeData(chunks)
        _log('========== 完整数据接收完成 ==========')
        _log('重组后的完整数据:', completeData)
        _log('=====================================')

        // 清理缓冲区
        this._chunkBuffer.delete(targetSessionId)
        _log(`传输会话 ${targetSessionId} 完成，已清理缓冲区`)
      } catch (error) {
        _logError('重组数据失败:', error)
        // 清理失败的缓冲区
        this._chunkBuffer.delete(targetSessionId)
      }
    }
  }

  /** 开始广播，此时遥控器可以搜索到该设备 */
  public async startAdvertising(): Promise<void> {
    if (this._isAdvertising) {
      return
    }
    this._isAdvertising = true
    return new Promise((resolve, reject) => {
      if (!this._server) {
        reject(new Error('server not found'))
        return
      }
      this._server.startAdvertising({
        advertiseRequest: {
          connectable: true,
          deviceName: 'MAYSCRN',
          serviceUuids: [this._serviceUuid],
        },
        success: () => {
          _log('startAdvertising success')
          resolve()
        },
        fail: (err) => {
          this._isAdvertising = false
          _logError('startAdvertising fail', err)
          reject(err)
        },
      })
    })
  }

  /** 停止广播 */
  public async stopAdvertising(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this._server) {
        reject(new Error('server not found'))
        return
      }
      this._server.stopAdvertising({
        success: () => {
          _log('stopAdvertising success')
          resolve()
        },
        fail: (err) => {
          _logError('stopAdvertising fail', err)
          reject(err)
        },
        complete: () => {
          this._isAdvertising = false
        },
      })
    })
  }

  /** 延迟函数 */
  private _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /** 发送单个数据包，带重试机制 */
  private async _sendChunk(
    deviceId: string,
    chunk: ArrayBuffer,
    maxRetries: number = 3,
  ): Promise<void> {
    let retryCount = 0

    while (retryCount <= maxRetries) {
      try {
        await wx.writeBLECharacteristicValue({
          deviceId,
          serviceId: this._serviceUuid,
          characteristicId: MayScreenCharacteristicUuid.read,
          writeType: 'write',
          value: chunk,
        })
        return // 发送成功，退出重试循环
      } catch (err) {
        retryCount++
        if (retryCount > maxRetries) {
          _logError(`包发送失败，已重试 ${maxRetries} 次`, err)
          _toastError(err as any, `发送数据包失败`)
          throw err // 重新抛出错误，终止整个发送过程
        } else {
          _log(`包发送失败，正在重试第 ${retryCount} 次...`)
          await this._delay(100) // 重试前延迟100ms
        }
      }
    }
  }

  /** 发送短指令 */
  public async sendCommand(deviceId: string, command: Command, payload: string): Promise<void> {
    const chunks = shortCommandToPacket(command, payload)
    _log(`sendCommand: ${Command[command] || 'unknown'} (${payload || null})`)
    await this._sendChunk(deviceId, chunks)
  }
}
