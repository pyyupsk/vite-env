import { Link } from "wouter"

const LINKS = [
  { label: 'Docs', href: '/docs' },
  { label: 'GitHub', href: 'https://github.com/pyyupsk/vite-env', external: true },
  { label: 'npm', href: 'https://www.npmjs.com/package/@vite-env/core', external: true },
  { label: 'Changelog', href: 'https://github.com/pyyupsk/vite-env/releases', external: true },
]

export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="container-section flex items-center gap-4 py-6">
        <Link href="/" className="flex items-center gap-1.5 no-underline">
          <img src="/logo.svg" width={18} height={18} alt="" />
          <span className="font-mono text-xs text-text-faint">vite-env</span>
        </Link>
        <span className="font-mono text-xs text-neutral-700 ml-auto">
          MIT license · open source
        </span>
        <nav className="flex gap-5">
          {LINKS.map(({ label, href, external }) =>
            external ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-text-subtle hover:text-text-body transition-colors duration-fast no-underline"
              >
                {label}
              </a>
            ) : (
              <Link
                key={label}
                href={href}
                className="text-xs text-text-subtle hover:text-text-body transition-colors duration-fast no-underline"
              >
                {label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </footer>
  )
}
