import * as React from 'react'
import { cn } from '@/lib/utils'

export function Card({
  className,
  interactive,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/75 bg-card text-card-foreground shadow-xs',
        interactive &&
          'transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md cursor-pointer',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 p-6 pb-4', className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-base font-semibold leading-tight tracking-tight text-foreground', className)}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-xs text-muted-foreground leading-relaxed', className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center gap-2 border-t border-border/60 p-6 pt-4', className)}
      {...props}
    />
  )
}
