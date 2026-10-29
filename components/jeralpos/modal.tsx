'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-navy/45 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-lg animate-in fade-in zoom-in-95 duration-150',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 p-5">
          <div className="flex flex-col gap-1">
            {title && <h2 className="text-lg font-semibold tracking-tight">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 -mt-2 size-8 [&_svg]:size-4"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X />
          </Button>
        </div>
        {children && <div className="px-5 pb-5 text-sm text-foreground">{children}</div>}
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border p-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
