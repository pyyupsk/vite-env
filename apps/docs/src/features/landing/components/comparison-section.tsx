import { CodeBlock } from '@/components/ui/code-block'
import { Check, X } from 'lucide-react'

const BEFORE = `// manual — no real type safety

// DATABASE_URL: string | undefined
// PORT:         string | undefined

const db = process.env.DATABASE_URL as string
const port = parseInt(process.env.PORT || "3000")`

const AFTER = `import { env } from "virtual:env"

// DATABASE_URL: string (validated url)
// PORT: number (default 3000)

const db = env.DATABASE_URL   // ✓ typed
const port = env.PORT         // ✓ number`

export function ComparisonSection() {
  return (
    <section className="container-section pb-20">
      <div className="border-t border-hairline pt-16">
        <div className="text-center mb-12">
          <span className="block font-mono text-[11px] uppercase tracking-[0.12em] text-text-subtle mb-3.5">
            // before / after
          </span>
          <h2 className="text-[28px] font-semibold text-text-strong tracking-[-0.02em] mb-2.5">
            No more guessing games.
          </h2>
          <p className="text-sm text-text-muted max-w-[440px] mx-auto">
            Before vite-env, every env access was a type assertion in disguise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-content-2xl mx-auto">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span
                className="w-5 h-5 rounded-full inline-flex items-center justify-center text-red-400 shrink-0 bg-danger-soft"
              >
                <X size={11} strokeWidth={2} />
              </span>
              <span className="font-mono text-xs text-red-400">before</span>
            </div>
            <CodeBlock filename="app.ts" code={BEFORE} />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span
                className="w-5 h-5 rounded-full inline-flex items-center justify-center text-success shrink-0 bg-success-soft"
              >
                <Check size={11} strokeWidth={2} />
              </span>
              <span className="font-mono text-xs text-success">after</span>
            </div>
            <CodeBlock filename="app.ts" code={AFTER} />
          </div>
        </div>
      </div>
    </section>
  )
}
