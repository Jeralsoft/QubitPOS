'use client'

import * as React from 'react'
import {
  CircleDollarSign,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  CreditCard,
  Building2,
  FileCheck,
  MoreHorizontal,
  Check,
} from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Input, Select, Label, Textarea } from '@/components/jeralpos/input'
import { Modal } from '@/components/jeralpos/modal'
import { Badge } from '@/components/jeralpos/badge'
import { cn } from '@/lib/utils'
import {
  type Receivable,
  type PaymentMethod,
  balance,
  paidAmount,
  formatCurrency,
  statusLabel,
  statusVariant,
  statusOf,
  daysOverdue,
  paymentMethods,
  collectors,
  TODAY,
} from './mock-data'

export interface PaymentDraft {
  date: string
  method: PaymentMethod
  amount: number
  reference: string
  notes: string
  receivedBy: string
}

const methodIcons: Record<PaymentMethod, typeof Banknote> = {
  Efectivo: Banknote,
  Tarjeta: CreditCard,
  Transferencia: Building2,
  Cheque: FileCheck,
  Otro: MoreHorizontal,
}

export function PaymentModal({
  receivable,
  onClose,
  onSubmit,
}: {
  receivable: Receivable
  onClose: () => void
  onSubmit: (draft: PaymentDraft) => void
}) {
  const prevBalance = balance(receivable)
  const [date, setDate] = React.useState(TODAY)
  const [method, setMethod] = React.useState<PaymentMethod>('Efectivo')
  const [amountStr, setAmountStr] = React.useState('')
  const [reference, setReference] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [receivedBy, setReceivedBy] = React.useState(collectors[0])
  const [error, setError] = React.useState<string | null>(null)

  const amount = Number(amountStr.replace(/[^\d]/g, '')) || 0
  const newBalance = Math.max(0, prevBalance - amount)
  const excess = amount > prevBalance
  const od = daysOverdue(receivable)

  const handleSubmit = () => {
    if (amount <= 0) {
      setError('Ingresa un valor recibido mayor a cero.')
      return
    }
    if (excess) {
      setError('El valor recibido no puede superar el saldo pendiente.')
      return
    }
    onSubmit({ date, method, amount, reference, notes, receivedBy })
  }

  const quickAmounts = [
    { label: '25%', value: Math.round(prevBalance * 0.25) },
    { label: '50%', value: Math.round(prevBalance * 0.5) },
    { label: '75%', value: Math.round(prevBalance * 0.75) },
    { label: 'Saldo Total', value: prevBalance },
  ]

  return (
    <Modal
      open
      onClose={onClose}
      title="Registrar cobro de cartera"
      description={`Factura ${receivable.invoice} · ${receivable.customerName}`}
      className="w-full max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={amount <= 0 || excess}>
            <CheckCircle2 />
            Confirmar cobro
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Balance summary */}
        <div className="grid gap-3 rounded-xl border border-border bg-muted/40 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total factura</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground">
              {formatCurrency(receivable.total)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Ya abonado</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-success">
              {formatCurrency(paidAmount(receivable))}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Saldo pendiente</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-primary">
              {formatCurrency(prevBalance)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm rounded-lg border border-border px-3 py-2 bg-card">
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant[statusOf(receivable)]} size="sm">
              {statusLabel[statusOf(receivable)]}
            </Badge>
            <span className="text-muted-foreground text-xs">
              Vence: <strong className="text-foreground">{receivable.dueDate}</strong>
            </span>
          </div>
          {od > 0 && (
            <span className="inline-flex items-center gap-1 font-semibold text-danger text-xs">
              <AlertTriangle className="size-3.5" />
              {od} días de mora
            </span>
          )}
        </div>

        {/* Form */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Method Horizontal Selector */}
          <div className="sm:col-span-2">
            <Label className="mb-2 block">Método de recaudo</Label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full">
              {paymentMethods.map((m) => {
                const isSelected = method === m
                const Icon = methodIcons[m] ?? MoreHorizontal
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={cn(
                      'relative flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-center transition-all',
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary font-semibold shadow-xs'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    )}
                  >
                    <Icon className="size-4" />
                    <span className="text-xs">{m}</span>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5">
                        <Check className="size-3 text-primary" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="pay-date">Fecha del pago</Label>
            <Input
              id="pay-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pay-by">Recaudador / Cajero</Label>
            <Select id="pay-by" value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)}>
              {collectors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="pay-amount" required>
              Valor a recaudar (COP)
            </Label>
            <Input
              id="pay-amount"
              inputMode="numeric"
              leadingIcon={<CircleDollarSign />}
              placeholder="0"
              value={amountStr === '' ? '' : formatCurrency(amount)}
              onChange={(e) => {
                setAmountStr(e.target.value)
                setError(null)
              }}
              invalid={excess || (error !== null && amount <= 0)}
            />
            {error && <p className="mt-1 text-xs text-danger">{error}</p>}
            <div className="mt-2.5 flex flex-wrap gap-2">
              {quickAmounts.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => {
                    setAmountStr(String(q.value))
                    setError(null)
                  }}
                  className="rounded-lg border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:border-primary/50"
                >
                  {q.label} ({formatCurrency(q.value)})
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="pay-ref">Referencia o No. de comprobante</Label>
            <Input
              id="pay-ref"
              placeholder="ej. Nro transferencia, comprobante bancario, recibo de caja..."
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="pay-notes">Observaciones del cobro</Label>
            <Textarea
              id="pay-notes"
              rows={2}
              placeholder="Notas aclaratorias adicionales (opcional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {amount > 0 && !excess && (
            <div className="sm:col-span-2 flex items-center justify-between rounded-lg bg-success/10 border border-success/30 p-3 text-xs text-success">
              <span>Nuevo saldo tras registrar este pago:</span>
              <strong className="text-sm font-bold tabular-nums">
                {formatCurrency(newBalance)}
              </strong>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
