import { Monitor, Moon, Sun } from "lucide-react";
import { useCallback, useState } from "react";

type Pref = "system" | "light" | "dark";
const NEXT: Record<Pref, Pref> = { system: "light", light: "dark", dark: "system" };
const ICON = { system: Monitor, light: Sun, dark: Moon };

function readPref(): Pref {
  const v = localStorage.getItem("theme");
  return v === "light" || v === "dark" ? v : "system";
}

// index.html applies the theme before paint and follows system changes; this only stores the choice.
export function ThemeToggle() {
  const [pref, setPref] = useState<Pref>(readPref);

  const cycle = useCallback(() => {
    const next = NEXT[pref];
    if (next === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", next);
    globalThis.dispatchEvent(new Event("themechange"));
    setPref(next);
  }, [pref]);

  const Icon = ICON[pref];
  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Color theme: ${pref}. Change theme`}
      title={`Theme: ${pref}`}
      className="inline-flex size-9 items-center justify-center rounded text-ink-2 hover:text-ink hover:bg-panel cursor-pointer transition-colors"
    >
      <Icon size={17} aria-hidden />
    </button>
  );
}
