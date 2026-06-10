import type { Highlighter, ThemeRegistration } from 'shiki'

const theme: ThemeRegistration = {
  name: 'vite-env-dark',
  type: 'dark',
  colors: {
    'editor.background': '#0b0b0e',
    'editor.foreground': '#c9c9d1',
  },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#71717a', fontStyle: 'italic' } },
    { scope: ['keyword', 'storage.type', 'storage.modifier'], settings: { foreground: '#a48cff' } },
    { scope: ['string', 'string.quoted'], settings: { foreground: '#4ade80' } },
    { scope: ['constant.numeric', 'constant.language'], settings: { foreground: '#f7b955' } },
    { scope: ['entity.name.function', 'support.function'], settings: { foreground: '#41d8ff' } },
    { scope: ['entity.name.type', 'support.type', 'support.class'], settings: { foreground: '#ffb86c' } },
    { scope: ['variable', 'variable.other'], settings: { foreground: '#c9c9d1' } },
    { scope: ['punctuation', 'meta.brace'], settings: { foreground: '#8b8b94' } },
    { scope: ['entity.name.tag'], settings: { foreground: '#a48cff' } },
    { scope: ['attribute.name', 'entity.other.attribute-name'], settings: { foreground: '#41d8ff' } },
  ],
}

let instance: Highlighter | null = null

export async function getHighlighter(): Promise<Highlighter> {
  if (!instance) {
    const { createHighlighter } = await import('shiki')
    instance = await createHighlighter({
      themes: [theme],
      langs: ['typescript', 'tsx', 'javascript', 'jsx', 'bash', 'json', 'css'],
    })
  }
  return instance
}

export async function highlight(code: string, lang = 'typescript'): Promise<string> {
  const hl = await getHighlighter()
  return hl.codeToHtml(code, { lang, theme: 'vite-env-dark' })
}
