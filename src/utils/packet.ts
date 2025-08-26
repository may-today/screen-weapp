import TextEncoder from 'miniprogram-text-encoder'
import TextDecoder from 'miniprogram-text-decoder'

const MAX_DATA_SIZE = 20 // 每包最大字节数
const HEADER_SIZE = 4 // 协议头大小：2字节总包数 + 2字节当前包index
const MAX_PAYLOAD_SIZE = MAX_DATA_SIZE - HEADER_SIZE // 实际数据最大大小

/**
 * 将字符串拆分为多个ArrayBuffer包
 * @param input 输入字符串
 * @returns ArrayBuffer数组，每个包最大20字节
 */
export const toChunks = (input: string): ArrayBuffer[] => {
  if (!input) {
    return []
  }
  // 将字符串转换为UTF-8字节数组
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  // 计算需要的包数量
  const totalPackets = Math.ceil(data.length / MAX_PAYLOAD_SIZE)
  if (totalPackets > 65535) {
    throw new Error(`数据太大，最多支持${65535}个包`)
  }
  const chunks: ArrayBuffer[] = []
  for (let i = 0; i < totalPackets; i++) {
    // 计算当前包的数据起始和结束位置
    const start = i * MAX_PAYLOAD_SIZE
    const end = Math.min(start + MAX_PAYLOAD_SIZE, data.length)
    const payloadSize = end - start
    // 创建当前包的ArrayBuffer
    const packetSize = HEADER_SIZE + payloadSize
    const packet = new ArrayBuffer(packetSize)
    const view = new DataView(packet)
    // 写入协议头
    view.setUint16(0, totalPackets, false) // 总包数（大端序）
    view.setUint16(2, i, false) // 当前包index（大端序，从0开始）
    // 写入数据
    const packetData = new Uint8Array(packet, HEADER_SIZE)
    packetData.set(data.subarray(start, end))
    chunks.push(packet)
  }
  return chunks
}

/**
 * 解析单个包的信息（用于调试和验证）
 * @param packet ArrayBuffer包
 * @returns 包信息对象
 */
export const parsePacket = (
  packet: ArrayBuffer
): {
  totalPackets: number
  currentIndex: number
  data: Uint8Array
  dataString: string
} => {
  if (packet.byteLength < HEADER_SIZE) {
    throw new Error('包大小不足，无法解析协议头')
  }
  const view = new DataView(packet)
  const totalPackets = view.getUint16(0, false)
  const currentIndex = view.getUint16(2, false)
  const data = new Uint8Array(packet, HEADER_SIZE)
  // 将数据转换回字符串（用于调试）
  const decoder = new TextDecoder()
  const dataString = decoder.decode(data)
  return {
    totalPackets,
    currentIndex,
    data,
    dataString,
  }
}

/**
 * 重组多个包为原始字符串
 * @param packets ArrayBuffer数组
 * @returns 重组后的字符串
 */
export const reassemble = (packets: ArrayBuffer[]): string => {
  if (packets.length === 0) {
    return ''
  }
  // 按照包的index排序
  const sortedPackets = packets
    .map((packet) => ({ packet, info: parsePacket(packet) }))
    .sort((a, b) => a.info.currentIndex - b.info.currentIndex)
  // 验证包的完整性
  const totalPackets = sortedPackets[0].info.totalPackets
  if (sortedPackets.length !== totalPackets) {
    throw new Error(`包数量不匹配，期望${totalPackets}个，实际收到${sortedPackets.length}个`)
  }
  // 检查是否有遗漏的包
  for (let i = 0; i < totalPackets; i++) {
    if (sortedPackets[i].info.currentIndex !== i) {
      throw new Error(`缺少第${i}个包`)
    }
  }
  // 重组数据
  const totalDataSize = sortedPackets.reduce((sum, item) => sum + item.info.data.length, 0)
  const combinedData = new Uint8Array(totalDataSize)
  let offset = 0
  for (const item of sortedPackets) {
    combinedData.set(item.info.data, offset)
    offset += item.info.data.length
  }
  // 转换为字符串
  const decoder = new TextDecoder()
  return decoder.decode(combinedData)
}
