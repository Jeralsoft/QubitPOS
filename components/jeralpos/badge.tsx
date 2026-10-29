import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap [&_svg]:size-3',
  {
    variants: {
      variant: {
        neutral: 'border-border bg-muted text-muted-foreground',
        primary: 'border-transparent bg-info-muted text-primary',
        success: 'border-transparent bg-success-muted text-success',
        warning: 'border-transparent bg-warning-muted text-warning-foreground',
        danger: 'border-transparent bg-danger-muted text-danger',
        solid: 'border-transparent bg-primary text-primary-foreground',
      },
      size: {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-0.5 text-xs',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

const dotColor: Record<string, string> = {
  neutral: 'bg-muted-foreground',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  solid: 'bg-primary-foreground',
}

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn('size-1.5 rounded-full', dotColor[variant ?? 'neutral'])}
          aria-hidden
        />
      )}
      {children}
    </span>
  )
}

export { badgeVariants }
