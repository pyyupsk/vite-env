import { env } from 'virtual:env/client'

// ── Render client env variables ─────────────────────────────────────────────

const app = document.querySelector<HTMLDivElement>('#app')!

const title = document.createElement('h1')
title.textContent = env.VITE_APP_NAME

const subtitle = document.createElement('p')
subtitle.className = 'subtitle'
subtitle.textContent = 'Typed environment variables from virtual:env/client'

app.appendChild(title)
app.appendChild(subtitle)

// ── Client variables section ────────────────────────────────────────────────

const clientSection = document.createElement('section')
const clientHeading = document.createElement('h2')
clientHeading.textContent = 'Client Variables'
clientSection.appendChild(clientHeading)

const clientGrid = document.createElement('div')
clientGrid.className = 'env-grid'

const clientVars: Array<[string, unknown]> = [
  ['VITE_API_URL', env.VITE_API_URL],
  ['VITE_APP_NAME', env.VITE_APP_NAME],
  ['VITE_DEBUG', env.VITE_DEBUG],
  ['VITE_LOG_LEVEL', env.VITE_LOG_LEVEL],
]

for (const [key, value] of clientVars) {
  const row = document.createElement('div')
  row.className = 'env-row'

  const keyEl = document.createElement('span')
  keyEl.className = 'env-key'
  keyEl.textContent = key

  const valueWrapper = document.createElement('span')
  const valueEl = document.createElement('span')
  valueEl.className = 'env-value'
  valueEl.textContent = JSON.stringify(value)

  const typeEl = document.createElement('span')
  typeEl.className = 'env-type'
  typeEl.textContent = typeof value

  valueWrapper.appendChild(valueEl)
  valueWrapper.appendChild(typeEl)
  row.appendChild(keyEl)
  row.appendChild(valueWrapper)
  clientGrid.appendChild(row)
}

clientSection.appendChild(clientGrid)
app.appendChild(clientSection)

// ── Server access protection demo ───────────────────────────────────────────

const guardSection = document.createElement('section')
const guardHeading = document.createElement('h2')
guardHeading.textContent = 'Runtime Access Protection'
guardSection.appendChild(guardHeading)

const guardNote = document.createElement('div')
guardNote.className = 'warning'
guardNote.textContent
  = '// Importing virtual:env/server from client code triggers the guard.\n'
    + '// With onClientAccessOfServerModule: \'error\' → build fails.\n'
    + '// With \'warn\' → build succeeds with exit code 1.\n'
    + '// With \'stub\' → module throws at runtime.\n'
    + '//\n'
    + '// Uncomment the import in src/server-leak.ts and rebuild to see it in action.'
guardSection.appendChild(guardNote)
app.appendChild(guardSection)

// ── Footer ──────────────────────────────────────────────────────────────────

const footer = document.createElement('footer')
const footerText = document.createTextNode('Built with ')
const footerLink = document.createElement('a')
footerLink.href = 'https://github.com/pyyupsk/vite-env'
footerLink.textContent = '@vite-env/core'
const footerSuffix = document.createTextNode(' — the env.ts layer for Vite')
footer.appendChild(footerText)
footer.appendChild(footerLink)
footer.appendChild(footerSuffix)
app.appendChild(footer)
