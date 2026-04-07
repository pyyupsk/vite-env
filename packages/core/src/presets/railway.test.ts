import { describe, expect, it } from 'vitest'
import { railway } from './railway'

describe('railway preset', () => {
  describe('key presence', () => {
    it('has all required server keys', () => {
      const keys = Object.keys(railway.server)
      expect(keys).toContain('RAILWAY_ENVIRONMENT_ID')
      expect(keys).toContain('RAILWAY_ENVIRONMENT_NAME')
      expect(keys).toContain('RAILWAY_SERVICE_ID')
      expect(keys).toContain('RAILWAY_SERVICE_NAME')
      expect(keys).toContain('RAILWAY_PROJECT_ID')
      expect(keys).toContain('RAILWAY_PROJECT_NAME')
      expect(keys).toContain('RAILWAY_DEPLOYMENT_ID')
    })

    it('has all optional server keys', () => {
      const keys = Object.keys(railway.server)
      expect(keys).toContain('RAILWAY_REPLICA_ID')
      expect(keys).toContain('RAILWAY_GIT_COMMIT_SHA')
      expect(keys).toContain('RAILWAY_GIT_BRANCH')
      expect(keys).toContain('RAILWAY_GIT_REPO_NAME')
      expect(keys).toContain('RAILWAY_GIT_REPO_OWNER')
      expect(keys).toContain('RAILWAY_PUBLIC_DOMAIN')
      expect(keys).toContain('RAILWAY_PRIVATE_DOMAIN')
      expect(keys).toContain('RAILWAY_TCP_PROXY_DOMAIN')
      expect(keys).toContain('RAILWAY_TCP_PROXY_PORT')
    })

    it('does not include PORT (generic name, excluded by design)', () => {
      expect(Object.keys(railway.server)).not.toContain('PORT')
    })
  })

  describe('schema validation', () => {
    it('rAILWAY_ENVIRONMENT_ID accepts a string', () => {
      expect(railway.server.RAILWAY_ENVIRONMENT_ID.safeParse('abc-123').success).toBe(true)
    })

    it('rAILWAY_ENVIRONMENT_ID rejects empty string', () => {
      expect(railway.server.RAILWAY_ENVIRONMENT_ID.safeParse('').success).toBe(false)
    })

    it('rAILWAY_TCP_PROXY_PORT coerces "3000" to 3000', () => {
      const result = railway.server.RAILWAY_TCP_PROXY_PORT.safeParse('3000')
      expect(result.success).toBe(true)
      if (result.success)
        expect(result.data).toBe(3000)
    })

    it('rAILWAY_TCP_PROXY_PORT is optional (accepts undefined)', () => {
      expect(railway.server.RAILWAY_TCP_PROXY_PORT.safeParse(undefined).success).toBe(true)
    })

    it('rAILWAY_TCP_PROXY_PORT rejects non-numeric strings', () => {
      expect(railway.server.RAILWAY_TCP_PROXY_PORT.safeParse('not-a-port').success).toBe(false)
    })
  })

  describe('placement invariants', () => {
    it('has no client field', () => {
      expect((railway as any).client).toBeUndefined()
    })

    it('no server key starts with VITE_', () => {
      for (const key of Object.keys(railway.server)) {
        expect(key.startsWith('VITE_')).toBe(false)
      }
    })
  })
})
