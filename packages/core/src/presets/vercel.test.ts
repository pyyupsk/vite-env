import { describe, expect, it } from 'vitest'
import { vercel } from './vercel'

describe('vercel preset', () => {
  describe('key presence', () => {
    it('has all required server keys', () => {
      const keys = Object.keys(vercel.server)
      expect(keys).toContain('VERCEL')
      expect(keys).toContain('VERCEL_ENV')
      expect(keys).toContain('VERCEL_URL')
      expect(keys).toContain('VERCEL_DEPLOYMENT_ID')
      expect(keys).toContain('VERCEL_PROJECT_PRODUCTION_URL')
    })

    it('has all optional server keys', () => {
      const keys = Object.keys(vercel.server)
      expect(keys).toContain('VERCEL_BRANCH_URL')
      expect(keys).toContain('VERCEL_REGION')
      expect(keys).toContain('VERCEL_GIT_PROVIDER')
      expect(keys).toContain('VERCEL_GIT_REPO_SLUG')
      expect(keys).toContain('VERCEL_GIT_REPO_OWNER')
      expect(keys).toContain('VERCEL_GIT_COMMIT_REF')
      expect(keys).toContain('VERCEL_GIT_COMMIT_SHA')
      expect(keys).toContain('VERCEL_GIT_COMMIT_MESSAGE')
      expect(keys).toContain('VERCEL_GIT_COMMIT_AUTHOR_LOGIN')
      expect(keys).toContain('VERCEL_GIT_PULL_REQUEST_ID')
      expect(keys).toContain('VERCEL_SKEW_PROTECTION_ENABLED')
    })
  })

  describe('schema validation', () => {
    it('VERCEL accepts "1"', () => {
      expect(vercel.server.VERCEL.safeParse('1').success).toBe(true)
    })

    it('VERCEL rejects values other than "1"', () => {
      expect(vercel.server.VERCEL.safeParse('0').success).toBe(false)
      expect(vercel.server.VERCEL.safeParse('true').success).toBe(false)
    })

    it('VERCEL_ENV accepts production, preview, development', () => {
      expect(vercel.server.VERCEL_ENV.safeParse('production').success).toBe(true)
      expect(vercel.server.VERCEL_ENV.safeParse('preview').success).toBe(true)
      expect(vercel.server.VERCEL_ENV.safeParse('development').success).toBe(true)
    })

    it('VERCEL_ENV rejects unknown values', () => {
      expect(vercel.server.VERCEL_ENV.safeParse('staging').success).toBe(false)
    })

    it('VERCEL_URL accepts a bare hostname', () => {
      expect(vercel.server.VERCEL_URL.safeParse('myapp-abc123.vercel.app').success).toBe(true)
    })

    it('VERCEL_URL rejects empty string', () => {
      expect(vercel.server.VERCEL_URL.safeParse('').success).toBe(false)
    })

    it('VERCEL_PROJECT_PRODUCTION_URL accepts a bare hostname', () => {
      expect(vercel.server.VERCEL_PROJECT_PRODUCTION_URL.safeParse('myapp.vercel.app').success).toBe(true)
    })

    it('VERCEL_PROJECT_PRODUCTION_URL rejects undefined (always set by Vercel)', () => {
      expect(vercel.server.VERCEL_PROJECT_PRODUCTION_URL.safeParse(undefined).success).toBe(false)
    })

    it('VERCEL_SKEW_PROTECTION_ENABLED is optional (accepts undefined)', () => {
      expect(vercel.server.VERCEL_SKEW_PROTECTION_ENABLED.safeParse(undefined).success).toBe(true)
    })

    it('VERCEL_SKEW_PROTECTION_ENABLED accepts "1"', () => {
      expect(vercel.server.VERCEL_SKEW_PROTECTION_ENABLED.safeParse('1').success).toBe(true)
    })

    it('VERCEL_GIT_PROVIDER accepts any string (not an enum)', () => {
      expect(vercel.server.VERCEL_GIT_PROVIDER.safeParse('github').success).toBe(true)
      expect(vercel.server.VERCEL_GIT_PROVIDER.safeParse('azure-devops').success).toBe(true)
    })
  })

  describe('placement invariants', () => {
    it('has no client field', () => {
      expect((vercel as any).client).toBeUndefined()
    })

    it('no server key starts with VITE_', () => {
      for (const key of Object.keys(vercel.server)) {
        expect(key.startsWith('VITE_')).toBe(false)
      }
    })
  })
})
