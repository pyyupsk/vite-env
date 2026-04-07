// packages/docs/.vitepress/versions.mjs

// IMPORTANT: This file is the single source of truth for the docs version list.
// All VitePress configs and the NextBanner component import from here.
// WARNING: Never move this file — the import path is a stable contract.
//          If you must move it, update all frozen v*/.vitepress/config.mts files.

/** @type {Array<{ text: string, link: string }>} */
export const versions = [
  { text: 'next', link: '/' },
  { text: 'v0.3.0', link: '/v0.3.0/' },
]
