import { appState, ConnectStatus } from '@/stores/appState'
import { openBluetoothAdapter, MayScreenServiceUuid, MayScreenCharacteristicUuid } from './ble'
import { toChunks } from './packet'
import type { BaseError } from './types'

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

export class BleRemote {
  private static _instance: BleRemote | null = null
  private _mtu: number = 20
  public static getInstance(): BleRemote {
    if (!BleRemote._instance) {
      BleRemote._instance = new BleRemote()
    }
    return BleRemote._instance
  }

  public destroy() {
    wx.closeBluetoothAdapter()
    BleRemote._instance = null
    _log('destroy')
  }

  public async prepare(): Promise<void> {
    await openBluetoothAdapter('central')
  }

  /** 开始扫描 Screen 设备 */
  public startScanning(onFound: (deviceList: WechatMiniprogram.BlueToothDevice[]) => void) {
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      services: [MayScreenServiceUuid],
      interval: 1000,
    }).catch((err) => {
      _toastError(err, '搜索设备失败')
      wx.hideNavigationBarLoading()
    })
    wx.onBluetoothDeviceFound((res) => {
      if (res.devices && res.devices.length > 0) {
        onFound(res.devices)
      }
    })
  }

  /** 停止扫描 Screen 设备 */
  public async stopScanning(): Promise<void> {
    await wx.stopBluetoothDevicesDiscovery()
  }

  /** 连接到某一个 Screen 设备 */
  public async connectDevice(deviceId: string): Promise<void> {
    appState.setConnectStatus(ConnectStatus.Connecting)
    wx.showLoading({
      title: '连接中',
    })
    await wx.createBLEConnection({ deviceId, timeout: 10000 }).catch(async (e) => {
      _toastError(e, '连接设备失败')
      wx.hideLoading()
    })
    appState.setConnectStatus(ConnectStatus.Connected)
    _log('createBLEConnection success')
    const servicesRes = await wx.getBLEDeviceServices({ deviceId })
    _log('getBLEDeviceServices success', servicesRes.services)
    const characteristicRes = await wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId: MayScreenServiceUuid,
    })
    _log('getBLEDeviceCharacteristics success', characteristicRes.characteristics)
    wx.hideLoading()
    // set MTU when connected
    wx.setBLEMTU({
      deviceId,
      mtu: 512,
      success: () => {
        _log('setBLEMTU success')
        this._mtu = 512
      },
      fail: (err) => {
        _logError('setBLEMTU fail', err)
      },
    })
  }

  /** 断开与 Screen 设备的连接 */
  public async disconnectDevice(deviceId: string): Promise<void> {
    await wx.closeBLEConnection({ deviceId }).catch((err) => {
      _toastError(err, '断开连接失败')
    })
    appState.setConnectStatus(ConnectStatus.Disconnected)
  }

  /** 延迟函数 */
  private _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /** 发送单个数据包，带重试机制 */
  private async _sendChunk(
    deviceId: string, 
    chunk: ArrayBuffer, 
    chunkIndex: number, 
    totalChunks: number,
    maxRetries: number = 3
  ): Promise<void> {
    let retryCount = 0
    
    while (retryCount <= maxRetries) {
      try {
        await wx.writeBLECharacteristicValue({
          deviceId,
          serviceId: MayScreenServiceUuid,
          characteristicId: MayScreenCharacteristicUuid.songId,
          writeType: 'write',
          value: chunk,
        })
        _log(`包 ${chunkIndex + 1}/${totalChunks} 发送成功`)
        return // 发送成功，退出重试循环
      } catch (err) {
        retryCount++
        if (retryCount > maxRetries) {
          _logError(`包 ${chunkIndex + 1}/${totalChunks} 发送失败，已重试 ${maxRetries} 次`, err)
          _toastError(err as any, `发送第 ${chunkIndex + 1} 个数据包失败`)
          throw err // 重新抛出错误，终止整个发送过程
        } else {
          _log(`包 ${chunkIndex + 1}/${totalChunks} 发送失败，正在重试第 ${retryCount} 次...`)
          await this._delay(100) // 重试前延迟100ms
        }
      }
    }
  }

  /** 发送数据 */
  public async sendData(deviceId: string, data: string): Promise<void> {
    const chunks = toChunks(data)
    _log(`sendData: ${data} (${chunks.length} chunks)`)
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      // 发送当前包（包含重试机制）
      await this._sendChunk(deviceId, chunk, i, chunks.length)      
      // 如果不是最后一个包，延迟100毫秒后发送下一个包
      if (i < chunks.length - 1) {
        await this._delay(100)
      }
    }
    _log('sendData success')
  }
}
