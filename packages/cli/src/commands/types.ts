import path from "node:path";
import process from "node:process";
import { isStandardEnvDefinition } from "@vite-env/core/standard";
import { defineCommand } from "citty";
import consola from "consola";
import { loadDef } from "./utils";

export const typesCommand = defineCommand({
  meta: { description: "Regenerate vite-env.d.ts from your env.ts schema" },
  args: {
    config: { type: "string", default: "env.ts" },
  },
  async run({ args }) {
    const root = process.cwd();
    const configPath = path.resolve(root, args.config);

    const def = await loadDef(configPath);

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
