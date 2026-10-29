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
      title="Confirmar Cobro de Venta"
      description={`Cliente asignado: ${customer.name}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} className="rounded-xl">
            Cancelar
          </Button>
          <Button
            variant="navy"
            onClick={onConfirm}
            disabled={!canConfirm}
            className="rounded-xl px-5 bg-foreground text-background hover:bg-foreground/90 font-semibold"
          >
            <CheckCircle2 className="size-4" />
            Finalizar Venta
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Total Display Card */}
        <div className="rounded-2xl border border-border/70 bg-muted/30 p-5 text-center space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total a cobrar</p>
          <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
            {formatCurrency(totals.total)}
          </p>
          {method && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium text-foreground/80 shadow-2xs">
              <method.icon className="size-3.5 text-primary" />
              {method.label}
            </p>
          )}
        </div>

        {isCash && (
          <div className="flex flex-col gap-3">
            <div className="space-y-1.5">
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
                className="h-11 text-base font-semibold tabular-nums rounded-xl"
                autoFocus
              />
              {insufficient && (
                <p className="text-xs text-rose-500 font-medium">
                  El monto recibido es menor al total de la cuenta.
                </p>
              )}
            </div>

            {/* Quick cash pills */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_CASH.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setReceived(String(amount))}
                  className="h-8 flex-1 rounded-xl border border-border/70 bg-card px-2.5 text-xs font-medium tabular-nums transition-colors hover:bg-muted/60"
                >
                  {formatCurrency(amount)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setReceived(String(Math.round(totals.total)))}
                className="h-8 flex-1 rounded-xl border border-foreground/30 bg-muted px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Exacto
              </button>
            </div>

            {/* Change output */}
            <div
              className={cn(
                'flex items-center justify-between rounded-2xl border px-4 py-3 transition-colors',
                change >= 0 && received !== ''
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                  : 'border-border/70 bg-muted/20 text-muted-foreground',
              )}
            >
              <span className="text-xs font-medium">Cambio a entregar</span>
              <span
                className={cn(
                  'text-lg font-bold tabular-nums',
                  change >= 0 && received !== '' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground',
                )}
              >
                {formatCurrency(change > 0 ? change : 0)}
              </span>
            </div>
          </div>
        )}

        {!isCash && method && (
          <p className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-center text-xs text-muted-foreground leading-relaxed">
            Confirma cuando la transacción con <strong>{method.label}</strong> haya sido aprobada en el terminal o datáfono.
          </p>
        )}
      </div>
    </Modal>
  )
}
