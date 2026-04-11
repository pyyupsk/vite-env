import type { EnvDefinition } from './types'
import { createJiti } from 'jiti'

export async function loadEnvConfig(configPath: string): Promise<EnvDefinition> {
  const jiti = createJiti(configPath)
  const mod = await jiti.import<Record<string, unknown>>(configPath)
  const def: unknown = mod.default ?? mod

  if (!def || typeof def !== 'object') {
    throw new Error(
      `[vite-env] env config at ${configPath} must export an object (got ${typeof def}).\n`
      + `  Use: export default defineEnv({ ... })`,
    )
  }

  return def as EnvDefinition
}
