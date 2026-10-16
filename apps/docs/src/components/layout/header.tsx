import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { GithubIcon } from "@/components/icons/github";
import { Logo } from "@/components/icons/logo";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/cn";

export const REPO = "https://github.com/pyyupsk/vite-env";

const navLink = "text-[15px] text-ink-2 hover:text-ink transition-colors";

type HeaderProps = Readonly<{
  wide?: boolean;
  menuOpen?: boolean;
  onMenu?: () => void;
}>;

export function Header({ wide, menuOpen, onMenu }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur-sm supports-[backdrop-filter]:bg-paper/85">
      <div className={cn("flex h-14 items-center gap-6", wide ? "px-4 md:px-6" : "container-page")}>
        {onMenu && (
          <button
            type="button"
            onClick={onMenu}
            aria-expanded={menuOpen}
            aria-controls="docs-nav"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            className="-ml-2 inline-flex size-9 items-center justify-center rounded text-ink hover:bg-panel lg:hidden cursor-pointer"
          >
            {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        )}

        <Link href="/" className="flex items-center gap-2 text-ink" translate="no">
          <Logo size={24} />
          <span className="font-semibold text-[17px] tracking-[-0.01em]">vite-env</span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-6">
          <Link href="/docs" className={cn(navLink, onMenu && "hidden sm:inline")}>
            Docs
          </Link>
          <a href={`${REPO}/tree/main/examples`} className={cn(navLink, "hidden sm:inline")}>
            Examples
          </a>
          <a href={`${REPO}/releases`} className={cn(navLink, "hidden sm:inline")}>
            Releases
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <span className="hidden font-mono text-[13px] text-ink-3 md:inline mr-2" translate="no">
            v{__CORE_VERSION__}
          </span>
          <a
            href={REPO}
            aria-label="vite-env on GitHub"
            className="inline-flex size-9 items-center justify-center rounded text-ink-2 hover:text-ink hover:bg-panel transition-colors"
          >
            <GithubIcon size={18} />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
