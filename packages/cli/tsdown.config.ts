import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  deps: {
    neverBundle: ['jiti', 'vite', 'zod', '@vite-env/core'],
  },
})
