/**
 * Standard Schema-based env definition (alternative path).
 *
 * This demonstrates defineStandardEnv() with Valibot — any library
 * implementing the Standard Schema v1 spec works here.
 *
 * To use this instead of env.ts, run:
 *   VITE_ENV_CONFIG=env.standard.ts pnpm dev
 *
 * Or change configFile in vite.config.ts.
 */
import { defineStandardEnv } from '@vite-env/core'
import * as v from 'valibot'

export default defineStandardEnv({
  server: {
    DATABASE_URL: v.pipe(v.string(), v.url()),
    JWT_SECRET: v.pipe(v.string(), v.minLength(32)),
  },
  client: {
    VITE_API_URL: v.pipe(v.string(), v.url()),
    VITE_APP_NAME: v.pipe(v.string(), v.minLength(1)),
  },
})
