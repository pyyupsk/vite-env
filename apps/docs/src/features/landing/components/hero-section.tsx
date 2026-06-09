import { Badge } from '@/components/ui/badge'
import { CodeBlock } from '@/components/ui/code-block'
import { ArrowRight } from 'lucide-react'
import { GithubIcon } from '@/components/icons/github'
import { Link } from 'wouter'

const HERO_CODE = `import { defineEnv, z } from "vite-env"

export default defineEnv({
  server: {
    DATABASE_URL: z.string().url(),
    PORT: z.coerce.number().default(3000),
  },
  client: {
    VITE_API_URL: z.string().url(),
  },
})`

export function HeroSection() {
  return (
    <section className="relative px-10 py-20 overflow-hidden min-h-screen grid place-content-center text-center">
      <div className="absolute inset-0 pointer-events-none bg-grid opacity-35" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-content-xl h-[480px] pointer-events-none"
        style={{ background: 'radial-gradient(50% 65% at 50% 0%, color-mix(in oklch, var(--color-violet-500) 22%, transparent) 0%, transparent 80%)' }}
      />

      <div className="relative max-w-content-xl mx-auto">
        <div className="flex justify-center items-center gap-3 mb-7">
          <Badge variant="accent" dot>v{__CORE_VERSION__}</Badge>
          <span className="font-mono text-xs text-text-faint tracking-wide">{/* nosonar */}
            // vite plugin for build-time env validation
          </span>
        </div>

        <h1 className="text-[clamp(40px,6vw,68px)] font-semibold leading-[1.06] tracking-[-0.03em] text-text-strong mb-5">
          Typed env,{' '}
          <span style={{
            background: 'linear-gradient(118deg, var(--color-white) 10%, var(--color-violet-300) 55%, var(--color-cyan-400))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            zero boilerplate.
          </span>
        </h1>

        <p className="text-[17px] leading-[1.65] text-text-muted max-w-content-sm mx-auto mb-9">
          vite-env reads your schema once and hands every module
          a fully typed env object — validated at build, never at runtime.
        </p>

        <div className="flex justify-center gap-3 mb-[60px] flex-wrap">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 px-5 h-10 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-md transition-colors duration-fast no-underline"
          >
            Get started
            <ArrowRight size={18} strokeWidth={1.5} />
          </Link>
          <a
            href="https://github.com/pyyupsk/vite-env"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 h-10 text-sm font-medium text-text-body bg-surface-raised hover:bg-surface-3 border border-border-default hover:border-border-strong rounded-md transition-all duration-fast no-underline"
          >
            <GithubIcon size={16} />
            View on GitHub
          </a>
        </div>

        <div className="max-w-content-md mx-auto text-left">
          <CodeBlock filename="env.config.ts" code={HERO_CODE} />
        </div>
      </div>
    </section>
  )
}
