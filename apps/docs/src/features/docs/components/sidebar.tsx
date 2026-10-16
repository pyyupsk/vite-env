import { Link } from "wouter";
import type { NavSection } from "../nav";
import { cn } from "@/lib/cn";
import { REPO } from "@/components/layout/header";

type SidebarProps = Readonly<{
  sections: NavSection[];
  currentSlug: string;
  open: boolean;
}>;

export function Sidebar({ sections, currentSlug, open }: SidebarProps) {
  return (
    <aside
      id="docs-nav"
      className={cn(
        "bg-paper lg:block lg:sticky lg:top-14 lg:h-[calc(100dvh-3.5rem)] lg:w-64 lg:shrink-0 lg:border-r lg:border-rule",
        open ? "fixed inset-x-0 top-14 bottom-0 z-30 block" : "hidden",
      )}
    >
      <nav
        aria-label="Documentation"
        className="h-full overflow-y-auto overscroll-contain px-5 py-8 lg:px-6"
      >
        {sections.map((section) => (
          <div key={section.title} className="mb-7">
            <h2 className="mb-2 text-[13px] font-semibold text-ink-3">{section.title}</h2>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = item.slug === currentSlug;
                return (
                  <li key={item.slug}>
                    <Link
                      to={`/docs/${item.slug}`}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "inline-block py-1.5 text-[15px] leading-snug lg:py-1",
                        active ? "marked font-semibold" : "text-ink-2 hover:text-ink",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <div className="mb-7 sm:hidden">
          <h2 className="mb-2 text-[13px] font-semibold text-ink-3">Project</h2>
          <ul className="space-y-0.5">
            <li>
              <a
                href={`${REPO}/tree/main/examples`}
                className="inline-block py-1.5 text-[15px] text-ink-2"
              >
                Examples
              </a>
            </li>
            <li>
              <a href={`${REPO}/releases`} className="inline-block py-1.5 text-[15px] text-ink-2">
                Releases
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}
