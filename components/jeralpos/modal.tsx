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
        className="absolute inset-0 bg-foreground/20 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg rounded-3xl border border-border/80 bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div className="flex flex-col gap-1">
            {title && <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>}
            {description && <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 -mt-2 size-8 rounded-full text-muted-foreground hover:text-foreground [&_svg]:size-4"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X />
          </Button>
        </div>
        {children && <div className="px-6 pb-6 text-xs text-foreground">{children}</div>}
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-muted/20 p-6 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
