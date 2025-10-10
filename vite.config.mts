import path from 'node:path'
import { defineConfig } from 'weapp-vite/config'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'

export default defineConfig({
  weapp: {
    srcRoot: 'src',
    enhance: {
      autoImportComponents: {
        globs: ['components/**/*'],
        resolvers: [],
      },
    },
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
    worker: {
      entry: 'index.ts',
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
        rootValue: 16,
        propList: ['*'],
        transformUnit: 'px',
      },
      customAttributes: {
        '*': [ /[A-Za-z-]*-class/ ]
      },
      inlineWxs: true,
      wxsMatcher: (filename) => filename.endsWith('.wxs'),
      tailwindcss: {
        version: 4,
        v4: {
          cssEntries: [
            path.resolve(import.meta.dirname, './src/app.css'),
          ],
        },
      },
    }),
  ],
})
