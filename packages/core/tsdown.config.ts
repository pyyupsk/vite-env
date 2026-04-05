import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/config.ts',
    'src/plugin.ts',
    'src/schema.ts',
    'src/format.ts',
    'src/dts.ts',
    'src/leak.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  exports: true,
  clean: true,
  sourcemap: true,
  deps: {
    neverBundle: ['jiti', 'vite', 'zod'],
  },
})
