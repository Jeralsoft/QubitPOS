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
      <legend className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
        Método de pago rápido
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
                'flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition-all duration-150 select-none',
                active
                  ? 'border-foreground bg-foreground text-background shadow-2xs font-semibold'
                  : 'border-border/70 bg-card text-foreground/80 hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{method.label}</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
