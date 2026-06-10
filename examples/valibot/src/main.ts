import { env } from 'virtual:env/client'

const app = document.querySelector<HTMLDivElement>('#app')!

const title = document.createElement('h1')
title.textContent = env.VITE_APP_NAME

const subtitle = document.createElement('p')
subtitle.textContent = 'Validated with Valibot via Standard Schema (defineStandardEnv)'

const pre = document.createElement('pre')
pre.textContent = JSON.stringify(env, null, 2)

app.appendChild(title)
app.appendChild(subtitle)
app.appendChild(pre)
