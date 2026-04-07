import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { defineEnv, validateEnv } from './schema'

describe('defineEnv', () => {
  it('should return the definition unchanged when valid', () => {
    const def = {
      client: { VITE_API_URL: z.string() },
      server: { DB_URL: z.string() },
    }
    expect(defineEnv(def)).toEqual(def)
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
      client: { VITE_NODE_ENV: z.enum(['development', 'production']).default('development') },
    }
    const result = validateEnv(def, {})

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ VITE_NODE_ENV: 'development' })
  })

  it('should merge server and client schemas', () => {
    const def = {
      server: { SECRET: z.string() },
      client: { VITE_PUB: z.string(), VITE_MODE: z.string() },
    }
    const result = validateEnv(def, {
      SECRET: 'sec',
      VITE_PUB: 'pub',
      VITE_MODE: 'dev',
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ SECRET: 'sec', VITE_PUB: 'pub', VITE_MODE: 'dev' })
  })
})

describe('defineEnv with presets', () => {
  it('returns merged shape with presets key absent', () => {
    const preset = { server: { PRESET_VAR: z.string() } }
    const result = defineEnv({
      presets: [preset],
      server: { MY_VAR: z.string() },
    })
    expect(result.server).toHaveProperty('PRESET_VAR')
    expect(result.server).toHaveProperty('MY_VAR')
    expect(result).not.toHaveProperty('presets')
  })

  it('vITE_ prefix check catches non-prefixed key in a preset client field', () => {
    expect(() => defineEnv({
      presets: [{ client: { NO_PREFIX: z.string() } }],
    })).toThrow('[vite-env] Client env var "NO_PREFIX" must be prefixed with VITE_')
  })
})
