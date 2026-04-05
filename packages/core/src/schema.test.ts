import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { defineEnv, validateEnv } from './schema'

describe('defineEnv', () => {
  it('should return the definition unchanged when valid', () => {
    const def = {
      client: { VITE_API_URL: z.string() },
      server: { DB_URL: z.string() },
    }
    expect(defineEnv(def)).toBe(def)
  })

  it('should throw when client key lacks VITE_ prefix', () => {
    expect(() => defineEnv({
      client: { API_URL: z.string() },
    })).toThrow('[vite-env] Client env var "API_URL" must be prefixed with VITE_')
  })

  it('should allow server keys without VITE_ prefix', () => {
    expect(() => defineEnv({
      server: { DATABASE_URL: z.string() },
    })).not.toThrow()
  })

  it('should allow shared keys without VITE_ prefix', () => {
    expect(() => defineEnv({
      shared: { NODE_ENV: z.string() },
    })).not.toThrow()
  })

  it('should handle empty definition', () => {
    expect(defineEnv({})).toEqual({})
  })
})

describe('validateEnv', () => {
  it('should validate successfully with matching env', () => {
    const def = {
      server: { DB_URL: z.url() },
      client: { VITE_APP: z.string() },
    }
    const result = validateEnv(def, {
      DB_URL: 'https://db.example.com',
      VITE_APP: 'my-app',
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      DB_URL: 'https://db.example.com',
      VITE_APP: 'my-app',
    })
    expect(result.errors).toEqual([])
  })

  it('should fail when required vars are missing', () => {
    const def = {
      client: { VITE_API_URL: z.url() },
    }
    const result = validateEnv(def, {})

    expect(result.success).toBe(false)
    expect(result.data).toBeNull()
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should handle optional vars', () => {
    const def = {
      client: { VITE_OPT: z.string().optional() },
    }
    const result = validateEnv(def, {})

    expect(result.success).toBe(true)
  })

  it('should handle defaults', () => {
    const def = {
      shared: { NODE_ENV: z.enum(['development', 'production']).default('development') },
    }
    const result = validateEnv(def, {})

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ NODE_ENV: 'development' })
  })

  it('should merge server, client, and shared schemas', () => {
    const def = {
      server: { SECRET: z.string() },
      client: { VITE_PUB: z.string() },
      shared: { MODE: z.string() },
    }
    const result = validateEnv(def, {
      SECRET: 'sec',
      VITE_PUB: 'pub',
      MODE: 'dev',
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ SECRET: 'sec', VITE_PUB: 'pub', MODE: 'dev' })
  })
})
