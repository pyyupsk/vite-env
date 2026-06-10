import { type VariantProps } from "class-variance-authority";
import { type PropsWithChildren } from "react";
import { cn } from "@/lib/cn";
import { badgeVariants, dotVariants } from "./variants";

type BadgeProps = PropsWithChildren<
  VariantProps<typeof badgeVariants> & {
    dot?: boolean;
    className?: string;
  }
>;

export function Badge({ variant = "default", dot, children, className }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", dotVariants[variant ?? "default"])} />
      )}
      {children}
    </span>
  );
}
