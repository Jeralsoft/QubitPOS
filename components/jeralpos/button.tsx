import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium text-xs tracking-tight transition-all duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-2xs hover:bg-primary/95 active:bg-primary',
        navy: 'bg-foreground text-background shadow-2xs hover:bg-foreground/90',
        secondary:
          'bg-muted/50 text-foreground border border-border/70 hover:bg-muted',
        outline:
          'border border-border/80 bg-card text-foreground shadow-2xs hover:bg-muted/60 hover:text-foreground',
        ghost: 'bg-transparent text-foreground hover:bg-muted/60 hover:text-foreground',
        success: 'bg-emerald-600 text-white shadow-2xs hover:bg-emerald-700 active:bg-emerald-800',
        danger: 'bg-rose-600 text-white shadow-2xs hover:bg-rose-700 active:bg-rose-800',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-2.5 text-xs [&_svg]:size-3.5',
        md: 'h-9 px-3.5 text-xs [&_svg]:size-4',
        lg: 'h-11 px-5 text-sm [&_svg]:size-4',
        icon: 'size-9 [&_svg]:size-4',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" aria-hidden />}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'

export { buttonVariants }
