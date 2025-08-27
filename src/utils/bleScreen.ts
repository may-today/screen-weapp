import { appState, ConnectStatus } from '@/stores/appState'
import { MayScreenCharacteristicUuid, MayScreenServiceUuid, openBluetoothAdapter } from './ble'
import { reassemble, parsePacket } from './packet'

const _log = (...args: any[]) => {
  console.log('[BLE:Screen]', ...args)
}

const _logError = (...args: any[]) => {
  console.error('[BLE:Screen]', ...args)
}

export class BleScreen {
  private static _instance: BleScreen | null = null
  private _server: WechatMiniprogram.BLEPeripheralServer | null = null
  private _isAdvertising: boolean = false
  private _chunkBuffer: Map<string, ArrayBuffer[]> = new Map() // 缓冲区，key为sessionId，value为chunks数组

  public static getInstance(): BleScreen {
    if (!BleScreen._instance) {
      BleScreen._instance = new BleScreen()
    }
    return BleScreen._instance
  }

  public destroy() {
    wx.closeBluetoothAdapter()
    // 清理缓冲区
    this._chunkBuffer.clear()
    BleScreen._instance = null
    _log('destroy')
  }

  public async prepare(): Promise<void> {
    await openBluetoothAdapter('peripheral')
    const serverRes = await wx.createBLEPeripheralServer()
    const server = serverRes?.server
    if (!server) {
      throw new Error('createBLEPeripheralServer failed')
    }
    await Promise.all([this._prepareService(server), this._bindServiceListeners(server)])
    this._server = server
    this._bindConnectionListeners()
  }

  /** 为服务创建 Service 和 Characteristics */
  private async _prepareService(server: WechatMiniprogram.BLEPeripheralServer): Promise<void> {
    const buffer = new ArrayBuffer(2)
    const dataView = new DataView(buffer)
    dataView.setUint8(0, 0)
    dataView.setUint8(1, 0)
    return new Promise((resolve, reject) => {
      server.addService({
        service: {
          uuid: MayScreenServiceUuid,
          characteristics: [
            {
              uuid: MayScreenCharacteristicUuid.songId,
              properties: {
                read: true,
                write: true,
                notify: true,
              },
              permission: {
                readable: true,
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
      const info = parsePacket(res.value)
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
      chunks.push(res.value)
      this._chunkBuffer.set(targetSessionId, chunks)

      _log(`已接收包 ${info.currentIndex + 1}/${info.totalPackets}`)

      // 检查是否接收完所有包
      if (chunks.length === info.totalPackets) {
        try {
          // 重组完整数据
          const completeData = reassemble(chunks)
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
          deviceName: 'MayScreen1234567890',
          serviceUuids: [MayScreenServiceUuid],
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

  public async connectDevice(deviceId: string) {
    await wx.createBLEConnection({ deviceId, timeout: 10000 }).catch(async (e) => {})
  }
}
