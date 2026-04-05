import type { EnvDefinition } from './types'

interface LeakReport {
  key: string
  chunk: string
}

/**
 * Scans all client-destined chunks for literal values of server-only vars.
 * Fires in generateBundle() — Rolldown sequential hook, safe.
 *
 * Strategy: for each server-only key, check if its actual runtime value
 * appears as a literal string in any output chunk's source code.
 * Short/common values (< 8 chars) are skipped to avoid false positives.
 */
export function detectServerLeak(
  def: EnvDefinition,
  data: Record<string, unknown>,
  bundle: Record<string, { type: string, code?: string }>,
): LeakReport[] {
  const serverKeys = new Set(Object.keys(def.server ?? {}))
  const leaks: LeakReport[] = []

  for (const [key, value] of Object.entries(data)) {
    if (!serverKeys.has(key))
      continue
    if (typeof value !== 'string')
      continue
    if (value.length < 8)
      continue // too short to reliably detect

    for (const [chunkName, chunk] of Object.entries(bundle)) {
      if (chunk.type !== 'chunk')
        continue
      if (!chunk.code)
        continue
      if (chunk.code.includes(value)) {
        leaks.push({ key, chunk: chunkName })
      }
    }
  }

  return leaks
}
