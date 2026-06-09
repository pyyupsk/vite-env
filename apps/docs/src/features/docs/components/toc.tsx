import { useState, useEffect } from 'react'
import type { Doc } from '#velite'
import { Link } from 'wouter'

type TocEntry = Doc['toc'][number]

function flattenToc(items: TocEntry[], depth = 0): { entry: TocEntry; depth: number }[] {
  return items.flatMap((item) => [
    { entry: item, depth },
    ...flattenToc(item.items, depth + 1),
  ])
}

type TOCProps = {
  items: TocEntry[]
}

export function TOC({ items }: TOCProps) {
  const flat = flattenToc(items)
  const [activeUrl, setActiveUrl] = useState<string>('')

  useEffect(() => {
    if (flat.length === 0) return

    const ids = flat.map(({ entry }) => entry.url.replace('#', ''))
    const headings = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveUrl(`#${entry.target.id}`)
            break
          }
        }
      },
      { rootMargin: '0px 0px -80% 0px', threshold: 0 },
    )

    headings.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [items]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <aside className="w-[220px] shrink-0 h-full overflow-y-auto px-5 py-5">
      <div className="font-mono text-[10.5px] uppercase tracking-[.12em] text-text-faint mb-3">
        On this page
      </div>
      <nav className="flex flex-col gap-0.5">
        {flat.map(({ entry, depth }) => {
          const isActive = activeUrl === entry.url || (!activeUrl && flat[0]?.entry.url === entry.url)
          return (
            <Link
              key={entry.url}
              href={entry.url}
              style={{ paddingLeft: `${4 + depth * 12}px` }}
              className={[
                'text-[13px] transition-colors duration-fast no-underline py-1 leading-snug border-l-2',
                isActive
                  ? 'text-accent-text border-accent pl-3'
                  : 'text-text-subtle hover:text-text-body border-transparent',
              ].join(' ')}
            >
              {entry.title}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
