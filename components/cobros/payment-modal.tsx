'use client'

import * as React from 'react'
import { CircleDollarSign, CheckCircle2, AlertTriangle } from 'lucide-react'
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
    { label: 'Total', value: prevBalance },
  ]

  return (
    <Modal
      open
      onClose={onClose}
      title="Registrar cobro"
      description={`Factura ${receivable.invoice} · ${receivable.customerName}`}
      className="w-full max-w-2xl"
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
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Pagado</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground">
              {formatCurrency(paidAmount(receivable))}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Saldo anterior</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-primary">
              {formatCurrency(prevBalance)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant={statusVariant[statusOf(receivable)]} size="sm">
            {statusLabel[statusOf(receivable)]}
          </Badge>
          <span className="text-muted-foreground">
            Vence {receivable.dueDate}
            {od > 0 && <span className="ml-1 font-medium text-danger">· {od} días vencida</span>}
          </span>
        </div>

        {/* Form */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="pay-date">Fecha</Label>
            <Input
              id="pay-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pay-method">Método de pago</Label>
            <Select
              id="pay-method"
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            >
              {paymentMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="pay-amount" required>
              Valor recibido
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
            <div className="mt-2 flex flex-wrap gap-2">
              {quickAmounts.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => {
                    setAmountStr(String(q.value))
                    setError(null)
                  }}
                  className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="pay-ref">Referencia</Label>
            <Input
              id="pay-ref"
              placeholder="No. transacción o recibo"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pay-by">Recibido por</Label>
            <Select id="pay-by" value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)}>
              {collectors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="pay-notes">Observaciones</Label>
            <Textarea
              id="pay-notes"
              rows={2}
              placeholder="Notas del cobro (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Live balance */}
        <div className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Saldo anterior</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground">
              {formatCurrency(prevBalance)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Abono</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-success">
              {formatCurrency(amount)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Nuevo saldo</p>
            <p
              className={cn(
                'mt-0.5 text-base font-semibold tabular-nums',
                newBalance === 0 ? 'text-success' : 'text-foreground',
              )}
            >
              {formatCurrency(newBalance)}
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-muted px-3 py-2 text-sm text-danger">
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
            {error}
          </div>
        )}
        {!error && newBalance === 0 && amount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success-muted px-3 py-2 text-sm text-success">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            Este cobro salda la factura por completo.
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            <CircleDollarSign />
            Registrar cobro
          </Button>
        </div>
      </div>
    </Modal>
  )
}
