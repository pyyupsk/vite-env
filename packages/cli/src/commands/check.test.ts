import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
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

describe('loadCliEnv', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'vite-env-cli-'))
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true })
  })

  it('should merge .env file contents with process.env', async () => {
    const { loadCliEnv } = await import('./check')

    await fs.writeFile(
      path.join(tmpDir, '.env'),
      'FROM_DOTENV_FILE=hello_from_file\n',
    )

    const result = loadCliEnv('development', tmpDir)
    expect(result.FROM_DOTENV_FILE).toBe('hello_from_file')
    expect(result.PATH).toBeDefined()
  })

  it('should let process.env override .env file values', async () => {
    const { loadCliEnv } = await import('./check')

    const original = process.env.HOME
    await fs.writeFile(
      path.join(tmpDir, '.env'),
      `HOME=should_be_overridden\n`,
    )

    const result = loadCliEnv('development', tmpDir)
    expect(result.HOME).toBe(original)
  })
})
