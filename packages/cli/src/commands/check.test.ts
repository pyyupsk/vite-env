import { describe, expect, it } from 'vitest'
import { checkCommand } from './check'

describe('checkCommand', () => {
  it('should be a valid command definition', () => {
    expect(checkCommand).toBeDefined()
  })

  it('should have correct meta description', () => {
    const def = checkCommand as any
    expect(def.meta?.description ?? def.description).toBeDefined()
  })

  it('should define config and mode args', () => {
    const def = checkCommand as any
    expect(def.args?.config).toBeDefined()
    expect(def.args?.mode).toBeDefined()
    expect(def.args?.config.default).toBe('env.ts')
    expect(def.args?.mode.default).toBe('development')
  })
})
