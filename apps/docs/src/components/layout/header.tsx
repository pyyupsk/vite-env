import { buttonVariants } from '@/components/ui/button/variants'
import { ArrowRight } from 'lucide-react'
import { GithubIcon } from '@/components/icons/github'
import { cn } from '@/lib/cn'
import { Link } from 'wouter'
import { useMemo, useEffect, useState } from 'react'

const NAV_LINKS = [
  { label: 'Docs', href: '/docs', external: false },
  { label: 'Examples', href: 'https://github.com/pyyupsk/vite-env/tree/main/examples', external: true },
  { label: 'Changelog', href: 'https://github.com/pyyupsk/vite-env/releases', external: true },
]

export function Header({ location }: Readonly<{ location?: string }>) {
  const [scrolled, setScrolled] = useState(false);

  const isDocs = useMemo(() => location?.startsWith("/docs"), [location]);
  const isHome = !location || location === '/';

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  const transparent = isHome && !scrolled;

  return (
    <header
      className={cn(
        'top-0 z-100 h-14 border-b transition-colors duration-200',
        isHome ? 'fixed w-full' : 'sticky',
        transparent
          ? 'border-transparent backdrop-blur-none bg-transparent'
          : 'border-hairline backdrop-blur-md bg-neutral-950/85',
      )}
    >
      <div className={cn("flex items-center h-full", isDocs ? "px-4" : "container-section")}>
        <Link href="/" className="flex items-center gap-2 mr-10 shrink-0 no-underline">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} width={26} height={26} alt="" />
          <span className="font-mono font-semibold text-sm">
            <span className="text-text-strong">vite</span>
            <span className="text-text-faint">-</span>
            <span className="text-accent-text">env</span>
          </span>
        </Link>

        <nav className="flex gap-6 flex-1">
          {NAV_LINKS.map(({ label, href, external }) =>
            external ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text-subtle hover:text-text-body transition-colors duration-fast no-underline"
              >
                {label}
              </a>
            ) : (
              <Link
                key={label}
                href={href}
                className="text-sm text-text-subtle hover:text-text-body transition-colors duration-fast no-underline"
              >
                {label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/pyyupsk/vite-env"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'no-underline')}
          >
            <GithubIcon size={15} />
            GitHub
          </a>
          <Link
            href="/docs"
            className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'no-underline')}
          >
            Get started
            <ArrowRight size={13} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </header>
  )
}
