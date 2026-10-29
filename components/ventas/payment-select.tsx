'use client'

import { cn } from '@/lib/utils'
import { paymentMethods, type PaymentMethodId } from './mock-data'

interface PaymentSelectProps {
  value: PaymentMethodId | null
  onSelect: (id: PaymentMethodId) => void
}

export function PaymentSelect({ value, onSelect }: PaymentSelectProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Método de pago
      </legend>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Método de pago">
        {paymentMethods.map((method) => {
          const active = value === method.id
          const Icon = method.icon
          return (
            <button
              key={method.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(method.id)}
              className={cn(
                'flex h-14 items-center gap-2.5 rounded-lg border px-3 text-sm font-medium transition-colors duration-150',
                active
                  ? 'border-primary bg-info-muted text-primary shadow-xs'
                  : 'border-border bg-card text-foreground hover:bg-accent',
              )}
            >
              <Icon className="size-5 shrink-0" />
              {method.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
