import type { EnvDefinition } from '@vite-env/core'
import path from 'node:path'
import process from 'node:process'
import { formatZodError } from '@vite-env/core/format'
import { validateEnv } from '@vite-env/core/schema'
import { defineCommand } from 'citty'
import consola from 'consola'
import { loadEnv } from 'vite'

export function loadCliEnv(mode: string, root: string): Record<string, string> {
  const fileEnv = loadEnv(mode, root, '')
  const procEnv = Object.fromEntries(
    Object.entries(process.env).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  )
  return { ...fileEnv, ...procEnv }
}

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

    const { loadEnvConfig } = await import('@vite-env/core/config')
    const def: EnvDefinition = await loadEnvConfig(configPath)

    const rawEnv = loadCliEnv(args.mode, root)
    const result = validateEnv(def, rawEnv)

    if (result.success) {
      const count = Object.keys(result.data ?? {}).length
      consola.success(`${count} environment variables valid`)
      process.exit(0)
    }
    else {
      consola.error('Environment validation failed:')
      consola.log(formatZodError(result.errors))
      process.exit(1)
    }
  },
})
