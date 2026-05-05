import type { UserConfig } from 'weapp-vite/config'
import path from 'node:path'
import { weappTailwindcss } from 'weapp-tailwindcss/vite'
import { defineConfig } from 'weapp-vite/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  weapp: {
    srcRoot: 'src',
    worker: {
      entry: 'index.ts',
    },
    autoRoutes: true,
    autoImportComponents: {
      htmlCustomData: true,
      typedComponents: true,
      vueComponents: false,
      vueComponentsModule: 'wevu',
    },
    wevu: {
      defaults: {
        component: {
          options: {
            virtualHost: true,
            styleIsolation: 'apply-shared',
          },
        },
      },
    },
    // pnpm g 生成的格式
    // https://vite.icebreaker.top/guide/generate.html
    generate: {
      extensions: {
        js: 'ts',
        wxss: 'scss',
      },
      dirs: {
        component: 'src/components',
        page: 'src/pages',
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
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api', 'import'],
      },
    },
  },
  plugins: [
    weappTailwindcss({
      rem2rpx: {
        rootValue: 16,
        propList: ['*'],
        transformUnit: 'px',
      },
      cssEntries: [path.resolve(import.meta.dirname, 'src/app.css')],
    }),
  ],
} satisfies UserConfig)
