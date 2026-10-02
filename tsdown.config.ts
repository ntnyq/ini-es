import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    clean: true,
    dts: {
      generator: 'tsgo',
    },
    entry: ['src/index.ts'],
    platform: 'neutral',
  },
  {
    clean: true,
    dts: {
      generator: 'tsgo',
    },
    entry: ['src/fs.ts'],
    platform: 'node',
  },
])
