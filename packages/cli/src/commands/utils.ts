import type { AnyEnvDefinition } from "@vite-env/core";
import process from "node:process";
import consola from "consola";

export async function loadDef(configPath: string): Promise<AnyEnvDefinition> {
  try {
    const { loadEnvConfig } = await import("@vite-env/core/config");
    return await loadEnvConfig(configPath);
  } catch (e) {
    consola.error(
      `Could not load env definition file at: ${configPath}\n` +
        `  Create an env.ts file and export default defineEnv({ ... }) or defineStandardEnv({ ... })`,
    );
    if (e instanceof Error) consola.error(e.message);
    process.exit(1);
  }
}
