import { env } from 'virtual:env/client'

const app = document.querySelector<HTMLDivElement>('#app')!

const title = document.createElement('h1')
title.textContent = env.VITE_APP_NAME

const entries = [
  ['API URL', env.VITE_API_URL],
  ['Debug', `${env.VITE_DEBUG} (${typeof env.VITE_DEBUG})`],
  ['Log Level', env.VITE_LOG_LEVEL],
  ['Node Env', env.VITE_NODE_ENV],
] as const

app.appendChild(title)

for (const [label, value] of entries) {
  const p = document.createElement('p')
  p.textContent = `${label}: `
  const code = document.createElement('code')
  code.textContent = String(value)
  p.appendChild(code)
  app.appendChild(p)
}
