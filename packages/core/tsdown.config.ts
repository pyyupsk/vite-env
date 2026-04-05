import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/plugin.ts',
    'src/schema.ts',
    'src/format.ts',
    'src/dts.ts',
    'src/leak.ts',
  ],
  format: ['esm'],
  dts: true,
  exports: true,
  clean: true,
  deps: {
    neverBundle: ['vite', 'zod'],
  },
})
