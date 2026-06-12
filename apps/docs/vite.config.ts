import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { build } from "velite";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";

const { version: coreVersion } = JSON.parse(
  readFileSync(resolve(__dirname, "../../packages/core/package.json"), "utf-8"),
) as { version: string };

function velite(command: string): Plugin {
  const contentDir = resolve(__dirname, "src/content");

  return {
    name: "velite",

    async buildStart() {
      if (command === "build") return;
      await build({ logLevel: "warn" });
    },

    configureServer(server: ViteDevServer) {
      server.watcher.add(`${contentDir}/**/*.mdx`);

      server.watcher.on("change", async (file) => {
        if (!file.startsWith(contentDir)) return;
        await build({ logLevel: "warn" });
        const mod = server.moduleGraph.getModuleById(resolve(__dirname, ".velite/index.js"));
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      });
    },
  };
}

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/vite-env/" : "/",
  plugins: [tailwindcss(), velite(command), react()],
  define: {
    __CORE_VERSION__: JSON.stringify(coreVersion),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "#velite": fileURLToPath(new URL("./.velite", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
  },
}));
