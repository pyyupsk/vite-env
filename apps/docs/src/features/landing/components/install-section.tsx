import { useState } from 'react'
import { cn } from '@/lib/cn'
import { CodeBlock } from '@/components/ui/code-block'

const PMS = ['npm', 'pnpm', 'yarn', 'bun'] as const
type PM = (typeof PMS)[number]

const CMDS: Record<PM, string> = {
  npm:  'npm install --save-dev @vite-env/core',
  pnpm: 'pnpm add -D @vite-env/core',
  yarn: 'yarn add -D @vite-env/core',
  bun:  'bun add -D @vite-env/core',
}

export function InstallSection() {
  const [pm, setPm] = useState<PM>('npm')

  return (
    <section className="container-section pb-20">
      <div className="max-w-content-lg mx-auto border-t border-hairline pt-16">
        <span className="block font-mono text-[11px] uppercase tracking-[0.12em] text-text-subtle mb-5">
          // install
        </span>

        <div
          className="flex gap-0.5 w-fit p-0.5 rounded-md mb-2.5"
          style={{ background: 'var(--color-surface-inset)', border: '1px solid var(--color-border-subtle)' }}
        >
          {PMS.map((p) => (
            <button
              key={p}
              onClick={() => setPm(p)}
              className={cn(
                'px-3.5 py-1 rounded-sm text-xs font-mono transition-colors duration-fast cursor-pointer border-0',
                pm === p
                  ? 'bg-surface-raised text-text-strong shadow-inset-top'
                  : 'bg-transparent text-text-subtle hover:text-text-body',
              )}
            >
              {p}
            </button>
          ))}
        </div>

        <CodeBlock dots={false}>
          <span className="text-text-faint select-none">$ </span>
          <span className="text-text-body">{CMDS[pm]}</span>
        </CodeBlock>

        <p className="mt-5 text-xs font-mono text-text-faint leading-relaxed">
          {'Then add '}
          <span className="text-accent-text">viteEnv()</span>
          {' to your '}
          <span className="text-text-subtle">vite.config.ts</span>
          {' plugins array.'}
        </p>
      </div>
    </section>
  )
}
