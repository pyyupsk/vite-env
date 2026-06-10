import { defineEnv } from '@vite-env/core'
import { netlify } from '@vite-env/core/presets'
import { z } from 'zod'

export default defineEnv({
  presets: [netlify],
  server: {
    DATABASE_URL: z.url(),
  },
  client: {
    VITE_APP_NAME: z.string().min(1),
  },
})
