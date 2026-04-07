import type { GuardFail } from './guard'

import fs from 'node:fs/promises'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { writeWarningsLog } from './log'

vi.mock('node:fs/promises', () => ({
  default: { writeFile: vi.fn().mockResolvedValue(undefined) },
}))

const fail1: GuardFail = {
  allowed: false,
  mode: 'warn',
  envName: 'client',
  importer: 'src/lib/config.ts',
}

const fail2: GuardFail = {
  allowed: false,
  mode: 'warn',
  envName: 'client',
  importer: undefined,
}

describe('writeWarningsLog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('writes to vite-env-warnings.log in the given root', async () => {
    await writeWarningsLog([fail1], '/project')
    expect(vi.mocked(fs.writeFile)).toHaveBeenCalledWith(
      '/project/vite-env-warnings.log',
      expect.any(String),
      'utf-8',
    )
  })

  it('content includes header with all three config options', async () => {
    await writeWarningsLog([fail1], '/project')
    const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
    expect(content).toContain('# vite-env warnings')
    expect(content).toContain('1.0.0')
    expect(content).toContain('onClientAccessOfServerModule: \'error\'')
    expect(content).toContain('onClientAccessOfServerModule: \'stub\'')
    expect(content).toContain('serverEnvironments: [\'ssr\', \'workerd\']')
  })

  it('content includes importer path', async () => {
    await writeWarningsLog([fail1], '/project')
    const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
    expect(content).toContain('Importer: src/lib/config.ts')
  })

  it('renders (unknown) when importer is undefined', async () => {
    await writeWarningsLog([fail2], '/project')
    const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
    expect(content).toContain('Importer: (unknown)')
  })

  it('includes all entries when multiple fails provided', async () => {
    await writeWarningsLog([fail1, fail2], '/project')
    const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
    expect(content).toContain('src/lib/config.ts')
    expect(content).toContain('(unknown)')
  })

  it('content contains no ANSI escape codes', async () => {
    await writeWarningsLog([fail1], '/project')
    const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string
    // eslint-disable-next-line no-control-regex
    expect(content).not.toMatch(/\x1B\[/)
  })

  it('throws with [vite-env] prefix when writeFile fails', async () => {
    vi.mocked(fs.writeFile).mockRejectedValueOnce(new Error('EACCES: permission denied'))
    await expect(writeWarningsLog([fail1], '/project')).rejects.toThrow('[vite-env]')
  })
})
