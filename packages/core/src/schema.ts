import type { EnvDefinition, EnvPreset, ValidationError, ValidationResult } from "./types";
import { z } from "zod";

const DETECT_CACHE_LIMIT = 32;

const detectCache = new WeakMap<
  (env: Record<string, string | undefined>) => boolean,
  Map<string, boolean>
>();

type DefineEnvInput = {
  server?: EnvDefinition["server"]; // nosonar
  client?: EnvDefinition["client"]; // nosonar
  presets?: EnvPreset[];
  clientPrefix?: string | string[];
};

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

export function defineEnv(
  definition: DefineEnvInput,
): EnvDefinition & { presets?: EnvPreset[]; clientPrefix?: string[] } {
  const { presets = [], server, client, clientPrefix } = definition;

  const allowedKeys = new Set(["server", "client", "presets", "clientPrefix"]);
  const unknownKeys = Object.keys(definition).filter((k) => !allowedKeys.has(k));
  if (unknownKeys.length > 0) {
    throw new Error(
      `[vite-env] Unknown keys in defineEnv(): ${unknownKeys.join(", ")}.\n` +
        `  Only "server", "client", "presets", and "clientPrefix" are allowed.\n` +
        `  Move extra keys to a separate config file or use "presets" for shared configuration.`,
    );
  }

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

  const result: EnvDefinition & { presets?: EnvPreset[]; clientPrefix?: string[] } = {};
  if (Object.keys(mergedServer).length > 0 || server !== undefined) result.server = mergedServer;
  if (Object.keys(mergedClient).length > 0 || client !== undefined) result.client = mergedClient;
  if (presets.length > 0) result.presets = presets;
  if (hasExplicitClientPrefix) result.clientPrefix = prefixes;

  return result;
}

function getCachedDetect(
  detectFn: (env: Record<string, string | undefined>) => boolean,
  rawEnv: Record<string, string>,
): boolean {
  const envKey = JSON.stringify(rawEnv);
  let innerCache = detectCache.get(detectFn);
  if (!innerCache) {
    innerCache = new Map();
    detectCache.set(detectFn, innerCache);
  }
  let detected = innerCache.get(envKey);
  if (detected === undefined) {
    detected = detectFn(rawEnv);
    if (innerCache.size >= DETECT_CACHE_LIMIT) {
      innerCache.clear();
    }
    innerCache.set(envKey, detected);
  }
  return detected;
}

function applyOptionalPresetKeys(
  combinedShape: Record<string, z.ZodType>,
  preset: EnvPreset,
): void {
  for (const side of [preset.server, preset.client]) {
    for (const [key, presetSchema] of Object.entries(side ?? {})) {
      if (combinedShape[key] === presetSchema) {
        combinedShape[key] = z.optional(combinedShape[key]);
      }
    }
  }
}

function processPresets(
  combinedShape: Record<string, z.ZodType>,
  presets: EnvPreset[],
  rawEnv: Record<string, string>,
): void {
  for (const preset of presets) {
    if (!preset.detect) continue;
    if (getCachedDetect(preset.detect, rawEnv)) continue;
    applyOptionalPresetKeys(combinedShape, preset);
  }
}

function zodPathToPath(zodPath: readonly PropertyKey[]): (string | number)[] {
  return zodPath.map((p) => {
    if (typeof p === "symbol") return String(p);
    return p;
  });
}

export function zodIssuesToValidationErrors(issues: z.core.$ZodIssue[]): ValidationError[] {
  return issues.map((issue) => ({
    message: issue.message,
    path: zodPathToPath(issue.path),
    code: issue.code,
  }));
}

export function validateEnv(def: EnvDefinition, rawEnv: Record<string, string>): ValidationResult {
  const combinedShape: Record<string, z.ZodType> = {
    ...def.server,
    ...def.client,
  } as Record<string, z.ZodType>;

  processPresets(combinedShape, def.presets ?? [], rawEnv);

  const schema = z.object(combinedShape);
  const result = schema.safeParse(rawEnv);

  if (result.success) {
    return { success: true, data: result.data, errors: [] as const };
  }
  return {
    success: false,
    data: null,
    errors: zodIssuesToValidationErrors(result.error.issues),
  };
}
