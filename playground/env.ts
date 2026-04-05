import { defineEnv, z } from '@vite-env/core'

export default defineEnv({
  server: {
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(32),
    DB_POOL_SIZE: z.coerce.number().int().min(1).max(100).default(10),
    REDIS_URL: z.url().optional(),
  },
  client: {
    VITE_API_URL: z.url(),
    VITE_APP_NAME: z.string().min(1),
    VITE_DEBUG: z.stringbool().default(false),
    VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  },
  shared: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
})
