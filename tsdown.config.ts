import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    clean: true,
    dts: true,
    entry: ['src/index.ts'],
    platform: 'neutral',
  },
  {
    clean: true,
    dts: true,
    entry: ['src/fs.ts'],
    platform: 'node',
  },
])
