import { describe, expect, it } from 'vitest'
import { formatZodError } from './format'

describe('formatZodError', () => {
  it('should format issues with paths', () => {
    const issues = [
      { path: ['DATABASE_URL'], message: 'Required', code: 'invalid_type' as const },
    ]
    const output = formatZodError(issues as any)

    expect(output).toContain('DATABASE_URL')
    expect(output).toContain('Required')
  })

  it('should format issues without paths as (root)', () => {
    const issues = [
      { path: [], message: 'Invalid input', code: 'invalid_type' as const },
    ]
    const output = formatZodError(issues as any)

    expect(output).toContain('(root)')
    expect(output).toContain('Invalid input')
  })

  it('should format multiple issues separated by newlines', () => {
    const issues = [
      { path: ['A'], message: 'Missing A', code: 'invalid_type' as const },
      { path: ['B'], message: 'Missing B', code: 'invalid_type' as const },
    ]
    const output = formatZodError(issues as any)
    const lines = output.split('\n')

    expect(lines).toHaveLength(2)
    expect(lines[0]).toContain('A')
    expect(lines[1]).toContain('B')
  })

  it('should handle nested paths with dot notation', () => {
    const issues = [
      { path: ['config', 'nested'], message: 'Bad value', code: 'invalid_type' as const },
    ]
    const output = formatZodError(issues as any)

    expect(output).toContain('config.nested')
  })

  it('should return empty string for empty issues', () => {
    expect(formatZodError([])).toBe('')
  })
})
