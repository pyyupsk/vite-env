import { useMemo, useEffect, useRef, type ComponentType } from 'react'
import { useParams, Redirect, Link, useLocation } from 'wouter'
import * as runtime from 'react/jsx-runtime'
import { docs } from '#velite'
import { Header } from '@/components/layout/header'
import { Sidebar } from './components/sidebar'
import { TOC } from './components/toc'
import { mdxComponents } from './components/mdx-components'
import { buildNav, getPrevNext } from './nav'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DEFAULT_SLUG = 'getting-started'

function MDXContent({ code }: Readonly<{ code: string }>) {
  const Component = useMemo(() => {
    const fn = new Function(code)
    return (fn({ ...runtime })).default as ComponentType<{
      components?: Record<string, ComponentType>
    }>
  }, [code])
  return <Component components={mdxComponents} />
}

export function DocsLayout() {
  const { page = DEFAULT_SLUG } = useParams<{ page?: string }>()
  const [location] = useLocation();

  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' })
  }, [page])

  const doc = docs.find((d) => d.slug === page)
  const nav = useMemo(() => buildNav(docs), [])
  const { prev, next } = useMemo(() => getPrevNext(docs, page), [page])

  if (!doc) return <Redirect to={`/docs/${DEFAULT_SLUG}`} />

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-base">
      <Header location={location} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar sections={nav} currentSlug={page} />

        <main ref={mainRef} className="flex-1 overflow-y-auto min-w-0">
          <div className="max-w-[720px] px-12 py-8 pb-20 mx-auto">
            <div className="flex items-center gap-1.5 mb-4 text-[12.5px] text-text-faint font-sans">
              <span>Docs</span>
              <span className="text-neutral-700">›</span>
              <span>{doc.section}</span>
            </div>

            <h1 className="font-sans font-semibold text-[30px] text-text-strong tracking-[-0.03em] mb-5 leading-tight">
              {doc.title}
            </h1>

            {doc.description && (
              <p className="text-[16px] text-text-muted leading-relaxed mb-8 -mt-2">
                {doc.description}
              </p>
            )}

            <MDXContent code={doc.body} />

            <div className="flex justify-between mt-12 pt-6 border-t border-hairline gap-4">
              {prev ? (
                <Link
                  to={`/docs/${prev.slug}`}
                  className="flex flex-col gap-1 bg-surface-1 border border-border-subtle rounded-md px-4 py-3 min-w-[160px] hover:border-border-default transition-colors duration-fast no-underline"
                >
                  <span className="font-mono text-[10px] uppercase tracking-widest text-text-faint flex items-center gap-1">
                    <ChevronLeft size={10} strokeWidth={1.5} />
                    prev
                  </span>
                  <span className="text-[13.5px] text-text-body">{prev.label}</span>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  to={`/docs/${next.slug}`}
                  className="flex flex-col items-end gap-1 bg-surface-1 border border-border-subtle rounded-md px-4 py-3 min-w-[160px] hover:border-border-default transition-colors duration-fast no-underline"
                >
                  <span className="font-mono text-[10px] uppercase tracking-widest text-text-faint flex items-center gap-1">
                    next
                    <ChevronRight size={10} strokeWidth={1.5} />
                  </span>
                  <span className="text-[13.5px] text-text-body">{next.label}</span>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </main>

        <TOC items={doc.toc} /> {/* nosonar */}
      </div>
    </div>
  )
}
