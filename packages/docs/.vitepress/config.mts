// packages/docs/.vitepress/config.mts
import { defineConfig } from 'vitepress'
import pkg from '../../core/package.json'
import { rootSidebar } from './sidebar.mjs'
import { versionedSidebars } from './versioned-sidebars.mjs'
import { versions } from './versions.mjs'

const VERSIONED_PATH = /^v\d/

export default defineConfig({
  title: 'vite-env',
  description:
    'The env.ts layer for Vite — define once, validate everywhere, import with types',
  lang: 'en-US',
  base: '/vite-env/',

  head: [['link', { rel: 'icon', href: '/vite-env/favicon.svg' }]],

  themeConfig: {
    logo: '/favicon.svg',

    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'Reference', link: '/reference/define-env' },
      { text: 'CLI', link: '/cli/overview' },
      {
        text: `v${pkg.version} (next)`,
        items: [
          ...versions,
          {
            text: 'Changelog',
            link: 'https://github.com/pyyupsk/vite-env/releases',
          },
          { text: 'npm', link: 'https://npmjs.com/package/@vite-env/core' },
        ],
      },
    ],

    sidebar: {
      ...rootSidebar,
      ...versionedSidebars,
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/pyyupsk/vite-env' },
      { icon: 'npm', link: 'https://npmjs.com/package/@vite-env/core' },
    ],

    editLink: {
      pattern: ({ filePath }) =>
        VERSIONED_PATH.test(filePath)
          ? (undefined as unknown as string)
          : `https://github.com/pyyupsk/vite-env/edit/main/packages/docs/${filePath}`,
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 pyyupsk',
    },

    search: { provider: 'local' },
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
  },
})
