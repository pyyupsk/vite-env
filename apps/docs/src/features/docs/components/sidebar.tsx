import { Link } from "wouter";
import type { NavSection } from "../nav";

type SidebarProps = Readonly<{
  sections: NavSection[];
  currentSlug: string;
}>;

export function Sidebar({ sections, currentSlug }: SidebarProps) {
  return (
    <aside className="w-[264px] shrink-0 h-full overflow-y-auto border-r border-border-subtle py-5">
      {sections.map((section) => (
        <div key={section.title} className="mb-6">
          <div className="font-mono text-[10.5px] uppercase tracking-[.12em] text-text-faint px-4 mb-1.5">
            {section.title}
          </div>
          {section.items.map((item) => {
            const isActive = item.slug === currentSlug;
            return (
              <Link
                key={item.slug}
                to={`/docs/${item.slug}`}
                className={[
                  "block w-full text-left px-4 py-[5px] text-[13.5px] font-sans no-underline",
                  "border-l-2 transition-colors duration-fast",
                  isActive
                    ? "bg-accent-soft text-accent-text border-accent"
                    : "text-text-subtle border-transparent hover:text-text-body hover:bg-surface-1",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
