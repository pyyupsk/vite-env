import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-semibold tracking-tight">Hello vite-env</h1>
    </main>
  </StrictMode>,
)
