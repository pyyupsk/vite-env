import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { CodeBlock } from "@/components/ui/code-block";
import { Link } from "wouter";

export const mdxComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="text-[18px] font-semibold text-text-strong tracking-tight mt-8 mb-3 scroll-mt-20"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3
      className="text-[15px] font-semibold text-text-body tracking-tight mt-5 mb-2 scroll-mt-20"
      {...props}
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="text-[14.5px] text-text-muted leading-[1.7] mb-4" {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="font-mono text-[13px] bg-surface-raised border border-border-subtle rounded-sm px-[0.4em] py-[0.1em] text-accent-text"
      {...props}
    />
  ),
  pre: ({ children }: ComponentPropsWithoutRef<"pre">) => {
    const el = children as ReactElement<{ className?: string; children?: string }>;
    const code = String(el?.props?.children ?? "").trimEnd();
    const className = el?.props?.className ?? "";
    const lang = className.replace("language-", "") || "typescript";
    return <CodeBlock code={code} lang={lang} />;
  },
  a: ({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) => {
    const cls =
      "text-accent-text underline underline-offset-2 hover:text-accent-hover transition-colors duration-fast";
    if (href.startsWith("/")) {
      return (
        <Link href={href} className={cls} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...props}>
        {children}
      </a>
    );
  },
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="text-[14.5px] text-text-muted leading-[1.7] mb-4 pl-5 list-disc space-y-1"
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="text-[14.5px] text-text-muted leading-[1.7] mb-4 pl-5 list-decimal space-y-1"
      {...props}
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => <li className="leading-[1.7]" {...props} />,
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="border-l-2 border-accent pl-4 my-4 text-[14px] text-text-subtle italic"
      {...props}
    />
  ),
  hr: () => <hr className="border-hairline my-8" />,
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-text-body" {...props} />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm border-collapse" {...props} />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead className="border-b border-border-subtle" {...props} />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      className="py-2 px-3 text-left font-mono text-[11px] uppercase tracking-widest text-text-faint"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="py-2.5 px-3 text-[14px] text-text-muted border-b border-hairline" {...props} />
  ),
};
