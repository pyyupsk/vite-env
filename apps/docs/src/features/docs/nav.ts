export type NavItem = {
  slug: string;
  label: string;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export function buildNav(
  docs: { slug: string; title: string; section: string; order: number }[],
): NavSection[] {
  const map = new Map<string, NavItem[]>();
  const sorted = [...docs].sort((a, b) => a.order - b.order);

  for (const doc of sorted) {
    const existing = map.get(doc.section) ?? [];
    existing.push({ slug: doc.slug, label: doc.title });
    map.set(doc.section, existing);
  }

  return Array.from(map.entries()).map(([title, items]) => ({ title, items }));
}

export function getPrevNext(
  docs: { slug: string; title: string; order: number }[],
  currentSlug: string,
): { prev: NavItem | null; next: NavItem | null } {
  const sorted = [...docs].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((d) => d.slug === currentSlug);
  return {
    prev: idx > 0 ? { slug: sorted[idx - 1].slug, label: sorted[idx - 1].title } : null,
    next:
      idx >= 0 && idx < sorted.length - 1
        ? { slug: sorted[idx + 1].slug, label: sorted[idx + 1].title }
        : null,
  };
}
