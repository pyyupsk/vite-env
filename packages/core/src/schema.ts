import type { EnvDefinition, ValidationResult } from './types'
import { z } from 'zod'

export function defineEnv(definition: EnvDefinition): EnvDefinition {
  if (definition.client) {
    for (const key of Object.keys(definition.client)) {
      if (!key.startsWith('VITE_')) {
        throw new Error(
          `[vite-env] Client env var "${key}" must be prefixed with VITE_.\n`
          + `  Rename it to "VITE_${key}" or move it to "server" if it's secret.`,
        )
      }
    }
  }
  return definition
}

export function validateEnv(
  def: EnvDefinition,
  rawEnv: Record<string, string>,
): ValidationResult {
  const combinedShape = {
    ...def.server,
    ...def.client,
    ...def.shared,
  }

  const schema = z.object(combinedShape)
  const result = schema.safeParse(rawEnv)

  if (result.success) {
    return { success: true, data: result.data, errors: [] }
  }

  return {
    success: false,
    data: null,
    errors: result.error.issues,
  }
}
