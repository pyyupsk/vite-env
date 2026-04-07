import type { EnvPreset } from '../types'
import { z } from 'zod'

export const vercel = {
  server: {
    // Set to '1' by Vercel to indicate a Vercel environment
    VERCEL: z.enum(['1']),
    VERCEL_ENV: z.enum(['production', 'preview', 'development']),
    // Bare hostname (e.g. myapp-abc123.vercel.app) — no scheme, z.url() would reject it
    VERCEL_URL: z.string().min(1),
    VERCEL_BRANCH_URL: z.string().min(1).optional(),
    VERCEL_PROJECT_PRODUCTION_URL: z.string().min(1),
    VERCEL_DEPLOYMENT_ID: z.string().min(1),
    VERCEL_REGION: z.string().optional(),
    // z.string() not enum — Vercel may add providers (Azure DevOps, self-hosted GitLab) without notice
    VERCEL_GIT_PROVIDER: z.string().optional(),
    VERCEL_GIT_REPO_SLUG: z.string().optional(),
    VERCEL_GIT_REPO_OWNER: z.string().optional(),
    VERCEL_GIT_COMMIT_REF: z.string().optional(),
    VERCEL_GIT_COMMIT_SHA: z.string().optional(),
    VERCEL_GIT_COMMIT_MESSAGE: z.string().optional(),
    VERCEL_GIT_COMMIT_AUTHOR_LOGIN: z.string().optional(),
    VERCEL_GIT_PULL_REQUEST_ID: z.string().optional(),
    VERCEL_SKEW_PROTECTION_ENABLED: z.enum(['1']).optional(),
  },
} satisfies EnvPreset
