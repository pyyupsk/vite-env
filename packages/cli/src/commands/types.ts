import type { AnyEnvDefinition } from "@vite-env/core";
import path from "node:path";
import process from "node:process";
import { isStandardEnvDefinition } from "@vite-env/core/standard";
import { defineCommand } from "citty";
import consola from "consola";

export const typesCommand = defineCommand({
  meta: { description: "Regenerate vite-env.d.ts from your env.ts schema" },
  args: {
    config: { type: "string", default: "env.ts" },
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

    if (isStandardEnvDefinition(def)) {
      const { generateStandardDts } = await import("@vite-env/core/dts");
      await generateStandardDts(def, root);
    } else {
      const { generateDts } = await import("@vite-env/core/dts");
      await generateDts(def, root);
    }
    consola.success("Generated vite-env.d.ts");
  },
});
