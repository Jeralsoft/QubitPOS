'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/jeralpos/button'

/* Accessible switch ------------------------------------------------- */

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
  size = 'md',
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label?: string
  disabled?: boolean
  size?: 'sm' | 'md'
}) {
  const dims =
    size === 'sm'
      ? { track: 'h-5 w-9', knob: 'size-3.5', on: 'translate-x-4', off: 'translate-x-0.5' }
      : { track: 'h-6 w-11', knob: 'size-4.5', on: 'translate-x-5', off: 'translate-x-0.5' }
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:opacity-50',
        dims.track,
        checked ? 'bg-primary' : 'bg-muted-foreground/30',
      )}
    >
      <span
        className={cn(
          'inline-block rounded-full bg-white shadow-sm transition-transform duration-200',
          dims.knob,
          checked ? dims.on : dims.off,
        )}
      />
    </button>
  )
}

/* Section header ---------------------------------------------------- */

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/* Field grid + field ------------------------------------------------ */

export function FieldGrid({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('grid gap-x-5 gap-y-4 sm:grid-cols-2', className)}>{children}</div>
}

export function Field({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('flex flex-col', className)}>{children}</div>
}

/* Toggle setting row ------------------------------------------------ */

export function SettingRow({
  title,
  description,
  control,
  className,
}: {
  title: string
  description?: string
  control: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0',
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  )
}

export function DividedList({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-border">{children}</div>
}

/* Sticky save bar --------------------------------------------------- */

export function SaveBar({
  onSave,
  onReset,
  saving,
  hint = 'Los cambios se aplicarán al conectar la API.',
}: {
  onSave: () => void
  onReset?: () => void
  saving?: boolean
  hint?: string
}) {
  return (
    <div className="sticky bottom-0 -mx-1 mt-2 flex items-center justify-between gap-4 border-t border-border bg-card/80 px-1 py-3 backdrop-blur">
      <p className="hidden text-xs text-muted-foreground sm:block">{hint}</p>
      <div className="flex items-center gap-2 max-sm:w-full max-sm:justify-end">
        {onReset && (
          <Button variant="ghost" size="md" onClick={onReset} disabled={saving}>
            Descartar
          </Button>
        )}
        <Button variant="primary" size="md" onClick={onSave} loading={saving}>
          Guardar cambios
        </Button>
      </div>
    </div>
  )
}

/* Info callout ------------------------------------------------------ */

export function InfoNote({
  children,
  tone = 'info',
}: {
  children: React.ReactNode
  tone?: 'info' | 'warning'
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm',
        tone === 'info'
          ? 'border-info-muted bg-info-muted/50 text-foreground'
          : 'border-warning-muted bg-warning-muted/50 text-foreground',
      )}
    >
      {children}
    </div>
  )
}
