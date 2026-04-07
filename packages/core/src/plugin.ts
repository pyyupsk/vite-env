// @env node
import type { Plugin, ResolvedConfig, Rollup } from 'vite'
import type { GuardFail } from './guard'
import type { AnyEnvDefinition } from './types'
import path from 'node:path'
import process from 'node:process'
import { loadEnvConfig } from './config'
import { generateStandardDts } from './dts'
import { formatGuardWarning, formatHardError, formatStandardSchemaError } from './format'
import { buildServerStubModule, checkServerModuleAccess } from './guard'
import { detectServerLeak } from './leak'
import { writeWarningsLog } from './log'
import { loadEnvSources } from './sources'
import { isStandardEnvDefinition, validateStandardEnv } from './standard'
import { buildClientModule, buildServerModule } from './virtual'

export interface ViteEnvOptions {
  /**
   * Path to env definition file.
   * @default './env.ts' (resolved from project root)
   */
  configFile?: string

  /**
   * Vite 8 environment names that are allowed to import virtual:env/server.
   * Use this to allow edge runtimes (Cloudflare Workers → 'workerd', Deno Deploy → 'ssr').
   * @default ['ssr']
   */
  serverEnvironments?: string[]

  /**
   * Behavior when virtual:env/server is imported from a disallowed environment.
   *
   * - 'warn'  — Deprecation warning printed to terminal + vite-env-warnings.log written.
   *             Build succeeds but exits with code 1. Default in 0.x releases.
   *             The default will change to 'error' in 1.0.0.
   *
   * - 'error' — Hard build error. No artifacts emitted.
   *
   * - 'stub'  — Returns a module that throws at runtime if the import executes.
   *             Use for testing environments (Vitest jsdom) or framework isomorphic files
   *             where the import exists but the code path is never reached in a server context.
   *
   * @default 'warn'
   */
  onClientAccessOfServerModule?: 'error' | 'stub' | 'warn'
}

/**
 * Validates environment variables against the definition.
 * Routes to Zod or Standard Schema path based on definition type.
 * Zod modules are loaded dynamically to avoid requiring zod for Standard Schema users.
 */
async function validateAndFormat(
  def: AnyEnvDefinition,
  rawEnv: Record<string, string>,
): Promise<{ data: Record<string, unknown> } | { error: string }> {
  if (isStandardEnvDefinition(def)) {
    const result = await validateStandardEnv(def, rawEnv)
    if (!result.success) {
      return { error: formatStandardSchemaError(result.errors) }
    }
    return { data: result.data }
  }

  const { validateEnv } = await import('./schema')
  const { formatZodError } = await import('./format')
  const result = validateEnv(def, rawEnv)
  if (!result.success) {
    return { error: formatZodError(result.errors) }
  }
  return { data: result.data }
}

export default function ViteEnv(options: ViteEnvOptions = {}): Plugin {
  let resolvedConfig: ResolvedConfig
  let envDefinition: AnyEnvDefinition
  let lastValidated: Record<string, unknown> = {}
  let serverModuleGuardFails: GuardFail[] = []
  let didSetExitCode = false

  const serverEnvs = options.serverEnvironments ?? ['ssr']
  const guardMode = options.onClientAccessOfServerModule ?? 'warn'

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
      serverModuleGuardFails = []
      if (didSetExitCode) {
        process.exitCode = 0
        didSetExitCode = false
      }

      const rawEnv = await loadEnvSources(resolvedConfig)
      const result = await validateAndFormat(envDefinition, rawEnv)

      if ('error' in result) {
        throw new Error(
          `[vite-env] Environment validation failed:\n\n${result.error}`,
        )
      }

      lastValidated = result.data

      if (isStandardEnvDefinition(envDefinition)) {
        await generateStandardDts(envDefinition, resolvedConfig.root)
      }
      else {
        const { generateDts } = await import('./dts')
        await generateDts(envDefinition, resolvedConfig.root)
      }

      const count = Object.keys(lastValidated).length
      resolvedConfig.logger.info(
        `  \x1B[32m✓\x1B[0m \x1B[36m[vite-env]\x1B[0m ${count} variables validated`,
      )
    },

    resolveId(this: Rollup.PluginContext, source, importer) {
      if (source === 'virtual:env/client')
        return '\0virtual:env/client'
      if (source === 'virtual:env/server') {
        const envName = this.environment?.name ?? 'client'
        const result = checkServerModuleAccess(envName, serverEnvs, guardMode, importer)
        if (!result.allowed)
          serverModuleGuardFails.push(result)
        return '\0virtual:env/server'
      }
    },

    load(id) {
      if (id === '\0virtual:env/client')
        return buildClientModule(envDefinition, lastValidated)
      if (id === '\0virtual:env/server') {
        if (serverModuleGuardFails.length > 0) {
          // warn once per load cycle using the last recorded fail; all importers are written to the log file
          const latest = serverModuleGuardFails.at(-1)!
          if (guardMode === 'error')
            throw new Error(formatHardError(latest))
          if (guardMode === 'stub')
            return buildServerStubModule(latest.envName)
          resolvedConfig.logger.warn(`\n${formatGuardWarning(latest)}`)
        }
        return buildServerModule(envDefinition, lastValidated)
      }
    },

    async buildEnd(error) {
      if (error)
        return
      if (serverModuleGuardFails.length === 0)
        return
      if (guardMode !== 'warn')
        return
      await writeWarningsLog(serverModuleGuardFails, resolvedConfig.root)
      process.exitCode = 1
      didSetExitCode = true
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
        const details = leaks.map(l => `  ✗ ${l.key} found in ${l.chunk}`).join('\n')
        throw new Error(
          `[vite-env] Server environment variables detected in client bundle!\n\n${details}\n\n  These variables are marked as server-only and must never reach the browser.`,
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
            const result = await validateAndFormat(envDefinition, rawEnv)

            if ('error' in result) {
              resolvedConfig.logger.warn(
                `\n  \x1B[33m⚠\x1B[0m \x1B[36m[vite-env]\x1B[0m Env revalidation failed:\n${result.error}`,
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
        }, 150)
      })
    },
  }
}
