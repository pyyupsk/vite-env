import { useCallback, useEffect, useState, type PropsWithChildren } from 'react'
import { Check, Copy } from 'lucide-react'
import { highlight } from '@/lib/highlighter'

type CodeBlockProps = PropsWithChildren<{
  filename?: string
  dots?: boolean
  lang?: string
  code?: string
}>

export function CodeBlock({ filename, dots = true, lang = 'typescript', code, children }: CodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!code) return
    highlight(code, lang).then(setHtml)
  }, [code, lang])

  const handleCopy = useCallback(() => {
    const text = code ?? ''
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [code])

  const hasHeader = dots || filename

  return (
    <div className="rounded-lg border border-border-subtle bg-surface-code shadow-inset-ring overflow-hidden text-sm font-mono">
      {hasHeader && (
        <div className="flex items-center px-4 h-9 border-b border-border-subtle">
          {dots && (
            <div className="flex gap-1.5 mr-3">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
            </div>
          )}
          {filename && <span className="text-xs font-mono text-text-faint">{filename}</span>}
          {code && (
            <button
              onClick={handleCopy}
              className="ml-auto flex items-center gap-1 text-xs font-mono text-text-faint hover:text-text-subtle transition-colors duration-fast cursor-pointer bg-transparent border-0 p-0"
            >
              {copied ? <Check size={12} strokeWidth={1.5} /> : <Copy size={12} strokeWidth={1.5} />}
              {copied ? 'copied' : 'copy'}
            </button>
          )}
        </div>
      )}
      {code ? (
        html
          ? <div className="[&>pre]:m-0 [&>pre]:p-4 [&>pre]:pl-5 [&>pre]:overflow-x-auto [&>pre]:leading-relaxed [&>pre]:bg-transparent!" dangerouslySetInnerHTML={{ __html: html }} />
          : <pre className="m-0 p-4 pl-5 overflow-x-auto text-text-subtle leading-relaxed">{code}</pre>
      ) : (
        <pre className="m-0 p-4 pl-5 overflow-x-auto leading-relaxed text-syntax-plain">
          <code>{children}</code>
        </pre>
      )}
    </div>
  )
}
