import { defineEnv } from '@vite-env/core'
import { railway } from '@vite-env/core/presets'
import { z } from 'zod'

export default defineEnv({
  presets: [railway],
  server: {
    DATABASE_URL: z.url(),
  },
  client: {
    VITE_APP_NAME: z.string().min(1),
  },
})
