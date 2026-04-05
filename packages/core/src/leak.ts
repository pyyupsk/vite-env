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

  const serverSecrets = Object.entries(data).filter(
    (entry): entry is [string, string] =>
      serverKeys.has(entry[0])
      && typeof entry[1] === 'string'
      && entry[1].length >= 8,
  )

  const chunks = Object.entries(bundle).filter(
    ([, chunk]) => chunk.type === 'chunk' && !!chunk.code,
  )

  const leaks: LeakReport[] = []
  for (const [key, value] of serverSecrets) {
    for (const [chunkName, chunk] of chunks) {
      if (chunk.code!.includes(value)) {
        leaks.push({ key, chunk: chunkName })
      }
    }
  }

  return leaks
}
