import ViteEnv from "@vite-env/core/plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    ViteEnv({
      configFile: "./env.ts",
      // 'ssr' is the default — the SSR entry may import virtual:env/server,
      // the client environment never can.
      serverEnvironments: ["ssr"],
    }),
  ],
});
