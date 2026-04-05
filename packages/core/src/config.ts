import type { EnvDefinition } from './types'
import { createJiti } from 'jiti'

export async function loadEnvConfig(configPath: string): Promise<EnvDefinition> {
  const jiti = createJiti(configPath)
  const mod = await jiti.import(configPath) as any
  return (mod.default ?? mod) as EnvDefinition
}
