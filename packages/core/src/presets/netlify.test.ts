import { describe, expect, it } from 'vitest'
import { netlify } from './netlify'

describe('netlify preset', () => {
  describe('key presence', () => {
    it('has all required server keys', () => {
      const keys = Object.keys(netlify.server)
      expect(keys).toContain('NETLIFY')
      expect(keys).toContain('BUILD_ID')
      expect(keys).toContain('CONTEXT')
      expect(keys).toContain('DEPLOY_ID')
      expect(keys).toContain('DEPLOY_URL')
      expect(keys).toContain('DEPLOY_PRIME_URL')
      expect(keys).toContain('URL')
      expect(keys).toContain('BRANCH')
      expect(keys).toContain('COMMIT_REF')
    })

    it('has all optional server keys', () => {
      const keys = Object.keys(netlify.server)
      expect(keys).toContain('PULL_REQUEST')
      expect(keys).toContain('REVIEW_ID')
      expect(keys).toContain('REPOSITORY_URL')
      expect(keys).toContain('INCOMING_HOOK_TITLE')
      expect(keys).toContain('INCOMING_HOOK_URL')
    })
  })

  describe('schema validation', () => {
    it('nETLIFY accepts "true"', () => {
      expect(netlify.server.NETLIFY.safeParse('true').success).toBe(true)
    })

    it('nETLIFY rejects "1" (unlike Vercel which uses "1")', () => {
      expect(netlify.server.NETLIFY.safeParse('1').success).toBe(false)
    })

    it('cONTEXT accepts all four deployment contexts', () => {
      expect(netlify.server.CONTEXT.safeParse('production').success).toBe(true)
      expect(netlify.server.CONTEXT.safeParse('deploy-preview').success).toBe(true)
      expect(netlify.server.CONTEXT.safeParse('branch-deploy').success).toBe(true)
      expect(netlify.server.CONTEXT.safeParse('dev').success).toBe(true)
    })

    it('cONTEXT rejects unknown values', () => {
      expect(netlify.server.CONTEXT.safeParse('staging').success).toBe(false)
    })

    it('dEPLOY_URL accepts a full https:// URL', () => {
      expect(netlify.server.DEPLOY_URL.safeParse('https://deploy-abc123--mysite.netlify.app').success).toBe(true)
    })

    it('dEPLOY_URL rejects a bare hostname without scheme', () => {
      expect(netlify.server.DEPLOY_URL.safeParse('deploy-abc123--mysite.netlify.app').success).toBe(false)
    })

    it('pULL_REQUEST accepts "true"', () => {
      expect(netlify.server.PULL_REQUEST.safeParse('true').success).toBe(true)
    })

    it('pULL_REQUEST is absent without error (optional, not "false" on non-PR builds)', () => {
      expect(netlify.server.PULL_REQUEST.safeParse(undefined).success).toBe(true)
    })

    it('pULL_REQUEST rejects "false" (Netlify does not set this value)', () => {
      expect(netlify.server.PULL_REQUEST.safeParse('false').success).toBe(false)
    })

    it('iNCOMING_HOOK_URL accepts a full https:// URL when present', () => {
      expect(netlify.server.INCOMING_HOOK_URL.safeParse('https://api.netlify.com/hooks/abc').success).toBe(true)
    })

    it('iNCOMING_HOOK_URL is optional', () => {
      expect(netlify.server.INCOMING_HOOK_URL.safeParse(undefined).success).toBe(true)
    })
  })

  describe('placement invariants', () => {
    it('has no client field', () => {
      expect((netlify as any).client).toBeUndefined()
    })

    it('no server key starts with VITE_', () => {
      for (const key of Object.keys(netlify.server)) {
        expect(key.startsWith('VITE_')).toBe(false)
      }
    })
  })
})
