import type { ScreenMeta } from '@/types/device'
import { ScreenDevice, ScreenSystem } from '@/types/device'

const _log = (...args: any[]) => {
  console.log('[UUID]', ...args)
}

const getDeviceEnum = (options: {
  deviceInfo: WechatMiniprogram.DeviceInfo
  screenMax: number
  screenMin: number
}): number => {
  const { deviceInfo, screenMax, screenMin } = options
  // 1-手机 2-平板 3-电脑
  // 根据 deviceInfo 判断
  if (deviceInfo.platform === 'mac' || deviceInfo.platform === 'windows') {
    return ScreenDevice.Computer
  }
  if (deviceInfo.model.includes('iPhone')) {
    return ScreenDevice.Phone
  }
  if (deviceInfo.model.includes('iPad')) {
    return ScreenDevice.Pad
  }
  // 根据屏幕尺寸判断
  const screenRatio = screenMin / screenMax
  if (screenRatio >= 0.6 && screenRatio <= 1) {
    return ScreenDevice.Pad
  }
  return ScreenDevice.Phone
}

/**
 * 生成 Service 的 UUID
 *
 * sendAdvertising 传输自定义数据有较多限制，因此使用 uuid 来传输信息
 */
export const generateServiceUuid = (): string => {
  // 将设备较为固定的信息封装为 uuid 格式的字符串
  // 结构：
  // 19970329-[deviceType(1)|system(1)|00]-[screenWidth(4)]-[screenHeight(4)]-[userId(12)]
  // 19970319: 固定值，便于根据前缀过滤为 Screen 设备
  // deviceType: 设备类型
  // system: 系统类型
  // 00: 占位符，用于后续扩展
  // screenMax: 屏幕分辨率，4位 16进制
  // screenMin: 屏幕分辨率，4位 16进制
  // userId: 用户id，12位 16进制

  const deviceInfo = wx.getDeviceInfo()
  const windowInfo = wx.getWindowInfo()
  const screenMax = Math.max(windowInfo.screenWidth, windowInfo.screenHeight)
  const screenMin = Math.min(windowInfo.screenWidth, windowInfo.screenHeight)
  _log('deviceInfo', deviceInfo)
  _log('windowInfo', windowInfo)

  const deviceEnum = getDeviceEnum({ deviceInfo, screenMax, screenMin })
  const systemMap = new Map([
    ['ios', ScreenSystem.iOS],
    ['android', ScreenSystem.Android],
    ['ohos', ScreenSystem.HarmonyOS],
    ['windows', ScreenSystem.Windows],
    ['mac', ScreenSystem.Mac],
  ])
  const systemEnum = systemMap.get(deviceInfo.platform) || ScreenSystem.Other

  const uuid = [
    '19970329',
    `${deviceEnum}${systemEnum}00`,
    `${screenMax.toString(16).padStart(4, '0').slice(0, 4)}`,
    `${screenMin.toString(16).padStart(4, '0').slice(0, 4)}`,
    '000000000000',
  ]
    .join('-')
    .toUpperCase()
  _log('generated uuid', uuid)
  return uuid
}

export const getDeviceInfoFromUuid = (
  uuid: string
): ScreenMeta | null => {
  const [_prefix, deviceInfo, screenMax, screenMin, _userId] = uuid.split('-')
  // 校验
  if (deviceInfo.length !== 4 || screenMax.length !== 4 || screenMin.length !== 4) {
    return null
  }
  if (_prefix !== '19970329') {
    return null
  }

  // 解析设备类型和系统类型
  const deviceType = Number.parseInt(deviceInfo.charAt(0), 10)
  const systemType = Number.parseInt(deviceInfo.charAt(1), 10)

  // 使用Map来映射设备类型到显示名称
  const deviceDisplayMap = new Map([
    [ScreenDevice.Phone, '手机'],
    [ScreenDevice.Pad, '平板'],
    [ScreenDevice.Computer, '电脑'],
  ])

  // 使用Map来映射系统类型到显示名称
  const systemDisplayMap = new Map([
    [ScreenSystem.iOS, 'iOS'],
    [ScreenSystem.Android, 'Android'],
    [ScreenSystem.HarmonyOS, '鸿蒙'],
    [ScreenSystem.Windows, 'Windows'],
    [ScreenSystem.Mac, 'Mac'],
    [ScreenSystem.Other, ''],
  ])

  const deviceDisplayName = deviceDisplayMap.get(deviceType) || '未知设备'
  const systemDisplayName = systemDisplayMap.get(systemType) || ''

  // 将16进制的屏幕尺寸转换为10进制
  const screenMaxNum = Number.parseInt(screenMax, 16)
  const screenMinNum = Number.parseInt(screenMin, 16)
  let displayName = [systemDisplayName, deviceDisplayName].filter(Boolean).join(' ')
  if (systemType === ScreenSystem.iOS && deviceType === ScreenDevice.Phone) {
    displayName = 'iPhone'
  } else if (systemType === ScreenSystem.iOS && deviceType === ScreenDevice.Pad) {
    displayName = 'iPad'
  } else if (systemType === ScreenSystem.Mac && deviceType === ScreenDevice.Computer) {
    displayName = 'Mac'
  }

  return {
    serviceUuid: uuid,
    device: deviceType as ScreenDevice,
    system: systemType as ScreenSystem,
    screenMax: screenMaxNum,
    screenMin: screenMinNum,
    displayName,
  }
}
