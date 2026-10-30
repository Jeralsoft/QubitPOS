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
  /**
   * Directriz estricta para POS/ERP:
   * Por defecto las ventanas NO se cierran al hacer clic en el fondo oscuro ni con Esc
   * para prevenir pérdida accidental de datos en operaciones de venta o captura.
   * Solo se cierran explícitamente con la 'X' superior o el botón 'Cancelar'.
   */
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  closeOnBackdropClick = false,
  closeOnEscape = false,
}: ModalProps) {
  React.useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose()
      }
    }

    if (closeOnEscape) {
      document.addEventListener('keydown', onKey)
    }

    document.body.style.overflow = 'hidden'

    return () => {
      if (closeOnEscape) {
        document.removeEventListener('keydown', onKey)
      }
      document.body.style.overflow = ''
    }
  }, [open, onClose, closeOnEscape])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Fondo desenfocado: sin cierre al clic exterior salvo que closeOnBackdropClick sea true */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-md animate-in fade-in duration-200"
        onClick={closeOnBackdropClick ? onClose : undefined}
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

          {/* Botón de cierre en la X superior */}
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 -mt-2 size-8 rounded-full text-muted-foreground hover:text-foreground [&_svg]:size-4"
            onClick={onClose}
            aria-label="Cerrar ventana"
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
