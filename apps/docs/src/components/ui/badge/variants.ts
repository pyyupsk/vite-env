import { cva, type VariantProps } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2 h-5 text-xs font-mono rounded-full border',
  {
    variants: {
      variant: {
        default: 'bg-surface-raised text-text-muted border-border-default',
        accent: 'bg-accent-soft text-accent-text border-border-accent/40',
        success: 'bg-success-soft text-success border-success/30',
        danger: 'bg-danger-soft text-danger border-danger/30',
        warning: 'bg-warning-soft text-warning border-warning/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export const dotVariants: Record<NonNullable<VariantProps<typeof badgeVariants>['variant']>, string> = {
  default: 'bg-text-faint',
  accent: 'bg-accent',
  success: 'bg-success',
  danger: 'bg-danger',
  warning: 'bg-warning',
}
