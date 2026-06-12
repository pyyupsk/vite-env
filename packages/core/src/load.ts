import type { EnvPreset, StandardEnvDefinition } from "./types";
import type { z } from "zod";
import process from "node:process";
import path from "node:path";
import { loadEnv as viteLoadEnv } from "vite";
import { isStandardEnvDefinition, validateStandardEnv } from "./standard";
import { validateEnv } from "./schema";

export type LoadEnvOptions = {
  mode?: string;
  envDir?: string;
};

type ZodShape = z.ZodRawShape;

type KnownKeys<T> = keyof { [K in keyof T as string extends K ? never : K]: T[K] };
type StripIndex<T extends ZodShape> = Pick<T, KnownKeys<T>>;

type InferShape<TServer extends ZodShape, TClient extends ZodShape> = {
  server: z.infer<z.ZodObject<StripIndex<TServer> & StripIndex<TClient>>>;
  client: z.infer<z.ZodObject<StripIndex<TClient>>>;
  all: z.infer<z.ZodObject<StripIndex<TServer> & StripIndex<TClient>>>;
};

export async function loadEnv<
  TServer extends ZodShape = Record<never, never>,
  TClient extends ZodShape = Record<never, never>,
>(
  config: { server?: TServer; client?: TClient; presets?: EnvPreset[] },
  options?: LoadEnvOptions,
): Promise<InferShape<TServer, TClient>>;

export async function loadEnv(
  config: StandardEnvDefinition,
  options?: LoadEnvOptions,
): Promise<{
  server: Record<string, unknown>;
  client: Record<string, unknown>;
  all: Record<string, unknown>;
}>;

export async function loadEnv(
  config: { server?: ZodShape; client?: ZodShape; presets?: EnvPreset[] } | StandardEnvDefinition,
  options: LoadEnvOptions = {},
): Promise<{
  server: Record<string, unknown>;
  client: Record<string, unknown>;
  all: Record<string, unknown>;
}> {
  const mode = options.mode ?? process.env["NODE_ENV"] ?? "development";
  const envDir = options.envDir ? path.resolve(options.envDir) : process.cwd();

  const fileEnv = viteLoadEnv(mode, envDir, "");
  const rawEnv: Record<string, string> = {
    ...fileEnv,
    ...filterStrings(process.env),
  };

  if (isStandardEnvDefinition(config)) {
    const result = await validateStandardEnv(config, rawEnv);
    if (!result.success) throwValidationError(result.errors.map((e) => e.message));

    const server = Object.freeze(result.data);
    const clientKeys = new Set(Object.keys(config.client ?? {}));
    const client = Object.freeze(filterByKeys(server, clientKeys));

    return { server, client, all: server };
  }

  const result = validateEnv(config, rawEnv);
  if (!result.success) throwValidationError(result.errors.map((e) => e.message));

  const server = Object.freeze(result.data);
  const clientKeys = new Set(Object.keys(config.client ?? {}));
  const client = Object.freeze(filterByKeys(server, clientKeys));

  return { server, client, all: server };
}

function filterByKeys(data: Record<string, unknown>, keys: Set<string>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(data).filter(([k]) => keys.has(k)));
}

function filterStrings(env: NodeJS.ProcessEnv): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).filter((e): e is [string, string] => typeof e[1] === "string"),
  );
}

function throwValidationError(messages: string[]): never {
  const lines = messages.map((m) => "  - " + m).join("\n");
  throw new Error("[vite-env] Validation failed:\n" + lines);
}
