import type { EnvDefinition } from '@vite-env/core'
import path from 'node:path'
import process from 'node:process'
import { formatZodError } from '@vite-env/core/format'
import { validateEnv } from '@vite-env/core/schema'
import { defineCommand } from 'citty'

export const checkCommand = defineCommand({
  meta: {
    description: 'Validate environment variables without starting dev server',
  },
  args: {
    config: {
      type: 'string',
      default: 'env.ts',
      description: 'Path to env definition file',
    },
    mode: { type: 'string', default: 'development', description: 'Vite mode' },
  },
  async run({ args }) {
    const root = process.cwd()
    const configPath = path.resolve(root, args.config)

    const mod = await import(configPath)
    const def: EnvDefinition = mod.default ?? mod

    const rawEnv = { ...process.env } as Record<string, string>
    const result = validateEnv(def, rawEnv)

    if (result.success) {
      const count = Object.keys(result.data ?? {}).length
      console.log(`\n  ✓ ${count} environment variables valid\n`)
      process.exit(0)
    }
    else {
      console.error(`\n  ✗ Environment validation failed:\n`)
      console.error(formatZodError(result.errors))
      console.error()
      process.exit(1)
    }
  },
})
