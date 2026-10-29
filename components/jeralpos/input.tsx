import * as React from 'react'
import { cn } from '@/lib/utils'

const fieldBase =
  'w-full rounded-lg border bg-card text-foreground shadow-xs transition-colors duration-150 placeholder:text-muted-foreground/70 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
  leadingIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, leadingIcon, ...props }, ref) => {
    if (leadingIcon) {
      return (
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:size-4">
            {leadingIcon}
          </span>
          <input
            ref={ref}
            aria-invalid={invalid || undefined}
            className={cn(
              fieldBase,
              'h-10 pl-9 pr-3 text-sm',
              invalid && 'border-danger focus-visible:border-danger focus-visible:ring-danger/25',
              className,
            )}
            {...props}
          />
        </div>
      )
    }
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          fieldBase,
          'h-10 px-3 text-sm',
          invalid && 'border-danger focus-visible:border-danger focus-visible:ring-danger/25',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(({ className, invalid, ...props }, ref) => (
  <textarea
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      fieldBase,
      'min-h-20 px-3 py-2 text-sm',
      invalid && 'border-danger focus-visible:border-danger focus-visible:ring-danger/25',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
>(({ className, invalid, children, ...props }, ref) => (
  <select
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      fieldBase,
      'h-10 px-3 text-sm appearance-none bg-[length:1rem] bg-[right_0.65rem_center] bg-no-repeat pr-9',
      "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
      invalid && 'border-danger focus-visible:border-danger focus-visible:ring-danger/25',
      className,
    )}
    {...props}
  >
    {children}
  </select>
))
Select.displayName = 'Select'

export function Label({
  className,
  children,
  required,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn('mb-1.5 block text-sm font-medium text-foreground', className)} {...props}>
      {children}
      {required && <span className="ml-0.5 text-danger">*</span>}
    </label>
  )
}

export function FieldHint({
  children,
  invalid,
  className,
}: {
  children: React.ReactNode
  invalid?: boolean
  className?: string
}) {
  return (
    <p className={cn('mt-1.5 text-xs', invalid ? 'text-danger' : 'text-muted-foreground', className)}>
      {children}
    </p>
  )
}
