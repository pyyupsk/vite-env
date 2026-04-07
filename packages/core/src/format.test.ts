import type { GuardFail } from './guard'
import { describe, expect, it } from 'vitest'
import { formatGuardLogEntry, formatGuardWarning, formatHardError, formatStandardSchemaError, formatZodError, IMPORTER_MAX_LEN, truncateImporter } from './format'

function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replaceAll(/\x1B\[[0-9;]*m/g, '')
}

const clientFail: GuardFail = {
  allowed: false,
  mode: 'warn',
  envName: 'client',
  importer: 'src/lib/config.ts',
}

const noImporterFail: GuardFail = {
  allowed: false,
  mode: 'warn',
  envName: 'client',
  importer: undefined,
}

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

describe('formatStandardSchemaError', () => {
  it('should format issues with key paths', () => {
    const result = formatStandardSchemaError([
      { message: 'Invalid URL', path: ['DATABASE_URL'] },
      { message: 'Required', path: ['VITE_KEY'] },
    ])
    expect(result).toContain('DATABASE_URL')
    expect(result).toContain('Invalid URL')
    expect(result).toContain('VITE_KEY')
    expect(result).toContain('Required')
  })

  it('should handle empty path', () => {
    const result = formatStandardSchemaError([
      { message: 'Unknown error', path: [] },
    ])
    expect(result).toContain('(root)')
    expect(result).toContain('Unknown error')
  })

  it('should handle PathSegment objects in path', () => {
    const result = formatStandardSchemaError([
      { message: 'Bad value', path: ['DB_URL', { key: 'host' }] },
    ])
    expect(result).toContain('DB_URL.host')
    expect(result).toContain('Bad value')
  })
})

describe('truncateImporter', () => {
  it('returns path unchanged when within maxLen', () => {
    expect(truncateImporter('src/lib/config.ts', IMPORTER_MAX_LEN)).toBe('src/lib/config.ts')
  })

  it('truncates with leading ellipsis when over maxLen', () => {
    const long = 'src/features/authentication/server/very-long-config.ts'
    const result = truncateImporter(long, 30)
    expect(result).toHaveLength(30)
    expect(result.startsWith('…')).toBe(true)
    expect(result.endsWith(long.slice(-(29)))).toBe(true)
  })

  it('does not truncate at exact boundary', () => {
    const path = 'a'.repeat(30)
    expect(truncateImporter(path, 30)).toBe(path)
  })
})

describe('formatGuardWarning', () => {
  it('contains required content with short importer', () => {
    const out = stripAnsi(formatGuardWarning(clientFail))
    expect(out).toContain('DEPRECATION WARNING')
    expect(out).toContain('"client"')
    expect(out).toContain('onClientAccessOfServerModule: \'error\'')
    expect(out).toContain('onClientAccessOfServerModule: \'stub\'')
    expect(out).toContain('Found in: src/lib/config.ts')
  })

  it('every line is exactly 66 chars wide', () => {
    const lines = stripAnsi(formatGuardWarning(clientFail)).split('\n')
    for (const line of lines) {
      expect(line).toHaveLength(66)
    }
  })

  it('truncates long importer and keeps box at 66 chars', () => {
    const fail: GuardFail = {
      ...clientFail,
      importer: 'src/features/authentication/server/very-long-environment-config.ts',
    }
    const lines = stripAnsi(formatGuardWarning(fail)).split('\n')
    for (const line of lines) {
      expect(line).toHaveLength(66)
    }
    const foundLine = lines.find(l => l.includes('Found in:'))!
    expect(foundLine).toContain('…')
  })

  it('renders (unknown) and keeps box at 66 chars when importer is undefined', () => {
    const out = stripAnsi(formatGuardWarning(noImporterFail))
    expect(out).toContain('Found in: (unknown)')
    for (const line of out.split('\n')) {
      expect(line).toHaveLength(66)
    }
  })
})

describe('formatHardError', () => {
  it('includes env name, serverEnvironments hint, stub hint, and importer', () => {
    const out = formatHardError(clientFail)
    expect(out).toContain('"client"')
    expect(out).toContain('serverEnvironments')
    expect(out).toContain('onClientAccessOfServerModule: \'stub\'')
    expect(out).toContain('Imported from: src/lib/config.ts')
  })

  it('renders (unknown) when importer is undefined', () => {
    expect(formatHardError(noImporterFail)).toContain('Imported from: (unknown)')
  })
})

describe('formatGuardLogEntry', () => {
  it('includes timestamp, env name, and importer path', () => {
    const ts = '2026-04-07T10:00:00.000Z'
    const out = formatGuardLogEntry(clientFail, ts)
    expect(out).toContain(`[${ts}]`)
    expect(out).toContain('"client"')
    expect(out).toContain('Importer: src/lib/config.ts')
  })

  it('renders (unknown) when importer is undefined — matches terminal box convention', () => {
    const out = formatGuardLogEntry(noImporterFail, '2026-04-07T10:00:00.000Z')
    expect(out).toContain('Importer: (unknown)')
  })
})
