'use client'

import * as React from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Input, Label } from '@/components/jeralpos/input'
import { Modal } from '@/components/jeralpos/modal'
import { cn } from '@/lib/utils'
import {
  formatCurrency,
  paymentMethods,
  type CartTotals,
  type Customer,
  type PaymentMethodId,
} from './mock-data'

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  totals: CartTotals
  customer: Customer
  payment: PaymentMethodId | null
}

const QUICK_CASH = [10000, 20000, 50000, 100000]

export function PaymentModal({
  open,
  onClose,
  onConfirm,
  totals,
  customer,
  payment,
}: PaymentModalProps) {
  const [received, setReceived] = React.useState('')
  const method = paymentMethods.find((m) => m.id === payment)
  const isCash = payment === 'efectivo'

  React.useEffect(() => {
    if (open) setReceived('')
  }, [open])

  const receivedNum = Number(received) || 0
  const change = receivedNum - totals.total
  const insufficient = isCash && received !== '' && change < 0
  const canConfirm = !isCash || (received !== '' && change >= 0)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirmar pago"
      description={`Cliente: ${customer.name}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="success" onClick={onConfirm} disabled={!canConfirm}>
            <CheckCircle2 className="size-4" />
            Confirmar pago
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-muted/40 p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total a cobrar</p>
          <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight">
            {formatCurrency(totals.total)}
          </p>
          {method && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <method.icon className="size-3.5" />
              {method.label}
            </p>
          )}
        </div>

        {isCash && (
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="cash-received">Efectivo recibido</Label>
              <Input
                id="cash-received"
                type="number"
                min={0}
                inputMode="decimal"
                value={received}
                onChange={(e) => setReceived(e.target.value)}
                invalid={insufficient}
                placeholder="0"
                className="h-12 text-lg"
                autoFocus
              />
              {insufficient && (
                <p className="mt-1.5 text-xs text-danger">
                  El monto recibido es menor al total.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_CASH.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setReceived(String(amount))}
                  className="h-10 flex-1 rounded-lg border border-border bg-card px-3 text-sm font-medium tabular-nums transition-colors hover:bg-accent"
                >
                  {formatCurrency(amount)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setReceived(String(Math.round(totals.total)))}
                className="h-10 flex-1 rounded-lg border border-primary bg-info-muted px-3 text-sm font-medium text-primary transition-colors"
              >
                Exacto
              </button>
            </div>
            <div
              className={cn(
                'flex items-center justify-between rounded-lg border px-4 py-3',
                change >= 0 && received !== ''
                  ? 'border-success/40 bg-success-muted'
                  : 'border-border bg-muted/40',
              )}
            >
              <span className="text-sm font-medium">Cambio</span>
              <span
                className={cn(
                  'text-xl font-bold tabular-nums',
                  change >= 0 && received !== '' ? 'text-success' : 'text-muted-foreground',
                )}
              >
                {formatCurrency(change > 0 ? change : 0)}
              </span>
            </div>
          </div>
        )}

        {!isCash && method && (
          <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground">
            Confirma cuando el pago con {method.label.toLowerCase()} haya sido procesado.
          </p>
        )}
      </div>
    </Modal>
  )
}
