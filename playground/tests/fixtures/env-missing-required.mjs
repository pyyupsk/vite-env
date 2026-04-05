import { defineEnv, z } from '@vite-env/core'

export default defineEnv({
  client: {
    VITE_REQUIRED_URL: z.url(),
    VITE_REQUIRED_NAME: z.string().min(1),
  },
})
