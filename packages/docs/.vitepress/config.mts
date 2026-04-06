import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'vite-env',
  description:
    'The env.ts layer for Vite — define once, validate everywhere, import with types',
  lang: 'en-US',
  base: '/vite-env/',

  head: [['link', { rel: 'icon', href: '/favicon.svg' }]],

  themeConfig: {
    logo: '/favicon.svg',

    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'Reference', link: '/reference/define-env' },
      { text: 'CLI', link: '/cli/overview' },
      {
        text: 'v0.2.1',
        items: [
          {
            text: 'Changelog',
            link: 'https://github.com/pyyupsk/vite-env/releases',
          },
          { text: 'npm', link: 'https://npmjs.com/package/@vite-env/core' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is vite-env?', link: '/guide/introduction' },
            { text: 'Why vite-env?', link: '/guide/why' },
            { text: 'Comparison', link: '/guide/comparison' },
          ],
        },
        {
          text: 'Getting Started',
          items: [
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'How It Works', link: '/guide/how-it-works' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Server vs Client', link: '/guide/server-client' },
            { text: 'Virtual Modules', link: '/guide/virtual-modules' },
            { text: 'Type Coercion', link: '/guide/coercion' },
            { text: 'Leak Detection', link: '/guide/leak-detection' },
            { text: 'Type Generation', link: '/guide/type-generation' },
          ],
        },
      ],
      '/reference/': [
        {
          text: 'API Reference',
          items: [
            { text: 'defineEnv()', link: '/reference/define-env' },
            { text: 'Plugin Options', link: '/reference/plugin-options' },
            { text: 'Zod v4 Patterns', link: '/reference/zod-patterns' },
            { text: 'Env Priority', link: '/reference/env-priority' },
            { text: 'Vite 8 / Rolldown', link: '/reference/vite8' },
          ],
        },
      ],
      '/cli/': [
        {
          text: 'CLI',
          items: [
            { text: 'Overview', link: '/cli/overview' },
            { text: 'vite-env check', link: '/cli/check' },
            { text: 'vite-env generate', link: '/cli/generate' },
            { text: 'vite-env types', link: '/cli/types' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/pyyupsk/vite-env' },
      { icon: 'npm', link: 'https://npmjs.com/package/@vite-env/core' },
    ],

    editLink: {
      pattern:
        'https://github.com/pyyupsk/vite-env/edit/main/packages/docs/:path',
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
