// @env node
import type { Plugin, ResolvedConfig } from 'vite'
import type { EnvDefinition } from './types'
import path from 'node:path'
import { generateDts } from './dts'
import { formatZodError } from './format'
import { detectServerLeak } from './leak'
import { validateEnv } from './schema'
import { loadEnvSources } from './sources'
import { buildClientModule, buildServerModule } from './virtual'

export interface ViteEnvOptions {
  /**
   * Path to env definition file.
   * @default './env.ts' (resolved from project root)
   */
  configFile?: string
}

export default function ViteEnv(options: ViteEnvOptions = {}): Plugin {
  let resolvedConfig: ResolvedConfig
  let envDefinition: EnvDefinition
  let lastValidated: Record<string, unknown> = {}

  return {
    name: 'vite-env',
    enforce: 'pre',

    async configResolved(config) {
      resolvedConfig = config

      const configPath = path.resolve(
        config.root,
        options.configFile ?? 'env.ts',
      )

      try {
        const mod = await import(configPath)
        envDefinition = mod.default ?? mod
      }
      catch {
        throw new Error(
          `[vite-env] Could not load env definition file at: ${configPath}\n`
          + `  Create an env.ts file and export default defineEnv({ ... })`,
        )
      }
    },

    async buildStart() {
      const rawEnv = await loadEnvSources(resolvedConfig)
      const result = validateEnv(envDefinition, rawEnv)

      if (!result.success) {
        const formatted = formatZodError(result.errors)
        throw new Error(
          `[vite-env] Environment validation failed:\n\n${formatted}`,
        )
      }

      lastValidated = result.data!

      await generateDts(envDefinition, resolvedConfig.root)

      const count = Object.keys(result.data ?? {}).length
      resolvedConfig.logger.info(
        `  \x1B[32m✓\x1B[0m \x1B[36m[vite-env]\x1B[0m ${count} variables validated`,
      )
    },

    resolveId(id) {
      if (id === 'virtual:env/client')
        return '\0virtual:env/client'
      if (id === 'virtual:env/server')
        return '\0virtual:env/server'
    },

    load(id) {
      if (id === '\0virtual:env/client')
        return buildClientModule(envDefinition, lastValidated)
      if (id === '\0virtual:env/server')
        return buildServerModule(envDefinition, lastValidated)
    },

    async generateBundle(_options, bundle) {
      const rawEnv = await loadEnvSources(resolvedConfig)
      const result = validateEnv(envDefinition, rawEnv)

      if (!result.success) {
        const formatted = formatZodError(result.errors)
        throw new Error(
          `[vite-env] Env validation failed at bundle emit:\n\n${formatted}`,
        )
      }

      const leaks = detectServerLeak(
        envDefinition,
        result.data || {},
        bundle as Record<string, { type: string, code?: string }>,
      )

      if (leaks.length > 0) {
        throw new Error(
          `[vite-env] Server environment variables detected in client bundle!\n\n${leaks.map(l => `  ✗ ${l.key} found in ${l.chunk}`).join('\n')
          }\n\n  These variables are marked as server-only and must never reach the browser.`,
        )
      }
    },

    configureServer(server) {
      const envDir = resolvedConfig.envDir || resolvedConfig.root
      server.watcher.add(path.join(envDir, '.env*'))

      let debounceTimer: ReturnType<typeof setTimeout>

      server.watcher.on('change', async (file) => {
        if (!path.basename(file).startsWith('.env'))
          return

        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(async () => {
          const rawEnv = await loadEnvSources(resolvedConfig)
          const result = validateEnv(envDefinition, rawEnv)

          if (!result.success) {
            const formatted = formatZodError(result.errors)
            resolvedConfig.logger.warn(
              `\n  \x1B[33m⚠\x1B[0m \x1B[36m[vite-env]\x1B[0m Env revalidation failed:\n${formatted}`,
            )
            return
          }

          lastValidated = result.data!

          const clientMod = server.moduleGraph.getModuleById('\0virtual:env/client')
          if (clientMod) {
            server.moduleGraph.invalidateModule(clientMod)
            server.hot.send({ type: 'full-reload' })
            resolvedConfig.logger.info(
              `  \x1B[32m✓\x1B[0m \x1B[36m[vite-env]\x1B[0m Env revalidated`,
            )
          }
        }, 150) // 150ms debounce
      })
    },
  }
}
