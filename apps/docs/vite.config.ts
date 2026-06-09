import { defineConfig, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { build } from 'velite'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

function velite(): Plugin {
  const contentDir = resolve(__dirname, 'src/content')

  return {
    name: 'velite',

    async buildStart() {
      await build({ logLevel: 'warn' })
    },

    configureServer(server: ViteDevServer) {
      server.watcher.add(`${contentDir}/**/*.mdx`)

      server.watcher.on('change', async (file) => {
        if (!file.startsWith(contentDir)) return
        await build({ logLevel: 'warn' })
        const mod = server.moduleGraph.getModuleById(
          resolve(__dirname, '.velite/index.js'),
        )
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      })
    },
  }
}

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/vite-env/' : '/',
  plugins: [tailwindcss(), velite(), react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '#velite': fileURLToPath(new URL('./.velite', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
  },
}))
