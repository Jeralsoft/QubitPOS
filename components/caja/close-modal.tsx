'use client'

import * as React from 'react'
import { Lock, CheckCircle2, AlertTriangle, TrendingDown } from 'lucide-react'
import { Modal } from '@/components/jeralpos/modal'
import { Button } from '@/components/jeralpos/button'
import { cn } from '@/lib/utils'
import {
  formatCurrency,
  formatSignedCurrency,
  closingStatusLabel,
  type CajaSession,
  type CajaSummary,
  type ClosingStatus,
} from './mock-data'

function Row({
  label,
  value,
  tone,
  strong,
}: {
  label: string
  value: string
  tone?: 'success' | 'danger' | 'warning'
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className={cn('text-sm', strong ? 'font-medium text-foreground' : 'text-muted-foreground')}>
        {label}
      </span>
      <span
        className={cn(
          'tabular-nums',
          strong ? 'text-base font-semibold' : 'text-sm',
          tone === 'success' && 'text-success',
          tone === 'danger' && 'text-danger',
          tone === 'warning' && 'text-warning-foreground',
          !tone && 'text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  )
}

const statusStyles: Record<ClosingStatus, { icon: typeof CheckCircle2; wrap: string; text: string }> = {
  cuadrada: { icon: CheckCircle2, wrap: 'border-success/40 bg-success-muted', text: 'text-success' },
  sobrante: { icon: AlertTriangle, wrap: 'border-warning/40 bg-warning-muted', text: 'text-warning-foreground' },
  faltante: { icon: TrendingDown, wrap: 'border-danger/40 bg-danger-muted', text: 'text-danger' },
}

export function CloseCashModal({
  open,
  session,
  summary,
  countedCash,
  status,
  onClose,
  onConfirm,
}: {
  open: boolean
  session: CajaSession
  summary: CajaSummary
  countedCash: number | null
  status: ClosingStatus
  onClose: () => void
  onConfirm: () => void
}) {
  const expected = summary.cashExpected
  const real = countedCash ?? expected
  const difference = real - expected
  const style = statusStyles[status]
  const StatusIcon = style.icon

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cerrar caja"
      description={`Resumen del cierre de ${session.register} · ${session.branch}`}
      className="max-w-lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            <Lock />
            Confirmar cierre
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {countedCash === null && (
          <div className="flex items-center gap-2.5 rounded-lg border border-warning/40 bg-warning-muted p-3 text-xs text-warning-foreground">
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
            Aún no se ha registrado un arqueo. El saldo real se asume igual al esperado.
          </div>
        )}

        <div className="rounded-lg border border-border bg-card px-4 py-1 divide-y divide-border">
          <Row label="Saldo inicial" value={formatCurrency(summary.openingBalance)} />
          <Row label="Total ventas" value={formatCurrency(summary.sales)} />
          <Row label="Ingresos" value={formatCurrency(summary.income)} tone="success" />
          <Row label="Egresos" value={`- ${formatCurrency(summary.expense)}`} tone="danger" />
          <Row label="Devoluciones" value={`- ${formatCurrency(summary.refunds)}`} tone="danger" />
          <Row label="Saldo esperado" value={formatCurrency(expected)} strong />
          <Row label="Saldo real" value={formatCurrency(real)} strong />
          <Row
            label="Diferencia"
            value={formatSignedCurrency(difference)}
            strong
            tone={difference > 0 ? 'warning' : difference < 0 ? 'danger' : 'success'}
          />
        </div>

        <div className={cn('flex items-center gap-3 rounded-lg border p-4', style.wrap)}>
          <StatusIcon className={cn('size-6 shrink-0', style.text)} aria-hidden />
          <div>
            <p className={cn('text-sm font-semibold', style.text)}>{closingStatusLabel[status]}</p>
            <p className="text-xs text-muted-foreground">
              {difference === 0
                ? 'El efectivo contado coincide con lo esperado.'
                : difference > 0
                  ? `Hay ${formatCurrency(Math.abs(difference))} de más en la caja.`
                  : `Faltan ${formatCurrency(Math.abs(difference))} en la caja.`}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}
