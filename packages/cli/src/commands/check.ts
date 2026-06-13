import type { AnyEnvDefinition } from "@vite-env/core";
import path from "node:path";
import process from "node:process";
import { isStandardEnvDefinition } from "@vite-env/core/standard";
import { defineCommand } from "citty";
import consola from "consola";
import { loadEnv } from "vite";

export function loadCliEnv(mode: string, root: string): Record<string, string> {
  const fileEnv = loadEnv(mode, root, "");
  const procEnv = Object.fromEntries(
    Object.entries(process.env).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
  return { ...fileEnv, ...procEnv };
}

export const checkCommand = defineCommand({
  meta: {
    description: "Validate environment variables without starting dev server",
  },
  args: {
    config: {
      type: "string",
      default: "env.ts",
      description: "Path to env definition file",
    },
    mode: { type: "string", default: "development", description: "Vite mode" },
  },
  async run({ args }) {
    const root = process.cwd();
    const configPath = path.resolve(root, args.config);

    let def: AnyEnvDefinition;
    try {
      const { loadEnvConfig } = await import("@vite-env/core/config");
      def = await loadEnvConfig(configPath);
    } catch (e) {
      consola.error(
        `Could not load env definition file at: ${configPath}\n` +
          `  Create an env.ts file and export default defineEnv({ ... }) or defineStandardEnv({ ... })`,
      );
      if (e instanceof Error) consola.error(e.message);
      process.exit(1);
    }

    const rawEnv = loadCliEnv(args.mode, root);

    let success: boolean;
    let count = 0;
    let errorMsg = "";

    if (isStandardEnvDefinition(def)) {
      const { validateStandardEnv } = await import("@vite-env/core/standard");
      const { formatStandardSchemaError } = await import("@vite-env/core/format");
      const result = await validateStandardEnv(def, rawEnv);
      success = result.success;
      if (result.success) count = Object.keys(result.data).length;
      else errorMsg = formatStandardSchemaError(result.errors);
    } else {
      const { validateEnv } = await import("@vite-env/core/schema");
      const { formatZodError } = await import("@vite-env/core/format");
      const result = validateEnv(def, rawEnv);
      success = result.success;
      if (result.success) count = Object.keys(result.data).length;
      else errorMsg = formatZodError(result.errors);
    }

    if (success) {
      consola.success(`${count} environment variables valid`);
      process.exit(0);
    } else {
      consola.error("Environment validation failed:");
      consola.log(errorMsg);
      process.exit(1);
    }
  },
});
