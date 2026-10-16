import { CopyButton } from "@/components/ui/code-block";

export function InstallCommand({ command }: Readonly<{ command: string }>) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-rule bg-panel py-1.5 pl-4 pr-1.5">
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-[15px]" translate="no">
        <span className="select-none text-ink-3" aria-hidden>
          ${" "}
        </span>
        {command}
      </code>
      <CopyButton text={command} />
    </div>
  );
}
