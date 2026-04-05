import { describe, expect, it } from 'vitest'
import { buildClientModule, buildServerModule } from './virtual'

describe('buildClientModule', () => {
  it('should include only client keys', () => {
    const def = {
      server: { SECRET: {} as any },
      client: { VITE_API: {} as any, VITE_NODE_ENV: {} as any },
    }
    const data = {
      SECRET: 'hidden',
      VITE_API: 'https://api.example.com',
      VITE_NODE_ENV: 'production',
    }

    const result = buildClientModule(def, data)

    expect(result.moduleType).toBe('js')
    expect(result.code).toContain('VITE_API')
    expect(result.code).toContain('VITE_NODE_ENV')
    expect(result.code).not.toContain('SECRET')
    expect(result.code).not.toContain('hidden')
  })

  it('should return frozen object export', () => {
    const result = buildClientModule(
      { client: { VITE_X: {} as any } },
      { VITE_X: 'val' },
    )

    expect(result.code).toContain('Object.freeze')
    expect(result.code).toContain('export const env')
    expect(result.code).toContain('export default env')
  })

  it('should handle empty definition', () => {
    const result = buildClientModule({}, { FOO: 'bar' })

    expect(result.code).toContain('Object.freeze({})')
  })
})

describe('buildServerModule', () => {
  it('should include all data', () => {
    const def = {
      server: { SECRET: {} as any },
      client: { VITE_API: {} as any },
    }
    const data = {
      SECRET: 'hidden',
      VITE_API: 'https://api.example.com',
    }

    const result = buildServerModule(def, data)

    expect(result.moduleType).toBe('js')
    expect(result.code).toContain('SECRET')
    expect(result.code).toContain('VITE_API')
  })

  it('should return frozen object export', () => {
    const result = buildServerModule({}, { KEY: 'val' })

    expect(result.code).toContain('Object.freeze')
    expect(result.code).toContain('export const env')
    expect(result.code).toContain('export default env')
  })
})
