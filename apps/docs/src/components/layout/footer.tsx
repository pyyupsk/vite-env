import { REPO } from "./header";

const LINKS = [
  { label: "GitHub", href: REPO },
  { label: "npm", href: "https://www.npmjs.com/package/@vite-env/core" },
  { label: "Releases", href: `${REPO}/releases` },
  { label: "Report an issue", href: `${REPO}/issues` },
];

export function Footer() {
  return (
    <footer className="border-t border-rule">
      <div className="container-page flex flex-col gap-3 py-8 text-[14px] text-ink-3 sm:flex-row sm:items-center">
        <p>vite-env is open source under the MIT license.</p>
        <nav aria-label="Project links" className="flex flex-wrap gap-x-5 gap-y-2 sm:ml-auto">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} className="hover:text-ink transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
