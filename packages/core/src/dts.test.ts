import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { generateDts } from './dts'

vi.mock('node:fs/promises', () => ({
  default: {
    writeFile: vi.fn(),
  },
}))

async function getWriteFile() {
  const fs = await import('node:fs/promises')
  return vi.mocked(fs.default.writeFile)
}

describe('generateDts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should generate correct .d.ts content for client + server + shared', async () => {
    const writeFile = await getWriteFile()
    writeFile.mockResolvedValue(undefined)

    const def = {
      server: { DATABASE_URL: z.url() },
      client: { VITE_API_URL: z.string() },
      shared: { NODE_ENV: z.enum(['development', 'production']) },
    }

    await generateDts(def, '/tmp/test')

    expect(writeFile).toHaveBeenCalledOnce()
    const [filePath, content] = writeFile.mock.calls[0]

    expect(filePath).toBe(path.join('/tmp/test', 'vite-env.d.ts'))
    expect(content).toContain('declare module \'virtual:env/client\'')
    expect(content).toContain('declare module \'virtual:env/server\'')

    // Client module should have client + shared but NOT server
    const clientSection = (content as string).split('declare module \'virtual:env/server\'')[0]
    expect(clientSection).toContain('VITE_API_URL')
    expect(clientSection).toContain('NODE_ENV')
    expect(clientSection).not.toContain('DATABASE_URL')

    // Server module should have all
    const serverSection = (content as string).split('declare module \'virtual:env/server\'')[1]
    expect(serverSection).toContain('DATABASE_URL')
    expect(serverSection).toContain('VITE_API_URL')
    expect(serverSection).toContain('NODE_ENV')
  })

  it('should map string schema to string type', async () => {
    const writeFile = await getWriteFile()
    writeFile.mockResolvedValue(undefined)

    await generateDts({ client: { VITE_NAME: z.string() } }, '/tmp')
    const content = writeFile.mock.calls[0][1] as string

    expect(content).toContain('readonly VITE_NAME: string')
  })

  it('should map number schema to number type', async () => {
    const writeFile = await getWriteFile()
    writeFile.mockResolvedValue(undefined)

    await generateDts({ server: { PORT: z.number() } }, '/tmp')
    const content = writeFile.mock.calls[0][1] as string

    expect(content).toContain('readonly PORT: number')
  })

  it('should map boolean schema to boolean type', async () => {
    const writeFile = await getWriteFile()
    writeFile.mockResolvedValue(undefined)

    await generateDts({ client: { VITE_DEBUG: z.boolean() } }, '/tmp')
    const content = writeFile.mock.calls[0][1] as string

    expect(content).toContain('readonly VITE_DEBUG: boolean')
  })

  it('should map enum schema to union type', async () => {
    const writeFile = await getWriteFile()
    writeFile.mockResolvedValue(undefined)

    await generateDts({
      shared: { LEVEL: z.enum(['debug', 'info', 'error']) },
    }, '/tmp')
    const content = writeFile.mock.calls[0][1] as string

    expect(content).toContain('\'debug\' | \'info\' | \'error\'')
  })

  it('should mark optional fields with ?', async () => {
    const writeFile = await getWriteFile()
    writeFile.mockResolvedValue(undefined)

    await generateDts({
      server: { REDIS_URL: z.string().optional() },
    }, '/tmp')
    const content = writeFile.mock.calls[0][1] as string

    expect(content).toContain('readonly REDIS_URL?: string')
  })

  it('should mark defaulted fields with ?', async () => {
    const writeFile = await getWriteFile()
    writeFile.mockResolvedValue(undefined)

    await generateDts({
      server: { POOL_SIZE: z.number().default(10) },
    }, '/tmp')
    const content = writeFile.mock.calls[0][1] as string

    expect(content).toContain('readonly POOL_SIZE?: number')
  })

  it('should map z.stringbool() to boolean type', async () => {
    const writeFile = await getWriteFile()
    writeFile.mockResolvedValue(undefined)

    await generateDts({
      client: { VITE_DARK_MODE: z.stringbool().default(false) },
    }, '/tmp')
    const content = writeFile.mock.calls[0][1] as string

    expect(content).toContain('readonly VITE_DARK_MODE?: boolean')
  })

  it('should handle empty definition', async () => {
    const writeFile = await getWriteFile()
    writeFile.mockResolvedValue(undefined)

    await generateDts({}, '/tmp')
    const content = writeFile.mock.calls[0][1] as string

    expect(content).toContain('declare module \'virtual:env/client\'')
    expect(content).toContain('declare module \'virtual:env/server\'')
  })
})
