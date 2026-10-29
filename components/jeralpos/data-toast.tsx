'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastKind = 'success' | 'error'

/**
 * Transient status toast shown after a data action. Callers own the timing and
 * conditionally render this component while a message is present.
 */
export function DataToast({
  message,
  kind = 'success',
  position = 'bottom-right',
}: {
  message: string
  kind?: ToastKind
  position?: 'bottom-right' | 'bottom-center'
}) {
  return (
    <div
      role="status"
      className={cn(
        'fixed z-[60] flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-lg animate-in fade-in',
        position === 'bottom-center'
          ? 'bottom-6 left-1/2 -translate-x-1/2 slide-in-from-bottom-4'
          : 'bottom-5 right-5 slide-in-from-bottom-2',
      )}
    >
      {kind === 'success' ? (
        <CheckCircle2 className="size-4 text-success" aria-hidden />
      ) : (
        <XCircle className="size-4 text-danger" aria-hidden />
      )}
      {message}
    </div>
  )
}
