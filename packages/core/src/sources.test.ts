import type { ResolvedConfig } from 'vite'
import { describe, expect, it, vi } from 'vitest'

vi.mock('vite', () => ({
  loadEnv: vi.fn((_mode: string, _dir: string, _prefix: string) => ({
    FILE_VAR: 'from-file',
    SHARED: 'from-file',
  })),
}))

describe('loadEnvSources', () => {
  it('should merge file env with process.env, process.env wins', async () => {
    const originalEnv = process.env
    process.env = { ...originalEnv, SHARED: 'from-process', PROC_VAR: 'proc-only' }

    const { loadEnvSources } = await import('./sources')
    const config = {
      mode: 'development',
      root: '/project',
      envDir: '/project',
    } as unknown as ResolvedConfig

    const result = await loadEnvSources(config)

    expect(result.FILE_VAR).toBe('from-file')
    expect(result.SHARED).toBe('from-process') // process.env wins
    expect(result.PROC_VAR).toBe('proc-only')

    process.env = originalEnv
  })

  it('should use root as envDir when envDir is falsy', async () => {
    const { loadEnv } = await import('vite')
    const loadEnvMock = vi.mocked(loadEnv)
    loadEnvMock.mockReturnValue({})

    const { loadEnvSources } = await import('./sources')
    const config = {
      mode: 'production',
      root: '/app',
      envDir: false,
    } as unknown as ResolvedConfig

    await loadEnvSources(config)

    expect(loadEnvMock).toHaveBeenCalledWith('production', '/app', '')
  })
})
