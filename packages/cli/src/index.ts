#!/usr/bin/env node
import { createRequire } from 'node:module'
import { defineCommand, runMain } from 'citty'
import { checkCommand } from './commands/check'
import { generateCommand } from './commands/generate'
import { typesCommand } from './commands/types'

const require = createRequire(import.meta.url)
const { version } = require('../package.json') as { version: string }

const main = defineCommand({
  meta: {
    name: 'vite-env',
    description: 'The env.ts layer for Vite',
    version,
  },
  subCommands: {
    check: checkCommand,
    generate: generateCommand,
    types: typesCommand,
  },
})

runMain(main)
