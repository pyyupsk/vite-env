import { useState } from "react";
import { Link } from "wouter";
import { CodeBlock } from "@/components/ui/code-block";
import { cn } from "@/lib/cn";
import { InstallCommand } from "./install-command";
import { Section } from "./section";

const CMDS = {
  npm: "npm install -D @vite-env/core",
  pnpm: "pnpm add -D @vite-env/core",
  yarn: "yarn add -D @vite-env/core",
  bun: "bun add -D @vite-env/core",
} as const;
type PM = keyof typeof CMDS;

const CONFIG = `import { defineConfig } from "vite";
import ViteEnv from "@vite-env/core/plugin";

export default defineConfig({
  plugins: [ViteEnv({ configFile: "./env.ts" })],
});`;

const USE = `import { env } from "virtual:env/server";

const db = createClient(env.DATABASE_URL); // string, checked at build`;

function Step({
  n,
  title,
  children,
}: Readonly<{ n: number; title: string; children: React.ReactNode }>) {
  return (
    <li className="grid grid-cols-[2rem_1fr] gap-x-3 border-b border-rule py-6 first:pt-0">
      <span className="font-mono text-[15px] text-ink-3 tabular-nums" aria-hidden>
        {n}.
      </span>
      <div className="min-w-0">
        <h3 className="text-[1.125rem] font-semibold">{title}</h3>
        {children}
      </div>
    </li>
  );
}

export function InstallSection() {
  const [pm, setPm] = useState<PM>("npm");

  return (
    <Section
      id="setup"
      title="Set it up"
      intro="If you write the schema with Zod, install zod as well."
    >
      <ol>
        <Step n={1} title="Install the package">
          <div className="mt-3 mb-3 flex gap-1">
            {(Object.keys(CMDS) as PM[]).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={pm === key}
                onClick={() => setPm(key)}
                className={cn(
                  "rounded px-3 py-1 font-mono text-[14px] cursor-pointer transition-colors",
                  pm === key ? "bg-ink text-paper" : "text-ink-2 hover:bg-panel hover:text-ink",
                )}
              >
                {key}
              </button>
            ))}
          </div>
          <InstallCommand command={CMDS[pm]} />
        </Step>
        <Step n={2} title="Describe your variables">
          <p className="mt-2 text-ink-2">
            Create <code className="text-[0.9em]">env.ts</code> in the project root, like the{" "}
            <a
              href="#top"
              className="text-link underline decoration-current/35 underline-offset-[3px] hover:decoration-current"
            >
              example at the top of this page
            </a>
            . Put secrets in <code className="text-[0.9em]">server</code> and browser values in{" "}
            <code className="text-[0.9em]">client</code>.
          </p>
        </Step>
        <Step n={3} title="Add the plugin">
          <CodeBlock
            code={CONFIG}
            lang="typescript"
            filename="vite.config.ts"
            className="mt-3 mb-0"
          />
        </Step>
        <Step n={4} title="Import the typed env">
          <CodeBlock code={USE} lang="typescript" filename="src/db.ts" className="mt-3 mb-0" />
        </Step>
      </ol>
      <p className="mt-8 text-[16px]">
        <Link
          href="/docs/getting-started"
          className="font-semibold text-link underline decoration-current/35 underline-offset-[3px] hover:decoration-current"
        >
          Continue with the introduction
        </Link>
      </p>
    </Section>
  );
}
