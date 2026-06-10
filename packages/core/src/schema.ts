import type { EnvDefinition, EnvPreset, ValidationResult } from './types'
import { z } from 'zod'

type DefineEnvInput = {
  presets?: EnvPreset[]
} & EnvDefinition

function warnSideConflicts(
  keys: string[],
  seen: Set<string>,
  userKeys: Set<string>,
  side: 'server' | 'client',
): void {
  for (const key of keys) {
    const duplicate = seen.has(key)
    if (duplicate)
      console.warn(`[vite-env] "${key}" is defined in multiple presets. The last preset wins.`)
    seen.add(key)
    if (!duplicate && userKeys.has(key))
      console.warn(`[vite-env] "${key}" is defined in both a preset and your ${side} config. Your definition wins.`)
  }
}

function warnConflicts(
  presets: EnvPreset[],
  userServerKeys: Set<string>,
  userClientKeys: Set<string>,
): void {
  const seenServerKeys = new Set<string>()
  const seenClientKeys = new Set<string>()

  for (const preset of presets) {
    warnSideConflicts(Object.keys(preset.server ?? {}), seenServerKeys, userServerKeys, 'server')
    warnSideConflicts(Object.keys(preset.client ?? {}), seenClientKeys, userClientKeys, 'client')
  }
}

export function defineEnv<T extends DefineEnvInput>(definition: T): Omit<T, 'presets'> & Pick<EnvDefinition, 'server' | 'client' | 'presets'> {
  const { presets = [], server, client, ...rest } = definition
  // ...rest intentionally forwarded — T may carry extra keys beyond EnvDefinition

  const mergedServer: z.ZodRawShape = Object.assign({}, ...presets.map(p => p.server ?? {}), server)
  const mergedClient: z.ZodRawShape = Object.assign({}, ...presets.map(p => p.client ?? {}), client)

  warnConflicts(
    presets,
    new Set(Object.keys(server ?? {})),
    new Set(Object.keys(client ?? {})),
  )

  for (const key of Object.keys(mergedClient)) {
    if (!key.startsWith('VITE_')) {
      throw new Error(
        `[vite-env] Client env var "${key}" must be prefixed with VITE_.\n`
        + `  Rename it to "VITE_${key}" or move it to "server" if it's secret.`,
      )
    }
  }

  const result: Record<string, unknown> = { ...rest }
  if (Object.keys(mergedServer).length > 0 || server !== undefined)
    result.server = mergedServer
  if (Object.keys(mergedClient).length > 0 || client !== undefined)
    result.client = mergedClient
  if (presets.length > 0)
    result.presets = presets

  return result as Omit<T, 'presets'> & Pick<EnvDefinition, 'presets'>
}

export function validateEnv(
  def: EnvDefinition,
  rawEnv: Record<string, string>,
): ValidationResult {
  const combinedShape: Record<string, z.ZodType> = {
    ...def.server,
    ...def.client,
  } as Record<string, z.ZodType>

  // Undetected-platform preset vars validate as optional — they only exist on
  // the platform; requiring them would break local dev. User overrides stay strict.
  for (const preset of def.presets ?? []) {
    if (!preset.detect || preset.detect(rawEnv))
      continue
    for (const side of [preset.server, preset.client]) {
      for (const [key, presetSchema] of Object.entries(side ?? {})) {
        if (combinedShape[key] === presetSchema)
          combinedShape[key] = z.optional(combinedShape[key])
      }
    }
  }

  const schema = z.object(combinedShape)
  const result = schema.safeParse(rawEnv)

  if (result.success) {
    return { success: true, data: result.data, errors: [] as const }
  }

  return {
    success: false,
    data: null,
    errors: result.error.issues,
  }
}
