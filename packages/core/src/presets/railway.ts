import type { EnvPreset } from '../types'
import { z } from 'zod'

export const railway = {
  server: {
    RAILWAY_ENVIRONMENT_ID: z.string().min(1),
    RAILWAY_ENVIRONMENT_NAME: z.string().min(1),
    RAILWAY_SERVICE_ID: z.string().min(1),
    RAILWAY_SERVICE_NAME: z.string().min(1),
    RAILWAY_PROJECT_ID: z.string().min(1),
    RAILWAY_PROJECT_NAME: z.string().min(1),
    RAILWAY_DEPLOYMENT_ID: z.string().min(1),
    RAILWAY_REPLICA_ID: z.string().optional(),
    RAILWAY_GIT_COMMIT_SHA: z.string().optional(),
    RAILWAY_GIT_BRANCH: z.string().optional(),
    RAILWAY_GIT_REPO_NAME: z.string().optional(),
    RAILWAY_GIT_REPO_OWNER: z.string().optional(),
    RAILWAY_PUBLIC_DOMAIN: z.string().min(1).optional(),
    RAILWAY_PRIVATE_DOMAIN: z.string().min(1).optional(),
    RAILWAY_TCP_PROXY_DOMAIN: z.string().min(1).optional(),
    RAILWAY_TCP_PROXY_PORT: z.coerce.number().int().min(1).max(65535).optional(),
    // PORT excluded: generic name set by many tools independently; handle it in your own server config
  },
} satisfies EnvPreset
