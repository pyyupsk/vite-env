import { Link } from "wouter";
import { CodeBlock } from "@/components/ui/code-block";
import { REPO } from "@/components/layout/header";
import { InstallCommand } from "@/components/ui/install-command";

export const SCHEMA = `import { defineEnv } from "@vite-env/core";
import { z } from "zod";

export default defineEnv({
  server: {
    DATABASE_URL: z.string().url(),
    PORT: z.coerce.number().default(3000),
  },
  client: {
    VITE_API_URL: z.string().url(),
  },
});`;

const ROWS = [
  { key: "DATABASE_URL", type: "URL", where: "Server only", secret: true, missing: "Build fails" },
  { key: "PORT", type: "number", where: "Server only", secret: true, missing: "Uses 3000" },
  {
    key: "VITE_API_URL",
    type: "URL",
    where: "Server and client",
    secret: false,
    missing: "Build fails",
  },
];

export function HeroSection() {
  return (
    <section
      id="top"
      className="container-page grid gap-x-12 gap-y-12 pt-14 pb-10 md:pt-20 lg:grid-cols-12"
    >
      <div className="lg:col-span-5">
        <h1
          className="text-[3.25rem] font-extrabold leading-none tracking-[-0.04em] md:text-[4.5rem]"
          translate="no"
        >
          vite-env
        </h1>
        <p className="mt-5 text-[1.5rem] font-semibold leading-snug tracking-[-0.01em]">
          Typed, validated environment variables for Vite.
        </p>
        <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-ink-2">
          Describe your variables once in <code className="text-[0.9em]">env.ts</code>. When Vite
          starts or builds, the plugin checks every value, stops the build if one is wrong, and
          gives your code typed, read-only access.
        </p>

        <div className="mt-8 max-w-md">
          <InstallCommand command="npm install -D @vite-env/core" />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/docs"
            className="inline-flex h-11 items-center rounded-md bg-ink px-5 text-[16px] font-semibold text-paper hover:bg-ink-2 transition-colors"
          >
            Read the docs
          </Link>
          <a
            href={REPO}
            className="text-[16px] font-semibold text-link underline decoration-current/35 underline-offset-[3px] hover:decoration-current"
          >
            View on GitHub
          </a>
        </div>
      </div>

      <div className="min-w-0 lg:col-span-7">
        <div className="border-t-2 border-rule-strong pt-3">
          <CodeBlock code={SCHEMA} lang="typescript" filename="env.ts" className="mt-0 mb-8" />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[30rem] border-collapse text-[15px] tabular-nums">
              <caption className="mb-3 text-left text-[15px] font-semibold">
                What vite-env checks from this schema
              </caption>
              <thead className="border-y border-rule-strong">
                <tr>
                  <th scope="col" className="py-2 pr-4 text-left text-[14px] font-semibold">
                    Variable
                  </th>
                  <th scope="col" className="py-2 pr-4 text-left text-[14px] font-semibold">
                    Type
                  </th>
                  <th scope="col" className="py-2 pr-4 text-left text-[14px] font-semibold">
                    Available in
                  </th>
                  <th scope="col" className="py-2 text-left text-[14px] font-semibold">
                    If missing
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.key} className="border-b border-rule">
                    <th
                      scope="row"
                      className="py-2.5 pr-4 text-left font-mono text-[14px] font-normal"
                      translate="no"
                    >
                      {r.key}
                    </th>
                    <td className="py-2.5 pr-4 text-ink-2">{r.type}</td>
                    <td className="py-2.5 pr-4">
                      {r.secret ? (
                        <span className="marked">{r.where}</span>
                      ) : (
                        <span className="text-ink-2">{r.where}</span>
                      )}
                    </td>
                    <td className="py-2.5 text-ink-2">{r.missing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
