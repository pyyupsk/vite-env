import { defineEnv } from '@vite-env/core'
import { z } from 'zod'

export default defineEnv({
  client: {
    VITE_REQUIRED_URL: z.url(),
    VITE_REQUIRED_NAME: z.string().min(1),
  },
})
