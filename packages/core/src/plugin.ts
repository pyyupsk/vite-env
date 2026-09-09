// @env node
import type { Plugin, ResolvedConfig, Rollup } from "vite";
import type { GuardFail } from "./guard";
import type { AnyEnvDefinition } from "./types";
import path from "node:path";
import process from "node:process";
import { loadEnvConfig } from "./config";
import { generateStandardDts } from "./dts";
import { formatGuardWarning, formatHardError } from "./format";
import { buildServerStubModule, checkServerModuleAccess } from "./guard";
import { detectServerLeak } from "./leak";
import { writeWarningsLog } from "./log";
import { loadEnvSources } from "./sources";
import { isStandardEnvDefinition, validateStandardEnv } from "./standard";
import { buildClientModule, buildServerModule, type ServerRuntimeMode } from "./virtual";

export type ViteEnvOptions = {
  /**
   * Path to env definition file (required).
   * Example: './env.ts' resolved from project root.
   */
  configFile?: string;

  /**
   * Vite 8 environment names that are allowed to import virtual:env/server.
   * Use this to allow edge runtimes (Cloudflare Workers → 'workerd', Deno Deploy → 'deno',
   * Vercel/Netlify Edge → 'edge'). When left empty, detection relies on
   * `environment.config.consumer` (Vite 8+ built-in: 'server' for known runtimes).
   *
   * Detection fallback chain:
   *  1. `environment.config.consumer` (Vite 8+ built-in: 'server' for known runtimes)
   *  2. `ssr.config.experimental.environments` (custom runtime configs)
   *  3. Default: `['ssr']`
   *
   * Name-based matching is preserved when explicitly provided via this option.
   *
   * @default automatically detected from Vite environment
   */
  allowedServerEnvironments?: string[];

  /**
   * @deprecated Use `allowedServerEnvironments` instead. Will be removed in 1.0.0.
   */
  serverEnvironments?: string[];

  /**
   * Behavior when virtual:env/server is imported from a disallowed environment.
   *
   * - 'error' — Hard build error. No artifacts emitted. Default.
   *
   * - 'warn'  — Deprecation warning printed to terminal + vite-env-warnings.log written.
   *             Build succeeds but exits with code 1.
   *
   * - 'stub'  — Returns a module that throws at runtime if the import executes.
   *             Use for testing environments (Vitest jsdom) or framework isomorphic files
   *             where the import exists but the code path is never reached in a server context.
   *
   * @default 'error'
   */
  onClientAccessOfServerModule?: "error" | "stub" | "warn";

  /**
   * Controls how virtual:env/server gets its values.
   *
   * - 'build-time' (default) — Validates at build time and inlines values as a frozen object.
   *   The bundle contains actual strings. Use for traditional deployments where env is
   *   known at build time.
   *
   * - 'process-env' — Emits code that reads from process.env at runtime.
   *   Build-time validation still runs (for type generation and schema checking), but the
   *   generated module references process.env["KEY"] so container/runtime env vars take effect.
   *   No secrets are baked into the image layer.
   *
   * @default 'build-time'
   */
  serverRuntime?: "build-time" | "process-env";
};

/**
 * Validates environment variables against the definition.
 * Routes to Zod or Standard Schema path based on definition type.
 * Zod modules are loaded dynamically to avoid requiring zod for Standard Schema users.
 */
async function validateAndFormat(
  def: AnyEnvDefinition,
  rawEnv: Record<string, string>,
): Promise<{ data: Record<string, unknown> } | { error: string }> {
  const { formatZodError } = await import("./format");
  if (isStandardEnvDefinition(def)) {
    const result = await validateStandardEnv(def, rawEnv);
    if (!result.success) {
      return { error: formatZodError(result.errors) };
    }
    return { data: result.data };
  }

  const { validateEnv } = await import("./schema");
  const result = validateEnv(def, rawEnv);
  if (!result.success) {
    return { error: formatZodError(result.errors) };
  }
  return { data: result.data };
}

function getEnvConsumer(ctx: Rollup.PluginContext): string | undefined {
  return (ctx.environment as unknown as { config?: { consumer?: string } })?.config?.consumer;
}

export default function ViteEnv(options: ViteEnvOptions = {}): Plugin {
  let resolvedConfig: ResolvedConfig;
  let envDefinition: AnyEnvDefinition;
  let lastValidated: Record<string, unknown> = {};
  let serverModuleGuardFails: GuardFail[] = [];
  let didSetExitCode = false;

  const serverEnvs = options.allowedServerEnvironments ??
    options.serverEnvironments /* nosonar */ ?? ["ssr"];
  if (options.serverEnvironments) /* nosonar */ {
    console.warn(
      "[vite-env] serverEnvironments is deprecated. Use allowedServerEnvironments instead. " +
        "This option will be removed in 1.0.0.",
    );
  }
  const guardMode = options.onClientAccessOfServerModule ?? "error";
  const serverRuntime: ServerRuntimeMode = options.serverRuntime ?? "build-time";

  return {
    name: "vite-env",
    enforce: "pre",

    async configResolved(config) {
      resolvedConfig = config;

      if (!options.configFile) {
        throw new Error(
          "[vite-env] configFile is required. Set configFile: './env.ts' or use Vite's envDir.",
        );
      }

      const configPath = path.resolve(config.root, options.configFile);

      try {
        envDefinition = await loadEnvConfig(configPath);
      } catch (e) {
        throw new Error(
          `[vite-env] Could not load env definition file at: ${configPath}\n` +
            `  Create an env.ts file and export default defineEnv({ ... })`,
          { cause: e },
        );
      }
    },

    async buildStart() {
      serverModuleGuardFails = [];
      if (didSetExitCode) {
        process.exitCode = 0;
        didSetExitCode = false;
      }

      const rawEnv = await loadEnvSources(resolvedConfig);
      const result = await validateAndFormat(envDefinition, rawEnv);

      if ("error" in result) {
        throw new Error(`[vite-env] Environment validation failed:\n\n${result.error}`);
      }

      lastValidated = result.data;

      if (isStandardEnvDefinition(envDefinition)) {
        await generateStandardDts(envDefinition, resolvedConfig.root);
      } else {
        const { generateDts } = await import("./dts");
        await generateDts(envDefinition, resolvedConfig.root);
      }

      const count = Object.keys(lastValidated).length;
      resolvedConfig.logger.info(
        `  \x1B[32m✓\x1B[0m \x1B[36m[vite-env]\x1B[0m ${count} variables validated`,
      );
    },

    resolveId(this: Rollup.PluginContext, source, importer) {
      if (source === "virtual:env/client") return "\0virtual:env/client";
      if (source === "virtual:env/server") {
        const envName = this.environment?.name ?? "client";
        if (getEnvConsumer(this) !== "server") {
          const result = checkServerModuleAccess(envName, serverEnvs, guardMode, importer);
          if (!result.allowed) serverModuleGuardFails.push(result);
        }
        return "\0virtual:env/server";
      }
    },

    load(this: Rollup.PluginContext, id) {
      if (id === "\0virtual:env/client") return buildClientModule(envDefinition, lastValidated);
      if (id === "\0virtual:env/server") {
        const envName = this.environment?.name ?? "client";
        const envFails = serverModuleGuardFails.filter((f) => f.envName === envName);
        if (envFails.length > 0) {
          const latest = envFails.at(-1)!;
          if (latest.mode === "error") throw new Error(formatHardError(latest));
          if (latest.mode === "stub") return buildServerStubModule(envName);
          resolvedConfig.logger.warn(`\n${formatGuardWarning(latest)}`);
        }
        return buildServerModule(envDefinition, lastValidated, serverRuntime);
      }
    },

    async buildEnd(error) {
      if (error) return;
      if (serverModuleGuardFails.length === 0) return;
      if (guardMode !== "warn") return;
      await writeWarningsLog(serverModuleGuardFails, resolvedConfig.root);
      process.exitCode = 1;
      didSetExitCode = true;
    },

    generateBundle(this: Rollup.PluginContext, _options, bundle) {
      const envName = this.environment?.name ?? "client";
      if (
        resolvedConfig.build.ssr ||
        serverEnvs.includes(envName) ||
        getEnvConsumer(this) === "server"
      )
        return;

      const leaks = detectServerLeak(envDefinition, lastValidated, bundle, (keys) => {
        resolvedConfig.logger.warn(
          `  \x1B[33m⚠\x1B[0m \x1B[36m[vite-env]\x1B[0m Leak detection skipped ${keys.length} server variable(s) with values shorter than 8 chars: ${keys.join(", ")}`,
        );
      });

      if (leaks.length > 0) {
        const details = leaks.map((l) => `  ✗ ${l.key} found in ${l.chunk}`).join("\n");
        throw new Error(
          `[vite-env] Server environment variables detected in client bundle!\n\n${details}\n\n  These variables are marked as server-only and must never reach the browser.`,
        );
      }
    },

    configureServer(server) {
      const envDir = resolvedConfig.envDir || resolvedConfig.root;
      server.watcher.add(path.join(envDir, ".env*"));

      let debounceTimer: ReturnType<typeof setTimeout>;

      server.watcher.on("change", async (file) => {
        if (!path.basename(file).startsWith(".env")) return;

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          try {
            const rawEnv = await loadEnvSources(resolvedConfig);
            const result = await validateAndFormat(envDefinition, rawEnv);

            if ("error" in result) {
              resolvedConfig.logger.warn(
                `\n  \x1B[33m⚠\x1B[0m \x1B[36m[vite-env]\x1B[0m Env revalidation failed:\n${result.error}`,
              );
              return;
            }

            lastValidated = result.data;

            const clientMod = server.moduleGraph.getModuleById("\0virtual:env/client");
            const serverMod = server.moduleGraph.getModuleById("\0virtual:env/server");
            if (clientMod) server.moduleGraph.invalidateModule(clientMod);
            if (serverMod) server.moduleGraph.invalidateModule(serverMod);
            if (clientMod || serverMod) {
              serverModuleGuardFails = [];
              server.hot.send({ type: "full-reload" });
              resolvedConfig.logger.info(
                `  \x1B[32m✓\x1B[0m \x1B[36m[vite-env]\x1B[0m Env revalidated`,
              );
            }
          } catch (e) {
            resolvedConfig.logger.error(
              `\n  \x1B[31m✗\x1B[0m \x1B[36m[vite-env]\x1B[0m Failed to reload env files: ${e instanceof Error ? e.message : String(e)}`,
            );
          }
        }, 150);
      });
    },
  };
}
