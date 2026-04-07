import { describe, expect, it } from 'vitest'
import { buildServerStubModule, checkServerModuleAccess } from './guard'

describe('checkServerModuleAccess', () => {
  it('returns allowed when envName is in serverEnvironments', () => {
    expect(checkServerModuleAccess('ssr', ['ssr'], 'error', undefined))
      .toEqual({ allowed: true })
  })

  it('returns GuardFail with correct shape for error mode', () => {
    expect(checkServerModuleAccess('client', ['ssr'], 'error', 'src/foo.ts'))
      .toEqual({ allowed: false, mode: 'error', envName: 'client', importer: 'src/foo.ts' })
  })

  it('returns GuardFail with mode warn', () => {
    expect(checkServerModuleAccess('client', ['ssr'], 'warn', 'src/foo.ts'))
      .toEqual({ allowed: false, mode: 'warn', envName: 'client', importer: 'src/foo.ts' })
  })

  it('returns GuardFail with mode stub and undefined importer', () => {
    expect(checkServerModuleAccess('client', ['ssr'], 'stub', undefined))
      .toEqual({ allowed: false, mode: 'stub', envName: 'client', importer: undefined })
  })

  it('allows custom serverEnvironments — workerd allowed, client blocked', () => {
    expect(checkServerModuleAccess('workerd', ['workerd'], 'error', undefined))
      .toEqual({ allowed: true })
    expect(checkServerModuleAccess('client', ['workerd'], 'error', undefined))
      .toMatchObject({ allowed: false })
  })

  it('default serverEnvironments pattern — ssr allowed, client blocked', () => {
    expect(checkServerModuleAccess('ssr', ['ssr'], 'warn', undefined))
      .toEqual({ allowed: true })
    expect(checkServerModuleAccess('client', ['ssr'], 'warn', undefined))
      .toMatchObject({ allowed: false })
  })
})

describe('buildServerStubModule', () => {
  it('returns moduleType js', () => {
    expect(buildServerStubModule('client').moduleType).toBe('js')
  })

  it('generated code contains throw', () => {
    expect(buildServerStubModule('client').code).toContain('throw new Error')
  })

  it('embeds the environment name in the error message', () => {
    const { code } = buildServerStubModule('edge')
    expect(code).toContain('"edge"')
  })

  it('generated code does not reference Object.freeze', () => {
    expect(buildServerStubModule('client').code).not.toContain('Object.freeze')
  })
})
