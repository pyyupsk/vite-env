import { useState, useEffect, useMemo } from "react";
import type { Doc } from "#velite";
import { cn } from "@/lib/cn";

type TocEntry = Doc["toc"][number];

function flattenToc(items: TocEntry[], depth = 0): { entry: TocEntry; depth: number }[] {
  return items.flatMap((item) => [{ entry: item, depth }, ...flattenToc(item.items, depth + 1)]);
}

export function TOC({ items }: Readonly<{ items: TocEntry[] }>) {
  const flat = useMemo(() => flattenToc(items), [items]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const headings = flat
      .map(({ entry }) => document.getElementById(entry.url.slice(1)))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    // Active = the last heading that has scrolled past the top band of the viewport.
    const update = () => {
      let current = headings[0];
      for (const h of headings) if (h.getBoundingClientRect().top < 120) current = h;
      setActive(`#${current.id}`);
    };
    update();
    globalThis.addEventListener("scroll", update, { passive: true });
    return () => globalThis.removeEventListener("scroll", update);
  }, [flat]);

  if (flat.length === 0) return null;

  return (
    <aside className="hidden xl:block xl:sticky xl:top-14 xl:h-[calc(100dvh-3.5rem)] xl:w-60 xl:shrink-0">
      <nav aria-label="On this page" className="h-full overflow-y-auto px-6 py-10">
        <h2 className="mb-3 text-[13px] font-semibold text-ink-3">On this page</h2>
        <ul className="space-y-1.5 text-[14px]">
          {flat.map(({ entry, depth }) => (
            <li key={entry.url} className={(["", "pl-3.5", "pl-7"] as const)[depth] ?? "pl-7"}>
              <a
                href={entry.url}
                aria-current={active === entry.url ? "location" : undefined}
                className={cn(
                  "block leading-snug transition-colors",
                  active === entry.url ? "font-medium text-ink" : "text-ink-3 hover:text-ink",
                )}
              >
                {entry.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
