import { defineEnv } from '@vite-env/core'
import { z } from 'zod'

export default defineEnv({
  server: {
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(32),
    SSR_GREETING: z.string().default('rendered on the server'),
  },
  client: {
    VITE_API_URL: z.url(),
    VITE_APP_NAME: z.string().min(1),
  },
})
