/// <reference types="vite/client" />
/// <reference types="weapp-vite/client" />

// 保持 Vue 原生类型提示
declare module 'vue' {
  // 重新导出 Vue 的所有类型，保留原始定义
  export * from '@vue/runtime-core'
  export * from '@vue/runtime-dom'

  // 扩展小程序相关选项
  interface ComponentCustomOptions {
    options?: WechatMiniprogram.Component.ComponentOptions
  }
}
