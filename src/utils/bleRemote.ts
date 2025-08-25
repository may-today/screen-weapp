import { appState, ConnectStatus } from '@/stores/appState'
import { openBluetoothAdapter, MayScreenServiceUuid, MayScreenCharacteristicUuid } from './ble'
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
  }

  /** 断开与 Screen 设备的连接 */
  public async disconnectDevice(deviceId: string): Promise<void> {
    await wx.closeBLEConnection({ deviceId }).catch((err) => {
      _toastError(err, '断开连接失败')
    })
    appState.setConnectStatus(ConnectStatus.Disconnected)
  }

  /** 发送数据 */
  public async sendData(deviceId: string, data: string): Promise<void> {
    const buffer = new ArrayBuffer(2)
    const dataView = new DataView(buffer)
    dataView.setUint8(0, (Math.random() * 255) | 0)
    dataView.setUint8(1, (Math.random() * 255) | 0)
    // TODO: 超过 20 字节的数据需要分包发送
    await wx.writeBLECharacteristicValue({
      deviceId,
      serviceId: MayScreenServiceUuid,
      characteristicId: MayScreenCharacteristicUuid.songId,
      // value: new TextEncoder().encode(data).buffer,
      value: buffer,
    }).catch((err) => {
      _toastError(err, '发送数据失败')
    })
    _log('writeBLECharacteristicValue success')
  }
}
