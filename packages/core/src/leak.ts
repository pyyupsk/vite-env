import type { AnyEnvDefinition } from "./types";

type LeakReport = {
  key: string;
  chunk: string;
};

/**
 * Scans client-destined chunks for server-only var values appearing as quoted
 * string literals. Bare substring matches are ignored — only quoted literals
 * indicate a real bundler-inlined leak. Values < 8 chars are skipped.
 */
export function detectServerLeak(
  def: AnyEnvDefinition,
  data: Record<string, unknown>,
  bundle: Record<string, { type: string; code?: string }>,
  onSkipped?: (keys: string[]) => void,
): LeakReport[] {
  const serverKeys = new Set(Object.keys(def.server ?? {}));

  const shortSecrets = Object.entries(data).filter(
    (entry): entry is [string, string] =>
      serverKeys.has(entry[0]) && typeof entry[1] === "string" && entry[1].length < 8,
  );

  if (shortSecrets.length > 0 && onSkipped) {
    onSkipped(shortSecrets.map(([k]) => k));
  }

  const serverSecrets = Object.entries(data).filter(
    (entry): entry is [string, string] =>
      serverKeys.has(entry[0]) && typeof entry[1] === "string" && entry[1].length >= 8,
  );

  const chunks = Object.entries(bundle).filter(
    ([, chunk]) => chunk.type === "chunk" && !!chunk.code,
  );

  const leaks: LeakReport[] = [];
  for (const [key, value] of serverSecrets) {
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    const pattern = new RegExp(`(["'\`])${escaped}\\1`);
    for (const [chunkName, chunk] of chunks) {
      if (pattern.test(chunk.code!)) {
        leaks.push({ key, chunk: chunkName });
      }
    }
  }

  return leaks;
}
