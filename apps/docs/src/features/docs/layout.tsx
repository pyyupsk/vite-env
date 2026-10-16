import { useCallback, useMemo, useEffect, useState, type ComponentType } from "react";
import { useParams, Redirect, Link } from "wouter";
import * as runtime from "react/jsx-runtime";
import { docs } from "#velite";
import { Header, REPO } from "@/components/layout/header";
import { Sidebar } from "./components/sidebar";
import { TOC } from "./components/toc";
import { mdxComponents } from "./components/mdx-components";
import { buildNav, getPrevNext, type NavItem } from "./nav";

const DEFAULT_SLUG = "getting-started";

function MDXContent({ code }: Readonly<{ code: string }>) {
  const Component = useMemo(() => {
    const fn = new Function(code);
    return fn({ ...runtime }).default as ComponentType<{
      components?: Record<string, ComponentType>;
    }>;
  }, [code]);
  return <Component components={mdxComponents} />;
}

function PageLink({ item, dir }: Readonly<{ item: NavItem | null; dir: "Previous" | "Next" }>) {
  if (!item) return <div />;
  return (
    <Link
      to={`/docs/${item.slug}`}
      rel={dir === "Next" ? "next" : "prev"}
      className={`group flex flex-col gap-0.5 ${dir === "Next" ? "items-end text-right" : ""}`}
    >
      <span className="text-[14px] text-ink-3">{dir}</span>
      <span className="text-[17px] font-semibold text-link group-hover:underline underline-offset-[3px]">
        {item.label}
      </span>
    </Link>
  );
}

export function DocsLayout() {
  const { page = DEFAULT_SLUG } = useParams<{ page?: string }>();
  // The menu belongs to the page it was opened on, so navigating closes it.
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const menuOpen = menuFor === page;
  const toggleMenu = useCallback(() => setMenuFor((f) => (f === page ? null : page)), [page]);

  const doc = docs.find((d) => d.slug === page);
  const nav = useMemo(() => buildNav(docs), []);
  const { prev, next } = useMemo(() => getPrevNext(docs, page), [page]);

  useEffect(() => {
    // The browser tries the hash before the page renders, so scroll to it again here.
    const target =
      location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) target.scrollIntoView();
    else globalThis.scrollTo({ top: 0 });
    if (doc) document.title = `${doc.title} | vite-env`;
  }, [page, doc]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuFor(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (!doc) return <Redirect to={`/docs/${DEFAULT_SLUG}`} />;

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-paper focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Header wide menuOpen={menuOpen} onMenu={toggleMenu} />
      <div className="mx-auto flex w-full max-w-[96rem]">
        <Sidebar sections={nav} currentSlug={page} open={menuOpen} />
        <main id="main" className="min-w-0 flex-1 px-5 pt-10 pb-24 md:px-10 lg:px-14">
          <article className="mx-auto max-w-prose text-[1.0625rem] leading-[1.7]">
            <header className="mb-10 border-b-2 border-rule-strong pb-7">
              <h1 className="text-[2rem] font-bold leading-[1.15] tracking-[-0.025em] md:text-[2.375rem]">
                {doc.title}
              </h1>
              {doc.description && (
                <p className="mt-3 text-[1.1875rem] leading-relaxed text-ink-2">
                  {doc.description}
                </p>
              )}
            </header>

            <MDXContent code={doc.body} />

            <p className="mt-12 text-[14px]">
              <a
                href={`${REPO}/edit/main/apps/docs/src/content/${doc.slug}.mdx`}
                className="text-ink-3 underline underline-offset-[3px] decoration-current/35 hover:text-ink"
              >
                Edit this page on GitHub
              </a>
            </p>

            <nav
              aria-label="Previous and next page"
              className="mt-6 grid grid-cols-2 gap-6 border-t border-rule pt-6"
            >
              <PageLink item={prev} dir="Previous" />
              <PageLink item={next} dir="Next" />
            </nav>
          </article>
        </main>
        <TOC items={doc.toc} />
      </div>
    </div>
  );
}
