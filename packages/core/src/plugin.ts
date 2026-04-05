// @env node
import type { Plugin, ResolvedConfig } from 'vite'
import type { EnvDefinition } from './types'
import path from 'node:path'
import { loadEnvConfig } from './config'
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
        envDefinition = await loadEnvConfig(configPath)
      }
      catch (e) {
        throw new Error(
          `[vite-env] Could not load env definition file at: ${configPath}\n`
          + `  Create an env.ts file and export default defineEnv({ ... })`,
          { cause: e },
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

      lastValidated = result.data

      await generateDts(envDefinition, resolvedConfig.root)

      const count = Object.keys(result.data).length
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

    generateBundle(_options, bundle) {
      if (resolvedConfig.build.ssr)
        return

      const leaks = detectServerLeak(
        envDefinition,
        lastValidated,
        bundle as Record<string, { type: string, code?: string }>,
        (keys) => {
          resolvedConfig.logger.warn(
            `  \x1B[33m⚠\x1B[0m \x1B[36m[vite-env]\x1B[0m Leak detection skipped ${keys.length} server variable(s) with values shorter than 8 chars: ${keys.join(', ')}`,
          )
        },
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
          try {
            const rawEnv = await loadEnvSources(resolvedConfig)
            const result = validateEnv(envDefinition, rawEnv)

            if (!result.success) {
              const formatted = formatZodError(result.errors)
              resolvedConfig.logger.warn(
                `\n  \x1B[33m⚠\x1B[0m \x1B[36m[vite-env]\x1B[0m Env revalidation failed:\n${formatted}`,
              )
              return
            }

            lastValidated = result.data

            const clientMod = server.moduleGraph.getModuleById('\0virtual:env/client')
            const serverMod = server.moduleGraph.getModuleById('\0virtual:env/server')
            if (clientMod)
              server.moduleGraph.invalidateModule(clientMod)
            if (serverMod)
              server.moduleGraph.invalidateModule(serverMod)
            if (clientMod || serverMod) {
              server.hot.send({ type: 'full-reload' })
              resolvedConfig.logger.info(
                `  \x1B[32m✓\x1B[0m \x1B[36m[vite-env]\x1B[0m Env revalidated`,
              )
            }
          }
          catch (e) {
            resolvedConfig.logger.error(
              `\n  \x1B[31m✗\x1B[0m \x1B[36m[vite-env]\x1B[0m Failed to reload env files: ${e instanceof Error ? e.message : String(e)}`,
            )
          }
        }, 150) // 150ms debounce
      })
    },
  }
}
