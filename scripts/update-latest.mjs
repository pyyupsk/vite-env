#!/usr/bin/env node
// scripts/update-latest.mjs
// Runs as postrelease — updates the "latest stable" text in versions.mjs to
// match the newly bumped version so the NextBanner shows the correct version.

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const corePackageJson = path.join(root, 'packages/core/package.json')
const versionsFile = path.join(root, 'packages/docs/.vitepress/versions.mjs')

const version = JSON.parse(fs.readFileSync(corePackageJson, 'utf-8')).version
const content = fs.readFileSync(versionsFile, 'utf-8')

// Update the (current) entry text to the new version
const updated = content.replace(
  /v\d+\.\d+\.\d+ \(current\)/,
  `v${version} (current)`,
)

if (updated === content) {
  console.log(`ℹ️  versions.mjs already reflects v${version}`)
  process.exit(0)
}

function run(cmd, args) {
  const result = spawnSync(cmd, args, { cwd: root, stdio: 'inherit' })
  if (result.status !== 0)
    process.exit(result.status ?? 1)
}

fs.writeFileSync(versionsFile, updated, 'utf-8')
run('git', ['add', versionsFile])
run('git', ['commit', '-m', `chore: update latest stable to v${version}`])
run('git', ['push'])
console.log(`✅ Latest stable updated to v${version}`)
