import process from 'node:process'
import ViteEnv from '@vite-env/core/plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    ViteEnv({
      // Use VITE_ENV_CONFIG env var to switch between Zod and Standard Schema demos.
      // Default: 'env.ts' (Zod). Run `pnpm dev:standard` to use 'env.standard.ts' (Valibot).
      configFile: process.env.VITE_ENV_CONFIG ?? './env.ts',

      // Environments allowed to import virtual:env/server.
      // Default is ['ssr']. The client environment is always blocked.
      serverEnvironments: ['ssr'],

      // What happens when client code imports virtual:env/server.
      // 'error' = hard build failure (recommended for production)
      // 'warn'  = log warning + exit code 1 (current default, changes to 'error' in 1.0.0)
      // 'stub'  = returns module that throws at runtime (for isomorphic imports)
      onClientAccessOfServerModule: 'warn',
    }),
  ],
})
