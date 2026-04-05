import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { detectServerLeak } from '@vite-env/core/leak'
import ViteEnv from '@vite-env/core/plugin'
import { build } from 'vite'
import { afterEach, describe, expect, it } from 'vitest'

type BuildResult = Awaited<ReturnType<typeof build>>
type BuildOutput = Extract<BuildResult extends Array<infer T> ? T : BuildResult, { output: unknown }>

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesDir = path.join(__dirname, 'fixtures')

function fixture(name: string): string {
  return path.join(fixturesDir, name)
}

async function buildWithEnv(options: {
  configFile: string
  entry: string
  envVars?: Record<string, string>
  envDir?: string
  ssr?: boolean
}): Promise<BuildOutput> {
  const prevEnv = { ...process.env }

  if (options.envVars) {
    Object.assign(process.env, options.envVars)
  }

  try {
    const result = await build({
      root: fixturesDir,
      logLevel: 'silent',
      plugins: [ViteEnv({ configFile: options.configFile })],
      build: {
        write: false,
        ssr: options.ssr ? options.entry : undefined,
        rollupOptions: options.ssr ? undefined : { input: options.entry },
      },
      envDir: options.envDir ?? fixturesDir,
    })

    return (Array.isArray(result) ? result[0] : result) as BuildOutput // NOSONAR -- build() with write:false never returns RolldownWatcher
  }
  finally {
    for (const key of Object.keys(process.env)) {
      if (!(key in prevEnv)) {
        delete process.env[key]
      }
    }
    Object.assign(process.env, prevEnv)
  }
}

function getChunkCode(output: BuildOutput): string {
  return output.output
    .filter(o => o.type === 'chunk')
    .map(o => o.code)
    .join('\n')
}

const validEnv = {
  DATABASE_URL: 'postgresql://localhost:5432/db',
  JWT_SECRET: 'a-very-long-secret-key-at-least-32-characters-long',
  VITE_API_URL: 'https://api.example.com',
  VITE_APP_NAME: 'test-app',
  VITE_DEBUG: 'true',
  VITE_LOG_LEVEL: 'debug',
  NODE_ENV: 'production',
}

// ─── Client env ─────────────────────────────────────────────────────────────

describe('client env', () => {
  it('should include client + shared vars in client bundle', async () => {
    const result = await buildWithEnv({
      configFile: fixture('env-valid.mjs'),
      entry: fixture('entry-client.ts'),
      envVars: validEnv,
    })

    const code = getChunkCode(result)

    // Client vars present
    expect(code).toContain('https://api.example.com')
    expect(code).toContain('test-app')
    expect(code).toContain('production')

    // Server vars must NOT be in client bundle
    expect(code).not.toContain('postgresql://localhost:5432/db')
    expect(code).not.toContain('a-very-long-secret-key-at-least-32-characters-long')
  })

  it('should coerce VITE_DEBUG to boolean (not string "true")', async () => {
    const result = await buildWithEnv({
      configFile: fixture('env-valid.mjs'),
      entry: fixture('entry-client.ts'),
      envVars: validEnv,
    })

    const code = getChunkCode(result)

    // In the minified output, boolean true is `!0` — string "true" would appear as `"true"`
    expect(code).not.toContain('"true"')
    expect(code).not.toContain('\'true\'')
  })

  it('should apply default values when optional vars are omitted', async () => {
    const result = await buildWithEnv({
      configFile: fixture('env-valid.mjs'),
      entry: fixture('entry-client.ts'),
      envVars: {
        DATABASE_URL: 'postgresql://localhost:5432/db',
        JWT_SECRET: 'a-very-long-secret-key-at-least-32-characters-long',
        VITE_API_URL: 'https://api.example.com',
        VITE_APP_NAME: 'defaults-test',
        NODE_ENV: 'development', // explicit — vitest sets NODE_ENV=test otherwise
      },
    })

    const code = getChunkCode(result)

    expect(code).toContain('defaults-test')
    expect(code).toContain('info') // default VITE_LOG_LEVEL
    expect(code).toContain('development') // explicitly set NODE_ENV
  })
})

// ─── Server env (SSR build) ─────────────────────────────────────────────────

describe('server env', () => {
  it('should include ALL vars (server + client + shared) in SSR bundle', async () => {
    const result = await buildWithEnv({
      configFile: fixture('env-valid.mjs'),
      entry: fixture('entry-server.ts'),
      envVars: validEnv,
      ssr: true,
    })

    const code = getChunkCode(result)

    // Server vars
    expect(code).toContain('postgresql://localhost:5432/db')
    expect(code).toContain('a-very-long-secret-key-at-least-32-characters-long')

    // Client vars also available server-side
    expect(code).toContain('https://api.example.com')
    expect(code).toContain('test-app')

    // Shared vars
    expect(code).toContain('production')
  })

  it('should coerce DB_POOL_SIZE to number', async () => {
    const result = await buildWithEnv({
      configFile: fixture('env-valid.mjs'),
      entry: fixture('entry-server.ts'),
      envVars: { ...validEnv, DB_POOL_SIZE: '25' },
      ssr: true,
    })

    const code = getChunkCode(result)

    // Number 25 in the output, not string "25"
    expect(code).toContain('25')
    expect(code).not.toContain('"25"')
  })
})

// ─── Missing required vars ──────────────────────────────────────────────────

describe('missing required env', () => {
  it('should throw validation error when all required vars are missing', async () => {
    await expect(
      buildWithEnv({
        configFile: fixture('env-missing-required.mjs'),
        entry: fixture('entry-client.ts'),
        envVars: { NODE_ENV: 'test' },
      }),
    ).rejects.toThrow('[vite-env] Environment validation failed')
  })

  it('should throw when a single required var is missing', async () => {
    await expect(
      buildWithEnv({
        configFile: fixture('env-missing-required.mjs'),
        entry: fixture('entry-client.ts'),
        envVars: {
          VITE_REQUIRED_URL: 'https://example.com',
          // VITE_REQUIRED_NAME still missing
        },
      }),
    ).rejects.toThrow('[vite-env] Environment validation failed')
  })

  it('should succeed when all required vars are provided', async () => {
    const result = await buildWithEnv({
      configFile: fixture('env-missing-required.mjs'),
      entry: fixture('entry-client.ts'),
      envVars: {
        VITE_REQUIRED_URL: 'https://example.com',
        VITE_REQUIRED_NAME: 'my-app',
      },
    })

    const code = getChunkCode(result)
    expect(code).toContain('https://example.com')
    expect(code).toContain('my-app')
  })
})

// ─── VITE_ prefix enforcement ───────────────────────────────────────────────

describe('vITE_ prefix enforcement', () => {
  it('should throw at define-time when client key lacks VITE_ prefix', async () => {
    const { defineEnv } = await import('@vite-env/core')
    const { z } = await import('zod')

    expect(() => defineEnv({
      client: { API_URL: z.string() },
    })).toThrow('Client env var "API_URL" must be prefixed with VITE_')
  })

  it('should accept server keys without VITE_ prefix', async () => {
    const { defineEnv } = await import('@vite-env/core')
    const { z } = await import('zod')

    expect(() => defineEnv({
      server: { DATABASE_URL: z.string() },
    })).not.toThrow()
  })
})

// ─── Server leak detection ──────────────────────────────────────────────────

describe('server leak detection', () => {
  it('should detect server values leaked into client chunks', () => {
    // Test the leak detector directly with realistic bundle data
    const def = {
      server: { JWT_SECRET: {} as any, DATABASE_URL: {} as any },
      client: { VITE_API_URL: {} as any },
    }
    const data = {
      JWT_SECRET: 'a-very-long-secret-key-at-least-32-characters-long',
      DATABASE_URL: 'postgresql://prod-db.example.com:5432/myapp',
      VITE_API_URL: 'https://api.example.com',
    }

    // Simulate a client bundle that accidentally contains the JWT secret
    const bundle = {
      'assets/main-abc123.js': {
        type: 'chunk' as const,
        code: `const env = Object.freeze({VITE_API_URL:"https://api.example.com"});const x = "a-very-long-secret-key-at-least-32-characters-long";`,
      },
    }

    const leaks = detectServerLeak(def, data, bundle)
    expect(leaks).toHaveLength(1)
    expect(leaks[0].key).toBe('JWT_SECRET')
    expect(leaks[0].chunk).toBe('assets/main-abc123.js')
  })

  it('should not flag short values (< 8 chars) to avoid false positives', () => {
    const def = { server: { PORT: {} as any } }
    const data = { PORT: '3000' }
    const bundle = {
      'main.js': { type: 'chunk' as const, code: 'const port = 3000' },
    }

    expect(detectServerLeak(def, data, bundle)).toHaveLength(0)
  })

  it('should not flag client values as leaks', () => {
    const def = {
      server: { SECRET: {} as any },
      client: { VITE_KEY: {} as any },
    }
    const data = {
      SECRET: 'long-secret-value-here',
      VITE_KEY: 'this-is-a-public-value-ok',
    }
    const bundle = {
      'main.js': { type: 'chunk' as const, code: 'const key = "this-is-a-public-value-ok"' },
    }

    expect(detectServerLeak(def, data, bundle)).toHaveLength(0)
  })
})

// ─── .d.ts generation ───────────────────────────────────────────────────────

describe('.d.ts generation', () => {
  const dtsPath = path.join(fixturesDir, 'vite-env.d.ts')

  afterEach(() => {
    if (fs.existsSync(dtsPath))
      fs.unlinkSync(dtsPath)
  })

  it('should generate vite-env.d.ts on build with correct types', async () => {
    await buildWithEnv({
      configFile: fixture('env-valid.mjs'),
      entry: fixture('entry-client.ts'),
      envVars: validEnv,
    })

    expect(fs.existsSync(dtsPath)).toBe(true)

    const content = fs.readFileSync(dtsPath, 'utf-8')

    // Client module: client + shared keys
    expect(content).toContain('declare module \'virtual:env/client\'')
    expect(content).toContain('VITE_API_URL')
    expect(content).toContain('VITE_APP_NAME')
    expect(content).toContain('NODE_ENV')

    // Server module: all keys
    expect(content).toContain('declare module \'virtual:env/server\'')
    expect(content).toContain('DATABASE_URL')
    expect(content).toContain('JWT_SECRET')
    expect(content).toContain('DB_POOL_SIZE')

    // Correct TypeScript types
    expect(content).toContain('readonly VITE_API_URL: string')
    expect(content).toContain('readonly DB_POOL_SIZE?: number')
    expect(content).toContain('\'debug\' | \'info\' | \'warn\' | \'error\'')
    expect(content).toContain('\'development\' | \'test\' | \'production\'')
  })
})

// ─── CLI: schema validation ─────────────────────────────────────────────────

describe('cLI: validate env', () => {
  it('should validate successfully with correct env', async () => {
    const { validateEnv } = await import('@vite-env/core/schema')
    const mod = await import(fixture('env-valid.mjs'))

    const result = validateEnv(mod.default, {
      DATABASE_URL: 'https://db.example.com',
      JWT_SECRET: 'a-very-long-secret-key-at-least-32-characters-long',
      VITE_API_URL: 'https://api.example.com',
      VITE_APP_NAME: 'cli-test',
      NODE_ENV: 'production',
    })

    expect(result.success).toBe(true)
    expect(result.data).not.toBeNull()
  })

  it('should fail validation with missing required vars', async () => {
    const { validateEnv } = await import('@vite-env/core/schema')
    const mod = await import(fixture('env-valid.mjs'))

    const result = validateEnv(mod.default, {})

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should format errors clearly', async () => {
    const { validateEnv } = await import('@vite-env/core/schema')
    const { formatZodError } = await import('@vite-env/core/format')
    const mod = await import(fixture('env-valid.mjs'))

    const result = validateEnv(mod.default, {})
    const formatted = formatZodError(result.errors)

    expect(formatted).toContain('✗')
    expect(formatted.split('\n').length).toBeGreaterThan(0)
  })
})

// ─── CLI: .d.ts standalone generation ───────────────────────────────────────

describe('cLI: generate types', () => {
  const dtsPath = path.join(fixturesDir, 'vite-env.d.ts')

  afterEach(() => {
    if (fs.existsSync(dtsPath))
      fs.unlinkSync(dtsPath)
  })

  it('should generate .d.ts standalone without Vite build', async () => {
    const { generateDts } = await import('@vite-env/core/dts')
    const mod = await import(fixture('env-valid.mjs'))

    await generateDts(mod.default, fixturesDir)

    expect(fs.existsSync(dtsPath)).toBe(true)
    const content = fs.readFileSync(dtsPath, 'utf-8')
    expect(content).toContain('declare module \'virtual:env/client\'')
    expect(content).toContain('declare module \'virtual:env/server\'')
  })
})
