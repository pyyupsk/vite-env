import type { EnvDefinition, EnvPreset, ValidationResult } from "./types";
import { z } from "zod";

const detectCache = new Map<
  (env: Record<string, string | undefined>) => boolean,
  Map<string, boolean>
>();

type DefineEnvInput = {
  presets?: EnvPreset[];
  clientPrefix?: string | string[];
} & EnvDefinition;

function normalizeClientPrefix(prefix?: string | string[]): string[] {
  if (!prefix) return ["VITE_"];
  return Array.isArray(prefix) ? prefix : [prefix];
}

function buildPrefixErrorMessage(key: string, prefixes: string[]): string {
  const prefixList = prefixes.join(" or ");
  return (
    `[vite-env] Client env var "${key}" must be prefixed with ${prefixList}.\n` +
    `  Rename it to "${prefixes[0]}${key}" or move it to "server" if it's secret.`
  );
}

function warnSideConflicts(
  keys: string[],
  seen: Set<string>,
  userKeys: Set<string>,
  side: "server" | "client",
): void {
  for (const key of keys) {
    const duplicate = seen.has(key);
    if (duplicate)
      console.warn(`[vite-env] "${key}" is defined in multiple presets. The last preset wins.`);
    seen.add(key);
    if (!duplicate && userKeys.has(key))
      console.warn(
        `[vite-env] "${key}" is defined in both a preset and your ${side} config. Your definition wins.`,
      );
  }
}

function warnConflicts(
  presets: EnvPreset[],
  userServerKeys: Set<string>,
  userClientKeys: Set<string>,
): void {
  const seenServerKeys = new Set<string>();
  const seenClientKeys = new Set<string>();

  for (const preset of presets) {
    warnSideConflicts(Object.keys(preset.server ?? {}), seenServerKeys, userServerKeys, "server");
    warnSideConflicts(Object.keys(preset.client ?? {}), seenClientKeys, userClientKeys, "client");
  }
}

export function defineEnv<T extends DefineEnvInput>(
  definition: T,
): Omit<T, "presets"> & Pick<EnvDefinition, "server" | "client" | "presets" | "clientPrefix"> {
  const { presets = [], server, client, clientPrefix, ...rest } = definition;
  // ...rest intentionally forwarded — T may carry extra keys beyond EnvDefinition

  const hasExplicitClientPrefix = definition.clientPrefix !== undefined;
  const prefixes = normalizeClientPrefix(clientPrefix);

  const mergedServer: z.ZodRawShape = Object.assign(
    {},
    ...presets.map((p) => p.server ?? {}),
    server,
  );
  const mergedClient: z.ZodRawShape = Object.assign(
    {},
    ...presets.map((p) => p.client ?? {}),
    client,
  );

  // Check if presets have client keys (they enforce default VITE_ prefix)
  const presetsHaveClientKeys = presets.some((p) => p.client && Object.keys(p.client).length > 0);

  warnConflicts(presets, new Set(Object.keys(server ?? {})), new Set(Object.keys(client ?? {})));

  // Validate prefix at definition time if:
  // - Explicit clientPrefix provided (validate against that prefix)
  // - OR presets have client keys (validate against default VITE_ prefix)
  // Otherwise defer ALL validation to runtime (plugin applies Vite config fallback first)
  const shouldValidateNow = hasExplicitClientPrefix || presetsHaveClientKeys;
  if (shouldValidateNow) {
    for (const key of Object.keys(mergedClient)) {
      if (!prefixes.some((p) => key.startsWith(p))) {
        throw new Error(buildPrefixErrorMessage(key, prefixes));
      }
    }
  }

  const result: Record<string, unknown> = { ...rest };
  if (Object.keys(mergedServer).length > 0 || server !== undefined) result.server = mergedServer;
  if (Object.keys(mergedClient).length > 0 || client !== undefined) result.client = mergedClient;
  if (presets.length > 0) result.presets = presets;
  if (hasExplicitClientPrefix) result.clientPrefix = prefixes;

  return result as Omit<T, "presets"> & Pick<EnvDefinition, "presets">;
}

export function validateEnv(def: EnvDefinition, rawEnv: Record<string, string>): ValidationResult {
  const combinedShape: Record<string, z.ZodType> = {
    ...def.server,
    ...def.client,
  } as Record<string, z.ZodType>;

  // Undetected-platform preset vars validate as optional — they only exist on
  // the platform; requiring them would break local dev. User overrides stay strict.
  // Mutating combinedShape also prevents double-wrapping when two undetected
  // presets share a key: after the first wrap, the identity check fails.
  for (const preset of def.presets ?? []) {
    if (!preset.detect) continue;
    const envKey = JSON.stringify(rawEnv);
    let innerCache = detectCache.get(preset.detect);
    if (!innerCache) {
      innerCache = new Map();
      detectCache.set(preset.detect, innerCache);
    }
    let detected = innerCache.get(envKey);
    if (detected === undefined) {
      detected = preset.detect(rawEnv);
      innerCache.set(envKey, detected);
    }
    if (detected) continue;
    for (const side of [preset.server, preset.client]) {
      for (const [key, presetSchema] of Object.entries(side ?? {})) {
        if (combinedShape[key] === presetSchema)
          combinedShape[key] = z.optional(combinedShape[key]);
      }
    }
  }

  const schema = z.object(combinedShape);
  const result = schema.safeParse(rawEnv);

  if (result.success) {
    return { success: true, data: result.data, errors: [] as const };
  }

  return {
    success: false,
    data: null,
    errors: result.error.issues,
  };
}
