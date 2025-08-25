import { appState, ConnectStatus } from '@/stores/appState'
import { MayScreenCharacteristicUuid, MayScreenServiceUuid, openBluetoothAdapter } from './ble'

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

  public static getInstance(): BleScreen {
    if (!BleScreen._instance) {
      BleScreen._instance = new BleScreen()
    }
    return BleScreen._instance
  }

  public destroy() {
    wx.closeBluetoothAdapter()
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
      server.writeCharacteristicValue({
        serviceId: res.serviceId,
        characteristicId: res.characteristicId,
        value: res.value,
        needNotify: true,
        callbackId: res.callbackId,
        success: () => {
          _log('writeCharacteristicValue success', res.value)
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
          deviceName: 'MayScr',
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
