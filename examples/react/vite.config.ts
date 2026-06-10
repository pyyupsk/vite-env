import react from "@vitejs/plugin-react";
import ViteEnv from "@vite-env/core/plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), ViteEnv({ configFile: "./env.ts" })],
});
