import { defineEnv } from '@vite-env/core'
import { z } from 'zod'

export default defineEnv({
  server: {
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(32),
    DB_POOL_SIZE: z.coerce.number().int().default(10),
  },
  client: {
    VITE_API_URL: z.url(),
    VITE_APP_NAME: z.string().min(1),
    VITE_DEBUG: z.stringbool().default(false),
    VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    VITE_NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
})
