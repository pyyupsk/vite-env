import { useCallback, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { CopyButton } from "./code-block";

const PMS = ["npm", "pnpm", "yarn", "bun"] as const;
type PM = (typeof PMS)[number];

// One stored choice drives every install block on the site, so picking pnpm once sticks.
const KEY = "package-manager";
const EVENT = "package-manager-change";

function subscribe(cb: () => void) {
  globalThis.addEventListener(EVENT, cb);
  globalThis.addEventListener("storage", cb);
  return () => {
    globalThis.removeEventListener(EVENT, cb);
    globalThis.removeEventListener("storage", cb);
  };
}

function read(): PM {
  const v = localStorage.getItem(KEY);
  return PMS.includes(v as PM) ? (v as PM) : "npm";
}

export function installCommand(pm: PM, packages: string, dev: boolean): string {
  const verb = pm === "npm" ? "install" : "add";
  return `${pm} ${verb}${dev ? " -D" : ""} ${packages}`;
}

// Matches a block that is only "npm install [-D] <packages>", which the docs turn into a switcher.
const NPM_INSTALL = /^npm install( -D)? ([^\n]+)$/;

export function parseNpmInstall(code: string): { packages: string; dev: boolean } | null {
  const m = NPM_INSTALL.exec(code.trim());
  return m ? { dev: Boolean(m[1]), packages: m[2] } : null;
}

export function PackageInstall({
  packages,
  dev = true,
  className,
}: Readonly<{ packages: string; dev?: boolean; className?: string }>) {
  const pm = useSyncExternalStore(subscribe, read, () => "npm" as PM);
  const choose = useCallback((next: PM) => {
    localStorage.setItem(KEY, next);
    globalThis.dispatchEvent(new Event(EVENT));
  }, []);
  const cmd = installCommand(pm, packages, dev);

  return (
    <figure className={cn("my-6 rounded-md bg-panel text-[14px]", className)}>
      <div className="flex h-10 items-center justify-between pl-2 pr-1.5">
        <fieldset className="flex gap-0.5">
          <legend className="sr-only">Package manager</legend>
          {PMS.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={pm === key}
              // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
              onClick={() => choose(key)}
              className={cn(
                "rounded px-2 py-0.5 font-mono text-[13px] cursor-pointer transition-colors",
                pm === key ? "bg-ink text-paper" : "text-ink-3 hover:text-ink",
              )}
            >
              {key}
            </button>
          ))}
        </fieldset>
        <CopyButton text={cmd} />
      </div>
      <pre className="m-0 overflow-x-auto px-4 pt-0.5 pb-4 leading-[1.65] text-ink" translate="no">
        <span className="select-none text-ink-3" aria-hidden>
          ${" "}
        </span>
        {cmd}
      </pre>
    </figure>
  );
}
