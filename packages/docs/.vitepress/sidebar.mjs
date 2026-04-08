// packages/docs/.vitepress/sidebar.mjs

/** @type {import('vitepress').DefaultTheme.SidebarMulti} */
export const rootSidebar = {
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
        { text: 'Platform Presets', link: '/guide/platform-presets' },
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
}
