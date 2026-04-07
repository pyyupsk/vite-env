import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { defineEnv } from '../schema'
import { railway } from './railway'
import { vercel } from './vercel'

describe('defineEnv presets merge', () => {
  it('presets: [] is identical to no presets key', () => {
    const withEmpty = defineEnv({ presets: [], server: { FOO: z.string() } })
    const withNone = defineEnv({ server: { FOO: z.string() } })
    expect(Object.keys(withEmpty.server)).toEqual(Object.keys(withNone.server))
  })

  it('presets key is absent from the return value', () => {
    const result = defineEnv({ presets: [vercel], server: { MY_VAR: z.string() } })
    expect(result).not.toHaveProperty('presets')
  })

  it('preset server keys appear in the merged return', () => {
    const result = defineEnv({ presets: [vercel], server: { MY_VAR: z.string() } })
    expect(result.server).toHaveProperty('VERCEL_ENV')
    expect(result.server).toHaveProperty('MY_VAR')
  })

  it('user server field wins over preset field with same key', () => {
    const stricterSchema = z.string().min(10)
    const result = defineEnv({
      presets: [vercel],
      server: { VERCEL_URL: stricterSchema },
    })
    expect(result.server!.VERCEL_URL).toBe(stricterSchema)
  })

  it('warns when user field overrides a preset field', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    defineEnv({ presets: [vercel], server: { VERCEL_URL: z.string() } })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('VERCEL_URL'))
    warn.mockRestore()
  })

  it('warns when two presets share a key', () => {
    const duplicate = { server: { RAILWAY_ENVIRONMENT_ID: z.string() } }
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    defineEnv({ presets: [railway, duplicate] })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('RAILWAY_ENVIRONMENT_ID'))
    warn.mockRestore()
  })

  it('merges server keys from multiple presets', () => {
    const result = defineEnv({ presets: [vercel, railway] })
    expect(result.server).toHaveProperty('VERCEL_ENV')
    expect(result.server).toHaveProperty('RAILWAY_ENVIRONMENT_ID')
  })

  it('last preset wins when two presets share a key', () => {
    const first = { server: { SHARED: z.string().min(1) } }
    const second = { server: { SHARED: z.string().min(5) } }
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = defineEnv({ presets: [first, second] })
    warn.mockRestore()
    expect(result.server!.SHARED).toBe(second.server.SHARED)
  })

  it('throws when a preset client key lacks VITE_ prefix', () => {
    const badPreset = { client: { NO_PREFIX: z.string() } }
    expect(() => defineEnv({ presets: [badPreset] })).toThrow(
      '[vite-env] Client env var "NO_PREFIX" must be prefixed with VITE_',
    )
  })
})
