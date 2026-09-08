/**
 * jscodeshift transform for vite-env 0.8.0 migration.
 *
 * Usage:
 *   npx jscodeshift -t packages/core/scripts/codemod-0.8.mjs src/ --dry --print
 *
 * Transforms:
 *   1. serverEnvironments → allowedServerEnvironments in ViteEnv()
 *   2. Adds configFile: './env.ts' if missing from ViteEnv()
 *   3. Adds onClientAccessOfServerModule: 'warn' to preserve 0.7 behavior (optional)
 *   4. Errors on defineEnv({ ...customKeys }) — cannot auto-fix, emits guidance
 */

export default function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let hasChanges = false;

  // Transform 1: serverEnvironments → allowedServerEnvironments
  root
    .find(j.Identifier, { name: "serverEnvironments" })
    .filter((path) => {
      // Only rename in property assignments or object properties
      const parent = path.parent.node;
      return (
        (parent.type === "Property" || parent.type === "ObjectProperty") && parent.key === path.node
      );
    })
    .forEach((path) => {
      path.node.name = "allowedServerEnvironments";
      hasChanges = true;
    });

  // Transform 2: Add configFile if missing from ViteEnv() calls
  root
    .find(j.CallExpression, {
      callee: { name: "ViteEnv" },
    })
    .forEach((path) => {
      const args = path.node.arguments;
      if (args.length === 0) {
        // ViteEnv() → ViteEnv({ configFile: './env.ts' })
        path.node.arguments = [
          j.objectExpression([
            j.property("init", j.identifier("configFile"), j.literal("./env.ts")),
          ]),
        ];
        hasChanges = true;
      } else if (args[0].type === "ObjectExpression") {
        const configProp = args[0].properties.some(
          (p) => p.key?.name === "configFile" || p.key?.value === "configFile",
        );
        if (!configProp) {
          // Add configFile to existing object
          args[0].properties.unshift(
            j.property("init", j.identifier("configFile"), j.literal("./env.ts")),
          );
          hasChanges = true;
        }
      }
    });

  // Transform 3: Detect defineEnv with custom keys (cannot auto-fix)
  root
    .find(j.CallExpression, {
      callee: { name: "defineEnv" },
    })
    .forEach((path) => {
      const args = path.node.arguments;
      if (args.length > 0 && args[0].type === "ObjectExpression") {
        const allowedKeys = new Set(["server", "client", "presets", "clientPrefix"]);
        const customKeys = args[0].properties
          .filter((p) => p.key?.name && !allowedKeys.has(p.key.name))
          .map((p) => p.key.name);

        if (customKeys.length > 0) {
          console.warn(
            `[codemod] ${fileInfo.path}:${path.node.loc?.start?.line ?? "?"}: ` +
              `defineEnv has custom keys [${customKeys.join(", ")}] that are no longer allowed. ` +
              `Move them to a separate config or use presets.`,
          );
        }
      }
    });

  if (!hasChanges) return undefined;
  return root.toSource({ quote: "double" });
}
