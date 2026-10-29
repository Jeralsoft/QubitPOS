'use client'

import * as React from 'react'
import { Minus, Plus, Trash2, ShoppingCart, Tag, X, ArrowRight, UserCheck } from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Input } from '@/components/jeralpos/input'
import { cn } from '@/lib/utils'
import {
  formatCurrency,
  lineSubtotal,
  lineTotal,
  type CartItem,
  type CartTotals,
} from './mock-data'
import { CustomerSelect } from './customer-select'
import { PaymentSelect } from './payment-select'
import type { Customer, PaymentMethodId } from './mock-data'

interface CartPanelProps {
  items: CartItem[]
  totals: CartTotals
  customer: Customer
  customers: Customer[]
  onSelectCustomer: (c: Customer) => void
  onCreateCustomer: (c: Customer) => void
  customerPickerOpen?: boolean
  onCustomerPickerOpenChange?: (open: boolean) => void
  payment: PaymentMethodId | null
  onSelectPayment: (id: PaymentMethodId) => void
  onChangeQuantity: (id: string, quantity: number) => void
  onChangeDiscount: (id: string, discount: number) => void
  onRemove: (id: string) => void
  onCharge: () => void
  onSave: () => void
  onCancel: () => void
}

export function CartPanel(props: CartPanelProps) {
  const {
    items,
    totals,
    customer,
    customers,
    onSelectCustomer,
    onCreateCustomer,
    customerPickerOpen,
    onCustomerPickerOpenChange,
    payment,
    onSelectPayment,
    onChangeQuantity,
    onChangeDiscount,
    onRemove,
    onCharge,
    onSave,
    onCancel,
  } = props

  const empty = items.length === 0
  const itemCount = items.reduce((n, i) => n + i.quantity, 0)

  return (
    <div className="flex h-full flex-col bg-card rounded-2xl border border-border/75 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border/60 p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-xl bg-muted/60 text-foreground">
            <ShoppingCart className="size-4" />
          </span>
          <div>
            <p className="text-xs font-semibold leading-tight text-foreground">Venta Actual</p>
            <p className="text-[11px] text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
            </p>
          </div>
        </div>
        {!empty && (
          <Button variant="ghost" size="sm" onClick={onCancel} className="h-7 text-xs text-muted-foreground hover:text-rose-600">
            <X className="size-3.5" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Customer select */}
      <div className="border-b border-border/60 p-3 bg-muted/20">
        <CustomerSelect
          customer={customer}
          customers={customers}
          onSelect={onSelectCustomer}
          onCreate={onCreateCustomer}
          pickerOpen={customerPickerOpen}
          onPickerOpenChange={onCustomerPickerOpenChange}
        />
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground/60">
              <ShoppingCart className="size-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground">El carrito está vacío</p>
              <p className="text-xs text-muted-foreground">
                Selecciona productos del catálogo para comenzar.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {items.map((item) => (
              <CartRow
                key={item.product.id}
                item={item}
                onChangeQuantity={onChangeQuantity}
                onChangeDiscount={onChangeDiscount}
                onRemove={onRemove}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Payment method selector */}
      <div className="border-t border-border/60 p-3.5 bg-muted/10">
        <PaymentSelect value={payment} onSelect={onSelectPayment} />
      </div>

      {/* Summary calculations */}
      <div className="border-t border-border/60 bg-muted/30 p-4 space-y-3">
        <dl className="space-y-1.5 text-xs">
          <SummaryRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
          <SummaryRow
            label="Descuento"
            value={totals.discount > 0 ? `- ${formatCurrency(totals.discount)}` : formatCurrency(0)}
            accent={totals.discount > 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : undefined}
          />
          <SummaryRow label="IVA (19%)" value={formatCurrency(totals.tax)} />
        </dl>

        <div className="flex items-baseline justify-between border-t border-border/60 pt-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">TOTAL</span>
          <span className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {formatCurrency(totals.total)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onSave} disabled={empty} className="h-9 justify-between rounded-xl">
            <span>Guardar</span>
            <kbd className="rounded border border-border/80 bg-muted/60 px-1 py-0.5 text-[9px] font-mono text-muted-foreground">
              F8
            </kbd>
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={empty} className="h-9 justify-between rounded-xl">
            <span>Cancelar</span>
            <kbd className="rounded border border-border/80 bg-muted/60 px-1 py-0.5 text-[9px] font-mono text-muted-foreground">
              Esc
            </kbd>
          </Button>
        </div>

        <Button
          variant="navy"
          size="lg"
          onClick={onCharge}
          disabled={empty || !payment}
          className="h-12 w-full justify-between px-4 text-xs font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90 shadow-sm"
        >
          <span className="flex items-center gap-1.5">
            <span>Cobrar</span>
            {!empty && <span className="tabular-nums font-bold">({formatCurrency(totals.total)})</span>}
          </span>
          <kbd className="rounded border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-mono text-white">
            F1
          </kbd>
        </Button>
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn('tabular-nums font-medium text-foreground', accent)}>{value}</dd>
    </div>
  )
}

function CartRow({
  item,
  onChangeQuantity,
  onChangeDiscount,
  onRemove,
}: {
  item: CartItem
  onChangeQuantity: (id: string, quantity: number) => void
  onChangeDiscount: (id: string, discount: number) => void
  onRemove: (id: string) => void
}) {
  const { product, quantity, discount } = item
  const maxQty = product.stock

  return (
    <li className="p-3.5 space-y-2.5">
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-foreground leading-snug">{product.name}</p>
          <p className="text-[11px] text-muted-foreground tabular-nums">
            {formatCurrency(product.salePrice)} c/u
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(product.id)}
          aria-label={`Eliminar ${product.name}`}
          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Quantity Stepper */}
        <div className="inline-flex items-center rounded-xl border border-border/80 bg-muted/30">
          <button
            type="button"
            onClick={() => onChangeQuantity(product.id, quantity - 1)}
            aria-label="Disminuir cantidad"
            className="flex size-7 items-center justify-center rounded-l-xl text-foreground transition-colors hover:bg-muted disabled:opacity-30"
            disabled={quantity <= 1}
          >
            <Minus className="size-3" />
          </button>
          <span className="w-8 text-center text-xs font-semibold tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => onChangeQuantity(product.id, quantity + 1)}
            aria-label="Aumentar cantidad"
            className="flex size-7 items-center justify-center rounded-r-xl text-foreground transition-colors hover:bg-muted disabled:opacity-30"
            disabled={quantity >= maxQty}
          >
            <Plus className="size-3" />
          </button>
        </div>

        {/* Item Total */}
        <div className="text-right">
          {discount > 0 && (
            <p className="text-[10px] text-muted-foreground line-through tabular-nums">
              {formatCurrency(lineSubtotal(item))}
            </p>
          )}
          <p className="text-xs font-bold tabular-nums text-foreground">{formatCurrency(lineTotal(item))}</p>
        </div>
      </div>
    </li>
  )
}
