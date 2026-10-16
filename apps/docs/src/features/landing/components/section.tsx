import type { PropsWithChildren, ReactNode } from "react";

// Manual-style section: heavy rule, heading in the left margin, content on the right.
export function Section({
  id,
  title,
  intro,
  children,
}: PropsWithChildren<{ id: string; title: string; intro?: ReactNode }>) {
  return (
    <section aria-labelledby={id} className="container-page py-10 md:py-14">
      <div className="grid gap-x-12 gap-y-6 border-t-2 border-rule-strong pt-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id={id} className="text-[1.625rem] font-bold leading-tight tracking-[-0.02em]">
            {title}
          </h2>
          {intro && <p className="mt-3 max-w-sm text-[16px] leading-relaxed text-ink-2">{intro}</p>}
        </div>
        <div className="min-w-0 lg:col-span-8">{children}</div>
      </div>
    </section>
  );
}
