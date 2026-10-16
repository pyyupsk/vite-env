import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { CodeBlock, splitFilename } from "@/components/ui/code-block";
import { Link } from "wouter";

const linkCls =
  "text-link underline decoration-1 underline-offset-[3px] decoration-current/35 hover:decoration-current hover:text-link-hover";

export const mdxComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="mt-14 mb-4 border-t border-rule pt-8 [header+&]:mt-0 [header+&]:border-t-0 [header+&]:pt-0 text-[1.5rem] font-bold leading-tight tracking-[-0.015em]"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-10 mb-3 text-[1.1875rem] font-semibold leading-snug" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => <p className="mb-5" {...props} />,
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded bg-panel px-[0.3em] py-[0.1em] text-[0.85em] text-ink [overflow-wrap:anywhere]"
      translate="no"
      {...props}
    />
  ),
  pre: ({ children }: ComponentPropsWithoutRef<"pre">) => {
    const el = children as ReactElement<{ className?: string; children?: string }>;
    const raw = String(el?.props?.children ?? "").trimEnd();
    const lang = (el?.props?.className ?? "").replace("language-", "") || "text";
    const { filename, body } = splitFilename(raw);
    return <CodeBlock code={body} lang={lang} filename={filename} />;
  },
  a: ({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) =>
    href.startsWith("/") ? (
      <Link href={href} className={linkCls} {...props}>
        {children}
      </Link>
    ) : (
      <a href={href} className={linkCls} {...props}>
        {children}
      </a>
    ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="mb-5 list-disc space-y-2 pl-6 marker:text-ink-3" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="mb-5 list-decimal space-y-2 pl-6 marker:text-ink-3" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => <li className="pl-1" {...props} />,
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="my-6 rounded-md bg-panel px-5 py-4 [&>p:last-child]:mb-0" {...props} />
  ),
  hr: () => <hr className="my-10 border-rule" />,
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold" {...props} />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-7 overflow-x-auto">
      <table
        className="w-full border-collapse border-t-2 border-rule-strong text-[15px] tabular-nums"
        {...props}
      />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead className="border-b border-rule-strong" {...props} />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th className="py-2.5 pr-5 text-left align-bottom text-[14px] font-semibold" {...props} />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="border-b border-rule py-2.5 pr-5 align-top text-ink-2" {...props} />
  ),
};
