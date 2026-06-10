import { env } from 'virtual:env/client'

document.getElementById('app')!.innerHTML = `
  <h1>${env.VITE_APP_NAME}</h1>
  <p>Railway vars (RAILWAY_SERVICE_ID, RAILWAY_PROJECT_ID, …) are server-only — validated at build, never bundled here.</p>
  <pre>${JSON.stringify(env, null, 2)}</pre>
`
