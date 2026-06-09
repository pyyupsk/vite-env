import { type VariantProps } from 'class-variance-authority'
import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { buttonVariants } from './variants'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    leadingIcon?: ReactNode
    trailingIcon?: ReactNode
  }

export function Button({ variant, size, leadingIcon, trailingIcon, children, className, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  )
}
