import type { StandardSchemaV1 } from "@standard-schema/spec";
import type {
  StandardEnvDefinition,
  StandardValidationIssue,
  StandardValidationResult,
} from "./types";

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

type StandardEnvInput = Omit<StandardEnvDefinition, "_standard"> & {
  clientPrefix?: string | string[];
};

type DefineStandardEnvResult<T extends StandardEnvInput> = T & {
  readonly _standard: true;
  clientPrefix: T extends { clientPrefix: infer P } ? P : undefined;
};

export function defineStandardEnv<T extends StandardEnvInput>(
  definition: T,
): DefineStandardEnvResult<T> {
  const { clientPrefix, ...rest } = definition;
  const hasExplicitClientPrefix = definition.clientPrefix !== undefined;
  const prefixes = normalizeClientPrefix(clientPrefix);

  const shouldValidateNow =
    hasExplicitClientPrefix || (rest.client && Object.keys(rest.client).length > 0);
  if (shouldValidateNow) {
    for (const key of Object.keys(rest.client ?? {})) {
      if (!prefixes.some((p) => key.startsWith(p))) {
        throw new Error(buildPrefixErrorMessage(key, prefixes));
      }
    }
  }

  const result = { ...rest, _standard: true as const };
  if (hasExplicitClientPrefix) {
    (result as Record<string, unknown>).clientPrefix = prefixes;
  }
  return result as DefineStandardEnvResult<T>;
}

export function isStandardEnvDefinition(def: unknown): def is StandardEnvDefinition {
  return (
    def != null &&
    typeof def === "object" &&
    "_standard" in def &&
    (def as Record<string, unknown>)._standard === true
  );
}

export async function validateStandardEnv(
  def: StandardEnvDefinition,
  rawEnv: Record<string, string>,
): Promise<StandardValidationResult> {
  const combinedShape: Record<string, StandardSchemaV1> = {
    ...def.server,
    ...def.client,
  };

  const errors: StandardValidationIssue[] = [];
  const data: Record<string, unknown> = {};

  for (const [key, schema] of Object.entries(combinedShape)) {
    const result = await schema["~standard"].validate(rawEnv[key]);

    if ("issues" in result && result.issues) {
      for (const issue of result.issues) {
        errors.push({
          message: issue.message,
          path: [key, ...(issue.path ?? [])],
        });
      }
    } else {
      data[key] = (result as { value: unknown }).value;
    }
  }

  if (errors.length > 0) {
    return { success: false, data: null, errors };
  }

  return { success: true, data, errors: [] as const };
}
