import { env } from 'virtual:env/server'

export function render(): string {
  return `
    <h1>${env.VITE_APP_NAME}</h1>
    <p>The server entry imports <code>virtual:env/server</code> — all vars, server + client.</p>
    <div class="card">SSR_GREETING = ${JSON.stringify(env.SSR_GREETING)}</div>
    <div class="card">DATABASE_URL host = ${new URL(env.DATABASE_URL).host} (secret stays on the server)</div>
    <div class="card" id="client-card">waiting for client…</div>
  `
}
