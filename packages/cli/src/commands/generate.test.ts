import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { generateCommand } from './generate'

describe('generateCommand', () => {
  it('should be a valid command definition', () => {
    expect(generateCommand).toBeDefined()
  })

  it('should have correct meta description', () => {
    const def = generateCommand as any
    expect(def.meta?.description ?? def.description).toContain('.env.example')
  })

  it('should define config and output args', () => {
    const def = generateCommand as any
    expect(def.args?.config.default).toBe('env.ts')
    expect(def.args?.output.default).toBe('.env.example')
  })
})

describe('zod schema introspection (generate helpers)', () => {
  it('should recognize ZodString', () => {
    expect(z.string() instanceof z.ZodString).toBe(true)
  })

  it('should recognize ZodNumber', () => {
    expect(z.number() instanceof z.ZodNumber).toBe(true)
  })

  it('should recognize ZodBoolean', () => {
    expect(z.boolean() instanceof z.ZodBoolean).toBe(true)
  })

  it('should recognize ZodEnum with options', () => {
    const schema = z.enum(['a', 'b', 'c'])
    expect(schema instanceof z.ZodEnum).toBe(true)
    expect(schema.options).toEqual(['a', 'b', 'c'])
  })

  it('should recognize ZodOptional', () => {
    const schema = z.string().optional()
    expect(schema instanceof z.ZodOptional).toBe(true)
  })

  it('should recognize ZodDefault', () => {
    const schema = z.string().default('hello')
    expect(schema instanceof z.ZodDefault).toBe(true)
  })

  it('should unwrap ZodOptional to inner type', () => {
    const schema = z.string().optional()
    const inner = schema.unwrap()
    expect(inner instanceof z.ZodString).toBe(true)
  })
})
