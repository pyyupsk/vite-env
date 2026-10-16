import { useCallback, useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { highlight } from "@/lib/highlighter";
import { cn } from "@/lib/cn";

type CodeBlockProps = Readonly<{
  code: string;
  lang?: string;
  filename?: string;
  className?: string;
}>;

const LANG_LABEL: Record<string, string> = {
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  javascript: "JavaScript",
  jsx: "JSX",
  bash: "Terminal",
  sh: "Terminal",
  json: "JSON",
  css: "CSS",
  text: "Output",
};

// A leading "// path/to/file.ts" comment becomes the block's file label.
const FILE_COMMENT = /^(?:\/\/|#) ([\w./-]+\.[a-z]+)\n/;

export function splitFilename(code: string): { filename?: string; body: string } {
  const m = FILE_COMMENT.exec(code);
  return m ? { filename: m[1], body: code.slice(m[0].length) } : { body: code };
}

export function CopyButton({ text, className }: Readonly<{ text: string; className?: string }>) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2 py-1 text-[13px] text-ink-3 hover:text-ink hover:bg-paper cursor-pointer transition-colors",
        className,
      )}
    >
      {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

export function CodeBlock({ code, lang = "text", filename, className }: CodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    void highlight(code, lang).then((h) => live && setHtml(h));
    return () => {
      live = false;
    };
  }, [code, lang]);

  return (
    <figure className={cn("my-6 rounded-md bg-panel text-[14px]", className)}>
      <div className="flex h-10 items-center justify-between pl-4 pr-1.5">
        <figcaption className="font-mono text-[13px] text-ink-3" translate="no">
          {filename ?? LANG_LABEL[lang] ?? lang}
        </figcaption>
        <CopyButton text={code} />
      </div>
      {html ? (
        <div
          className="[&>pre]:m-0 [&>pre]:overflow-x-auto [&>pre]:px-4 [&>pre]:pt-0.5 [&>pre]:pb-4 [&>pre]:leading-[1.65]"
          translate="no"
          // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre
          className="m-0 overflow-x-auto px-4 pt-0.5 pb-4 leading-[1.65] text-ink"
          translate="no"
        >
          {code}
        </pre>
      )}
    </figure>
  );
}
