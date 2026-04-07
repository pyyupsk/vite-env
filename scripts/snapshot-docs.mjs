#!/usr/bin/env node
// scripts/snapshot-docs.mjs
// Snapshots current docs into packages/docs/v{version}/ at release time.
// Run with --dry-run to preview all operations without writing anything.

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dryRun = process.argv.includes('--dry-run')

// Paths
const corePackageJson = path.join(root, 'packages/core/package.json')
const docsDir = path.join(root, 'packages/docs')
const versionsFile = path.join(docsDir, '.vitepress/versions.mjs')
const versionedSidebarsFile = path.join(docsDir, '.vitepress/versioned-sidebars.mjs')
const sidebarFile = path.join(docsDir, '.vitepress/sidebar.mjs')

// Read current version
const version = JSON.parse(fs.readFileSync(corePackageJson, 'utf-8')).version
const versionDir = path.join(docsDir, `v${version}`)

console.log(dryRun ? '🔍 Dry run — no files will be written.\n' : '')
console.log(`📸 Snapshotting docs v${version}...\n`)

// Idempotency guard
if (fs.existsSync(versionDir)) {
  console.warn(`⚠️  Snapshot v${version} already exists at ${path.relative(root, versionDir)}. Skipping.`)
  process.exit(0)
}

// Helpers
function log(action, target) {
  console.log(`  ${action.padEnd(6)} ${path.relative(root, target)}`)
}

function copyFile(src, dest) {
  log('copy', dest)
  if (dryRun)
    return
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

function writeFile(dest, content) {
  log('write', dest)
  if (dryRun)
    return
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, content, 'utf-8')
}

function copyDir(src, dest) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory())
      copyDir(srcPath, destPath)
    else copyFile(srcPath, destPath)
  }
}

function rewriteContentLinks(content, prefix) {
  // Split on fenced code blocks so links inside code examples are not rewritten
  const parts = content.split(/(^```[^\n]*\n[\s\S]*?^```[ \t]*$)/gm)
  return parts.map((part, i) => {
    if (i % 2 === 1)
      return part // inside a code fence — leave untouched
    return part
      // YAML frontmatter link fields: "link: /foo" → "link: /v0.3.0/foo"
      .replaceAll(/^([ \t]*link:[ \t]+)\//gm, `$1${prefix}/`)
      // Markdown inline links: "](/foo" → "](/v0.3.0/foo"
      .replaceAll('](/', `](${prefix}/`)
  }).join('')
}

function rewriteLinks(dir, prefix) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      rewriteLinks(filePath, prefix)
    }
    else if (entry.name.endsWith('.md')) {
      const content = fs.readFileSync(filePath, 'utf-8')
      const updated = rewriteContentLinks(content, prefix)
      if (updated !== content) {
        if (!dryRun)
          fs.writeFileSync(filePath, updated, 'utf-8')
        log(dryRun ? 'would ' : 'rewrite', filePath)
      }
    }
  }
}

// Step 1: Copy content files (exclude .vitepress, node_modules, v*/, package.json)
console.log('Copying content:')
const skipDirs = new Set(['.vitepress', 'node_modules'])
const skipFiles = new Set(['package.json'])
for (const entry of fs.readdirSync(docsDir, { withFileTypes: true })) {
  if (skipDirs.has(entry.name))
    continue
  if (/^v\d+/.test(entry.name))
    continue // skip existing snapshots
  if (!entry.isDirectory() && skipFiles.has(entry.name))
    continue
  const src = path.join(docsDir, entry.name)
  const dest = path.join(versionDir, entry.name)
  if (entry.isDirectory())
    copyDir(src, dest)
  else copyFile(src, dest)
}

// Rewrite absolute internal links in copied markdown files
console.log('\nRewriting internal links:')
rewriteLinks(versionDir, `/v${version}`)

// Step 2: Update versions.mjs — append new stable entry after 'next'
console.log('\nUpdating versions.mjs:')
const versionsContent = fs.readFileSync(versionsFile, 'utf-8')
const newVersionEntry = `  { text: 'v${version}', link: '/v${version}/' },\n`
const updatedVersions = versionsContent.replace(
  /(export const versions = \[\n {2}\{ text: 'next'[^\n]+\n)/,
  `$1${newVersionEntry}`,
)
if (updatedVersions === versionsContent) {
  console.error('❌ Could not find insertion point in versions.mjs. Aborting.')
  process.exit(1)
}
writeFile(versionsFile, updatedVersions)

// Step 3: Update versioned-sidebars.mjs — append new version's sidebar entries
console.log('\nUpdating versioned-sidebars.mjs:')
let rootSidebar
try {
  const mod = await import(sidebarFile)
  rootSidebar = mod.rootSidebar
}
catch (e) {
  console.error(`❌ Could not import sidebar.mjs: ${e.message}`)
  process.exit(1)
}

// Prefix all item links with /v{version} — recurses into nested items at any depth
function prefixSidebarItems(items, prefix) {
  return items.map((item) => {
    const result = { ...item }
    if (item.link)
      result.link = `${prefix}${item.link}`
    if (item.items)
      result.items = prefixSidebarItems(item.items, prefix)
    return result
  })
}

const newSidebars = {}
for (const [key, groups] of Object.entries(rootSidebar)) {
  newSidebars[`/v${version}${key}`] = prefixSidebarItems(groups, `/v${version}`)
}

// Read existing versioned sidebars and merge
const existingContent = fs.readFileSync(versionedSidebarsFile, 'utf-8')
const match = existingContent.match(/export const versionedSidebars = (\{[\s\S]*\})/)
let existing = {}
if (match) {
  try {
    existing = JSON.parse(match[1])
  }
  catch {
    console.error('❌ versioned-sidebars.mjs contains invalid JSON — it may have been manually edited. Delete it and re-run to regenerate. Aborting.')
    process.exit(1)
  }
}
const merged = { ...existing, ...newSidebars }
const newSidebarsContent = `// AUTO-GENERATED by scripts/snapshot-docs.mjs — do not edit manually\n\n/** @type {import('vitepress').DefaultTheme.SidebarMulti} */\nexport const versionedSidebars = ${JSON.stringify(merged, null, 2)}\n`
writeFile(versionedSidebarsFile, newSidebarsContent)

if (dryRun) {
  console.log('\n✅ Dry run complete. No files were written.')
}
else {
  console.log(`\n✅ Snapshot v${version} complete.`)
  console.log(`   Created: packages/docs/v${version}/`)
  console.log('\nStaging snapshot files...')
  const { execSync } = await import('node:child_process')
  execSync(
    `git add packages/docs/v${version}/ packages/docs/.vitepress/versions.mjs packages/docs/.vitepress/versioned-sidebars.mjs`,
    { cwd: root, stdio: 'inherit' },
  )
  console.log('✅ Staged. Run bumpp to complete the release.')
}
