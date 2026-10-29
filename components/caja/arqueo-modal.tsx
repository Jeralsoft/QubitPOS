'use client'

import * as React from 'react'
import { ClipboardCheck, CheckCircle2, AlertTriangle, TrendingDown } from 'lucide-react'
import { Modal } from '@/components/jeralpos/modal'
import { Button } from '@/components/jeralpos/button'
import { Input, Label } from '@/components/jeralpos/input'
import { cn } from '@/lib/utils'
import {
  formatCurrency,
  formatSignedCurrency,
  closingStatusFromDiff,
  closingStatusLabel,
  type ClosingStatus,
} from './mock-data'

export interface ArqueoResult {
  cash: number
  cards: number
  transfers: number
  others: number
  totalCounted: number
  difference: number
  status: ClosingStatus
}

const statusStyles: Record<
  ClosingStatus,
  { icon: typeof CheckCircle2; wrap: string; text: string; label: (v: number) => string }
> = {
  cuadrada: {
    icon: CheckCircle2,
    wrap: 'border-success/40 bg-success-muted',
    text: 'text-success',
    label: () => 'La caja cuadra',
  },
  sobrante: {
    icon: AlertTriangle,
    wrap: 'border-warning/40 bg-warning-muted',
    text: 'text-warning-foreground',
    label: (v) => `Sobrante de ${formatCurrency(Math.abs(v))}`,
  },
  faltante: {
    icon: TrendingDown,
    wrap: 'border-danger/40 bg-danger-muted',
    text: 'text-danger',
    label: (v) => `Faltante de ${formatCurrency(Math.abs(v))}`,
  },
}

function MoneyField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={0}
        inputMode="numeric"
        placeholder="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export function ArqueoModal({
  open,
  expectedCash,
  onClose,
  onConfirm,
}: {
  open: boolean
  expectedCash: number
  onClose: () => void
  onConfirm: (result: ArqueoResult) => void
}) {
  const [cash, setCash] = React.useState('')
  const [cards, setCards] = React.useState('')
  const [transfers, setTransfers] = React.useState('')
  const [others, setOthers] = React.useState('')

  React.useEffect(() => {
    if (open) {
      setCash('')
      setCards('')
      setTransfers('')
      setOthers('')
    }
  }, [open])

  const num = (v: string) => {
    const n = Number.parseFloat(v)
    return Number.isNaN(n) ? 0 : n
  }

  const cashNum = num(cash)
  const totalCounted = cashNum + num(cards) + num(transfers) + num(others)
  // Difference measured against expected cash in the drawer.
  const difference = cashNum - expectedCash
  const status = closingStatusFromDiff(difference)
  const style = statusStyles[status]
  const StatusIcon = style.icon

  const submit = () => {
    onConfirm({
      cash: cashNum,
      cards: num(cards),
      transfers: num(transfers),
      others: num(others),
      totalCounted,
      difference,
      status,
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Arqueo de caja"
      description="Cuenta el dinero físico y compáralo con lo esperado."
      className="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={submit}>
            <ClipboardCheck />
            Registrar arqueo
          </Button>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Efectivo esperado
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
              {formatCurrency(expectedCash)}
            </p>
          </div>
          <MoneyField id="arq-cash" label="Efectivo contado" value={cash} onChange={setCash} />
          <MoneyField id="arq-cards" label="Tarjetas" value={cards} onChange={setCards} />
          <MoneyField
            id="arq-transfers"
            label="Transferencias"
            value={transfers}
            onChange={setTransfers}
          />
          <MoneyField id="arq-others" label="Otros" value={others} onChange={setOthers} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total contado</span>
              <span className="text-lg font-semibold tabular-nums text-foreground">
                {formatCurrency(totalCounted)}
              </span>
            </div>
            <div className="my-3 h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Efectivo esperado</span>
              <span className="tabular-nums text-foreground">{formatCurrency(expectedCash)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Diferencia en efectivo</span>
              <span
                className={cn(
                  'font-semibold tabular-nums',
                  difference > 0
                    ? 'text-warning-foreground'
                    : difference < 0
                      ? 'text-danger'
                      : 'text-success',
                )}
              >
                {formatSignedCurrency(difference)}
              </span>
            </div>
          </div>

          <div className={cn('flex items-center gap-3 rounded-lg border p-4', style.wrap)}>
            <StatusIcon className={cn('size-6 shrink-0', style.text)} aria-hidden />
            <div>
              <p className={cn('text-sm font-semibold', style.text)}>
                {closingStatusLabel[status]}
              </p>
              <p className="text-xs text-muted-foreground">{style.label(difference)}</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            La diferencia se calcula comparando el efectivo contado con el efectivo esperado en la
            caja. Las tarjetas y transferencias se registran como referencia.
          </p>
        </div>
      </div>
    </Modal>
  )
}
