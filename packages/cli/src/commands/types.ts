import type { EnvDefinition } from '@vite-env/core'
import path from 'node:path'
import process from 'node:process'
import { generateDts } from '@vite-env/core/dts'
import { defineCommand } from 'citty'
import consola from 'consola'

export const typesCommand = defineCommand({
  meta: { description: 'Regenerate vite-env.d.ts from your env.ts schema' },
  args: {
    config: { type: 'string', default: 'env.ts' },
  },
  async run({ args }) {
    const root = process.cwd()
    const configPath = path.resolve(root, args.config)
    const { loadEnvConfig } = await import('@vite-env/core/config')
    const def: EnvDefinition = await loadEnvConfig(configPath)

    await generateDts(def, root)
    consola.success('Generated vite-env.d.ts')
  },
})
