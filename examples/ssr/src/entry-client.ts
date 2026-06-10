import { env } from 'virtual:env/client'

const card = document.getElementById('client-card')!
card.textContent = `client sees only: ${Object.keys(env).join(', ')}`
