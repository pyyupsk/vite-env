import type { AnyEnvDefinition, EnvDefinition, InferClientEnv, InferServerEnv } from "./types";
import process from "node:process";
import path from "node:path";
import { loadEnv as viteLoadEnv } from "vite";
import { isStandardEnvDefinition, validateStandardEnv } from "./standard";
import { validateEnv } from "./schema";

export type LoadEnvOptions = {
  mode?: string;
  envDir?: string;
};

export type LoadEnvResult<T extends EnvDefinition> = {
  server: InferServerEnv<T>;
  client: InferClientEnv<T>;
  all: InferServerEnv<T>;
};

export async function loadEnv<T extends AnyEnvDefinition>(
  config: T,
  options: LoadEnvOptions = {},
): Promise<
  T extends EnvDefinition
    ? LoadEnvResult<T>
    : {
        server: Record<string, unknown>;
        client: Record<string, unknown>;
        all: Record<string, unknown>;
      }
> {
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

    const clientKeys = new Set(Object.keys(config.client ?? {}));
    const client = filterByKeys(result.data, clientKeys);
    const server = result.data;

    return { server, client, all: server } as never;
  }

  const def: EnvDefinition = config;
  const result = validateEnv(def, rawEnv);
  if (!result.success) throwValidationError(result.errors.map((e) => e.message));

  const clientKeys = new Set(Object.keys(def.client ?? {}));
  const client = filterByKeys(result.data, clientKeys);
  const server = result.data;

  return { server, client, all: server } as never;
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
