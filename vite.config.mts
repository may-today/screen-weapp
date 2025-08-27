import path from 'node:path'
import { TDesignResolver } from 'weapp-vite/auto-import-components/resolvers'
import { defineConfig } from 'weapp-vite/config'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'

export default defineConfig({
  weapp: {
    srcRoot: 'src',
    enhance: {
      autoImportComponents: {
        globs: ['components/**/*'],
        resolvers: [TDesignResolver()],
      },
    },
    // pnpm g 生成的格式
    // https://vite.icebreaker.top/guide/generate.html
    generate: {
      extensions: {
        js: 'ts',
        wxss: 'scss',
        json: 'jsonc',
      },
      dirs: {
        component: 'src/components',
        page: 'src/pages',
      },
      filenames: {
        component: 'index',
        page: 'index',
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api', 'import'],
      },
    },
  },
  plugins: [
    UnifiedViteWeappTailwindcssPlugin({
      rem2rpx: {
        // @ts-expect-error
        rootValue: 16,
        propList: ['*'],
        transformUnit: 'px',
      },
      tailwindcss: {
        // 显示声明用的是 tailwindcss v4
        version: 4,
        v4: {
          cssEntries: [
            // app.css 的路径
            path.resolve(import.meta.dirname, './src/app.css'),
          ],
        },
      },
    }),
  ],
})
