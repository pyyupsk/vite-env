import { Code2, Layers, Package, Shield, Terminal, Zap, type LucideIcon } from 'lucide-react'

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Shield,   title: 'Type-safe env',         desc: 'Inferred TypeScript types flow into every module. No manual interface declarations needed.' },
  { icon: Zap,      title: 'Build-time validation', desc: 'Missing or malformed keys fail the build before they ever reach production.' },
  { icon: Layers,   title: 'Server / client split', desc: 'Secrets stay server-side automatically. VITE_ prefixed keys go to the client bundle.' },
  { icon: Code2,    title: 'Virtual modules',       desc: 'import { env } from "virtual:env" — tree-shakeable, zero coupling to process.env.' },
  { icon: Package,  title: 'Zero runtime cost',     desc: 'No validation logic ships to the browser. The plugin runs only at build time.' },
  { icon: Terminal, title: 'Vite native',            desc: "Built on Vite's resolveId/transform hooks. Works with any Vite-based framework." },
]

export function FeaturesSection() {
  return (
    <section className="container-section pb-20">
      <div className="border-t border-hairline pt-16 mb-10 flex flex-col items-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-subtle">
          // what you get
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {FEATURES.map((f) => {
          const FeatureIcon = f.icon
          return (
          <div
            key={f.title}
            className="group rounded-lg p-6 bg-surface-1 border border-border-subtle shadow-inset-top hover:border-border-strong hover:shadow-md hover:-translate-y-0.5 transition-[border-color,box-shadow,transform] duration-base"
          >
            <div className="w-[34px] h-[34px] rounded-md bg-accent-soft text-accent-text flex items-center justify-center mb-3.5">
              <FeatureIcon size={17} strokeWidth={1.5} />
            </div>
            <div className="font-semibold text-text-strong text-sm mb-2 tracking-[-0.01em]">
              {f.title}
            </div>
            <div className="text-xs leading-[1.65] text-text-subtle">
              {f.desc}
            </div>
          </div>
          )
        })}
      </div>
    </section>
  )
}
