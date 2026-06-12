import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center font-sans cursor-pointer transition-colors duration-fast",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-white border border-accent hover:bg-accent-hover hover:border-accent-hover",
        secondary:
          "bg-surface-raised text-text-body border border-border-default hover:border-border-strong",
        ghost:
          "bg-transparent text-text-subtle border border-transparent hover:text-text-body hover:bg-surface-raised",
      },
      size: {
        sm: "h-7 px-3 text-xs rounded-sm gap-1.5",
        md: "h-8 px-4 text-sm rounded-md gap-2",
        lg: "h-10 px-5 text-sm rounded-md gap-2",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);
