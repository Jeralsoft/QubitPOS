import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap [&_svg]:size-3 tracking-tight',
  {
    variants: {
      variant: {
        neutral: 'border-border/70 bg-muted/60 text-muted-foreground',
        primary: 'border-primary/20 bg-primary/10 text-primary',
        success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        warning: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
        danger: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400',
        solid: 'border-transparent bg-foreground text-background',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-0.5 text-[11px]',
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
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  solid: 'bg-background',
}

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn('size-1.5 rounded-full shrink-0', dotColor[variant ?? 'neutral'])}
          aria-hidden
        />
      )}
      {children}
    </span>
  )
}

export { badgeVariants }
