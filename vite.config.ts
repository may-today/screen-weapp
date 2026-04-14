import path from 'node:path'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
import { defineConfig } from 'weapp-vite/config'

export default defineConfig({
  weapp: {
    srcRoot: 'src',
    autoRoutes: true,
    autoImportComponents: true,
    generate: {
      extensions: {
        js: 'ts',
        wxss: 'css',
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
    json: {
      defaults: {
        component: {
          pureDataPattern: '/^_/',
          styleIsolation: 'apply-shared',
        },
      },
    },
    vue: {},
    worker: {
      entry: 'index.ts',
    },
  },
  plugins: [
    UnifiedViteWeappTailwindcssPlugin({
      rem2rpx: {
        rootValue: 16,
        propList: ['*'],
        transformUnit: 'px',
      },
      customAttributes: {
        '*': [/[A-Za-z-]*-class/],
      },
      tailwindcss: {
        version: 4,
        v4: {
          cssEntries: [path.resolve(import.meta.dirname, './src/app.css')],
        },
      },
    }),
  ],
})
