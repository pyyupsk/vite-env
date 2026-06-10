import fs from 'node:fs'
import http from 'node:http'
import { createServer } from 'vite'

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
})

const server = http.createServer((req, res) => {
  vite.middlewares(req, res, async () => {
    try {
      const template = await vite.transformIndexHtml(req.url, fs.readFileSync('index.html', 'utf-8'))
      const { render } = await vite.ssrLoadModule('/src/entry-server.ts')
      const html = template.replace('<!--ssr-outlet-->', render())
      res.setHeader('Content-Type', 'text/html')
      res.end(html)
    }
    catch (e) {
      vite.ssrFixStacktrace(e)
      res.statusCode = 500
      res.end(e.stack)
    }
  })
})

server.listen(5173, () => {
  console.log('ssr example running at http://localhost:5173')
})
