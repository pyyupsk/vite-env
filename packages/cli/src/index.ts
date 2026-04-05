#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import { checkCommand } from './commands/check'
import { generateCommand } from './commands/generate'
import { typesCommand } from './commands/types'

const main = defineCommand({
  meta: {
    name: 'vite-env',
    description: 'The env.ts layer for Vite',
    version: '0.1.0',
  },
  subCommands: {
    check: checkCommand,
    generate: generateCommand,
    types: typesCommand,
  },
})

runMain(main)
