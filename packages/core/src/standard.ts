import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { StandardEnvDefinition, StandardValidationIssue, StandardValidationResult } from './types'

export function defineStandardEnv<T extends Omit<StandardEnvDefinition, '_standard'>>(
  definition: T,
): T & { readonly _standard: true } {
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

  return { ...definition, _standard: true as const }
}

export function isStandardEnvDefinition(
  def: unknown,
): def is StandardEnvDefinition {
  return def != null && typeof def === 'object' && '_standard' in def && (def as any)._standard === true
}

export async function validateStandardEnv(
  def: StandardEnvDefinition,
  rawEnv: Record<string, string>,
): Promise<StandardValidationResult> {
  const combinedShape: Record<string, StandardSchemaV1> = {
    ...def.server,
    ...def.client,
  }

  const errors: StandardValidationIssue[] = []
  const data: Record<string, unknown> = {}

  for (const [key, schema] of Object.entries(combinedShape)) {
    const result = await schema['~standard'].validate(rawEnv[key])

    if ('issues' in result && result.issues) {
      for (const issue of result.issues) {
        errors.push({
          message: issue.message,
          path: [key, ...(issue.path ?? [])],
        })
      }
    }
    else {
      data[key] = (result as { value: unknown }).value
    }
  }

  if (errors.length > 0) {
    return { success: false, data: null, errors }
  }

  return { success: true, data, errors: [] as const }
}
