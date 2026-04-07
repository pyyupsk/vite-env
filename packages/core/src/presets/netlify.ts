import type { EnvPreset } from '../types'
import { z } from 'zod'

export const netlify = {
  server: {
    // Set to 'true' by Netlify to indicate a Netlify build (note: Vercel uses '1', not 'true')
    NETLIFY: z.enum(['true']),
    BUILD_ID: z.string().min(1),
    CONTEXT: z.enum(['production', 'deploy-preview', 'branch-deploy', 'dev']),
    DEPLOY_ID: z.string().min(1),
    // Full https:// URLs — z.url() is correct here unlike VERCEL_URL
    DEPLOY_URL: z.url(),
    DEPLOY_PRIME_URL: z.url(),
    URL: z.url(),
    BRANCH: z.string().min(1),
    COMMIT_REF: z.string().min(1),
    // Netlify sets this to 'true' on PR deploys; absent (not 'false') on non-PR builds
    PULL_REQUEST: z.enum(['true']).optional(),
    REVIEW_ID: z.string().optional(),
    REPOSITORY_URL: z.url().optional(),
    INCOMING_HOOK_TITLE: z.string().optional(),
    INCOMING_HOOK_URL: z.url().optional(),
  },
} satisfies EnvPreset
