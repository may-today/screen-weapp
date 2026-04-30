import { icebreaker } from '@icebreakers/eslint-config'

export default icebreaker({
  miniProgram: true,
  vue: true,
  tailwindcss: {
    entryPoint: './src/app.css',
  },
  ignores: ['CHANGELOG.md', 'README.md', '.turbo/**', 'dist/**', '.weapp-vite/**'],
}, {
  files: ['src/**/*.{ts,vue}'],
  rules: {
    'better-tailwindcss/enforce-canonical-classes': 'off',
    'better-tailwindcss/enforce-consistent-class-order': 'off',
    'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
    'better-tailwindcss/no-conflicting-classes': 'off',
    'better-tailwindcss/no-unknown-classes': 'off',
    'antfu/top-level-function': 'off',
    'style/brace-style': ['error', '1tbs'],
    'intts/no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
  },
})
