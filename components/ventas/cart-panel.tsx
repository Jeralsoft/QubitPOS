'use client'

import * as React from 'react'
import { Minus, Plus, Trash2, ShoppingCart, Tag, X } from 'lucide-react'
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
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShoppingCart className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">Carrito</p>
            <p className="text-xs text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
            </p>
          </div>
        </div>
        {!empty && (
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground">
            <X className="size-4" />
            Vaciar
          </Button>
        )}
      </div>

      <div className="border-b border-border p-4">
        <CustomerSelect
          customer={customer}
          customers={customers}
          onSelect={onSelectCustomer}
          onCreate={onCreateCustomer}
          pickerOpen={customerPickerOpen}
          onPickerOpenChange={onCustomerPickerOpenChange}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ShoppingCart className="size-7" />
            </div>
            <div>
              <p className="font-medium">Carrito vacío</p>
              <p className="text-sm text-muted-foreground">
                Toca un producto para agregarlo a la venta.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-border">
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

      <div className="border-t border-border p-4">
        <PaymentSelect value={payment} onSelect={onSelectPayment} />
      </div>

      <div className="border-t border-border bg-muted/40 p-4">
        <dl className="space-y-1.5 text-sm">
          <SummaryRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
          <SummaryRow
            label="Descuento"
            value={totals.discount > 0 ? `- ${formatCurrency(totals.discount)}` : formatCurrency(0)}
            accent={totals.discount > 0 ? 'text-success' : undefined}
          />
          <SummaryRow label="Impuestos (IVA 16%)" value={formatCurrency(totals.tax)} />
        </dl>
        <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-sm font-medium text-muted-foreground">TOTAL</span>
          <span className="text-2xl font-bold tabular-nums tracking-tight">
            {formatCurrency(totals.total)}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" size="lg" onClick={onSave} disabled={empty} className="h-12 justify-between">
            <span>Guardar</span>
            <kbd className="rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-xs">
              F8
            </kbd>
          </Button>
          <Button variant="ghost" size="lg" onClick={onCancel} disabled={empty} className="h-12 justify-between">
            <span>Cancelar</span>
            <kbd className="rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-xs">
              Esc
            </kbd>
          </Button>
        </div>
        <Button
          variant="success"
          size="lg"
          onClick={onCharge}
          disabled={empty || !payment}
          className="mt-2 h-14 w-full justify-between px-5 text-base"
        >
          <span>Cobrar {!empty && formatCurrency(totals.total)}</span>
          <kbd className="rounded border border-white/30 bg-black/20 px-2 py-0.5 text-xs font-semibold text-white shadow-xs">
            F4
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
      <dd className={cn('tabular-nums font-medium', accent)}>{value}</dd>
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
    <li className="p-4">
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 size-9 shrink-0 rounded-md"
          style={{ backgroundColor: product.color }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-tight">{product.name}</p>
          <p className="font-mono text-[11px] text-muted-foreground">{product.code}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatCurrency(product.salePrice)} c/u
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(product.id)}
          aria-label={`Eliminar ${product.name}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-muted hover:text-danger"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-lg border border-border">
          <button
            type="button"
            onClick={() => onChangeQuantity(product.id, quantity - 1)}
            aria-label="Disminuir cantidad"
            className="flex size-9 items-center justify-center rounded-l-lg text-foreground transition-colors hover:bg-accent disabled:opacity-40"
            disabled={quantity <= 1}
          >
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center text-sm font-semibold tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => onChangeQuantity(product.id, quantity + 1)}
            aria-label="Aumentar cantidad"
            className="flex size-9 items-center justify-center rounded-r-lg text-foreground transition-colors hover:bg-accent disabled:opacity-40"
            disabled={quantity >= maxQty}
          >
            <Plus className="size-4" />
          </button>
        </div>
        <div className="text-right">
          {discount > 0 && (
            <p className="text-xs text-muted-foreground line-through tabular-nums">
              {formatCurrency(lineSubtotal(item))}
            </p>
          )}
          <p className="text-sm font-semibold tabular-nums">{formatCurrency(lineTotal(item))}</p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Tag className="size-3.5 text-muted-foreground" aria-hidden />
        <Input
          type="number"
          min={0}
          max={lineSubtotal(item)}
          value={discount === 0 ? '' : discount}
          onChange={(e) => onChangeDiscount(product.id, Number(e.target.value) || 0)}
          placeholder="Descuento"
          className="h-9 text-sm"
          aria-label={`Descuento para ${product.name}`}
        />
      </div>
    </li>
  )
}
