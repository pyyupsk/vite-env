import ViteEnv from "@vite-env/core/plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    ViteEnv({
      configFile: "./env.ts",

      // Environments allowed to import virtual:env/server.
      // Default is ['ssr']. The client environment is always blocked.
      allowedServerEnvironments: ["ssr"],

      // What happens when client code imports virtual:env/server.
      // 'error' = hard build failure (default)
      // 'warn'  = log warning + exit code 1
      // 'stub'  = returns module that throws at runtime (for isomorphic imports)
      onClientAccessOfServerModule: "warn",
    }),
  ],
});
