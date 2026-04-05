// @env node
import type { ResolvedConfig } from 'vite'
import process from 'node:process'
import { loadEnv } from 'vite'

/**
 * Merge priority (highest → lowest):
 *   1. process.env        (CI pipeline secrets win)
 *   2. .env.[mode].local
 *   3. .env.[mode]
 *   4. .env.local
 *   5. .env
 *
 * Prefix '' = load everything, schema decides what's valid.
 */
export async function loadEnvSources(
  config: ResolvedConfig,
): Promise<Record<string, string>> {
  const fileEnv = loadEnv(
    config.mode,
    config.envDir || config.root,
    '', // no prefix filter — schema is the filter
  )

  return {
    ...fileEnv,
    ...filterStrings(process.env),
  }
}

function filterStrings(env: NodeJS.ProcessEnv): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  )
}
