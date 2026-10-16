import { Link } from "wouter";
import { Section } from "./section";

const FEATURES: { text: string; href: string }[] = [
  {
    text: "Types come from your schema and are written to vite-env.d.ts",
    href: "/docs/virtual-modules",
  },
  { text: "Every value is checked when Vite starts or builds", href: "/docs/getting-started" },
  {
    text: "Server and client keys are split into two virtual modules",
    href: "/docs/virtual-modules",
  },
  { text: "The build fails if client code imports the server module", href: "/docs/guard-modes" },
  {
    text: "The build fails if a server value appears in a client chunk",
    href: "/docs/server-leak",
  },
  {
    text: "Works with Zod, Valibot, ArkType, or any Standard Schema validator",
    href: "/docs/standard-schema",
  },
  { text: "Presets for Vercel, Railway, and Netlify variables", href: "/docs/presets" },
  { text: "A CLI to check env in CI and generate .env.example", href: "/docs/cli" },
  {
    text: "loadEnv() for Node and Bun scripts that run outside Vite",
    href: "/docs/standalone-loader",
  },
];

export function FeaturesSection() {
  return (
    <Section id="features" title="Features">
      <ul className="grid gap-x-10 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <li key={f.text} className="border-b border-rule">
            <Link
              href={f.href}
              className="flex h-full items-baseline gap-3 py-3.5 text-[16px] leading-snug hover:text-link"
            >
              <span aria-hidden className="text-ink-3">
                &ndash;
              </span>
              {f.text}
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
