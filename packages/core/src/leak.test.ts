import { describe, expect, it } from 'vitest'
import { detectServerLeak } from './leak'

describe('detectServerLeak', () => {
  it('should detect server values in client chunks', () => {
    const def = {
      server: { SECRET_KEY: {} as any },
      client: { VITE_PUB: {} as any },
    }
    const data = {
      SECRET_KEY: 'super-secret-value-here',
      VITE_PUB: 'public',
    }
    const bundle = {
      'main.js': { type: 'chunk', code: 'const x = "super-secret-value-here"' },
    }

    const leaks = detectServerLeak(def, data, bundle)

    expect(leaks).toHaveLength(1)
    expect(leaks[0]).toEqual({ key: 'SECRET_KEY', chunk: 'main.js' })
  })

  it('should not flag client values', () => {
    const def = {
      server: { SECRET: {} as any },
      client: { VITE_PUB: {} as any },
    }
    const data = {
      SECRET: 'long-secret-value',
      VITE_PUB: 'public-value-here',
    }
    const bundle = {
      'main.js': { type: 'chunk', code: 'const x = "public-value-here"' },
    }

    const leaks = detectServerLeak(def, data, bundle)
    expect(leaks).toHaveLength(0)
  })

  it('should skip values shorter than 8 chars', () => {
    const def = { server: { SHORT: {} as any } }
    const data = { SHORT: 'abc' }
    const bundle = {
      'main.js': { type: 'chunk', code: 'const x = "abc"' },
    }

    expect(detectServerLeak(def, data, bundle)).toHaveLength(0)
  })

  it('should skip non-string values', () => {
    const def = { server: { NUM: {} as any } }
    const data = { NUM: 12345678 as unknown }
    const bundle = {
      'main.js': { type: 'chunk', code: 'const x = 12345678' },
    }

    expect(detectServerLeak(def, data as any, bundle)).toHaveLength(0)
  })

  it('should skip non-chunk bundle entries', () => {
    const def = { server: { SECRET: {} as any } }
    const data = { SECRET: 'long-secret-value' }
    const bundle = {
      'style.css': { type: 'asset', code: 'long-secret-value' },
    }

    expect(detectServerLeak(def, data, bundle)).toHaveLength(0)
  })

  it('should skip chunks without code', () => {
    const def = { server: { SECRET: {} as any } }
    const data = { SECRET: 'long-secret-value' }
    const bundle = {
      'main.js': { type: 'chunk' },
    }

    expect(detectServerLeak(def, data, bundle)).toHaveLength(0)
  })

  it('should detect leaks across multiple chunks', () => {
    const def = { server: { SECRET: {} as any } }
    const data = { SECRET: 'leaked-secret-value' }
    const bundle = {
      'a.js': { type: 'chunk', code: 'safe code here' },
      'b.js': { type: 'chunk', code: 'has leaked-secret-value inside' },
    }

    const leaks = detectServerLeak(def, data, bundle)
    expect(leaks).toHaveLength(1)
    expect(leaks[0].chunk).toBe('b.js')
  })

  it('should handle empty server definition', () => {
    const def = { client: { VITE_X: {} as any } }
    const data = { VITE_X: 'some-value-here' }
    const bundle = {
      'main.js': { type: 'chunk', code: 'some-value-here' },
    }

    expect(detectServerLeak(def, data, bundle)).toHaveLength(0)
  })
})
