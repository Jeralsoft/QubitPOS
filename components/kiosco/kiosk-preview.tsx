'use client'

import * as React from 'react'
import { Plus, Minus, Trash2, ShoppingCart, ArrowLeft, Check, Utensils, ShoppingBag } from 'lucide-react'
import { Logo } from '@/components/jeralpos/brand'
import { Button } from '@/components/jeralpos/button'
import { cn } from '@/lib/utils'
import {
  kioskCategories,
  kioskProducts,
  formatCurrency,
  type KioskProduct,
} from './mock-data'

interface CartLine {
  product: KioskProduct
  qty: number
}

type Stage = 'menu' | 'cart' | 'pago' | 'confirm'

const IVA_RATE = 0.19

export function KioskPreview() {
  const [category, setCategory] = React.useState(kioskCategories[0].id)
  const [cart, setCart] = React.useState<CartLine[]>([])
  const [stage, setStage] = React.useState<Stage>('menu')
  const [orderType, setOrderType] = React.useState<'aqui' | 'llevar'>('aqui')
  const [payment, setPayment] = React.useState<string | null>(null)
  const [turno, setTurno] = React.useState<number>(0)

  const visibleProducts = React.useMemo(() => {
    if (category === 'destacados') return kioskProducts.filter((p) => p.featured)
    return kioskProducts.filter((p) => p.category === category)
  }, [category])

  const totalItems = cart.reduce((sum, l) => sum + l.qty, 0)
  const subtotal = cart.reduce((sum, l) => sum + l.product.price * l.qty, 0)
  const iva = Math.round(subtotal - subtotal / (1 + IVA_RATE))
  const total = subtotal

  const addToCart = (product: KioskProduct) =>
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id)
      if (existing) return prev.map((l) => (l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l))
      return [...prev, { product, qty: 1 }]
    })

  const changeQty = (id: string, delta: number) =>
    setCart((prev) =>
      prev
        .map((l) => (l.product.id === id ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0),
    )

  const removeLine = (id: string) => setCart((prev) => prev.filter((l) => l.product.id !== id))

  const confirmPayment = () => {
    setTurno(Math.floor(Math.random() * 80) + 20)
    setStage('confirm')
  }

  const resetKiosk = () => {
    setCart([])
    setStage('menu')
    setPayment(null)
    setCategory(kioskCategories[0].id)
    setOrderType('aqui')
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Device frame */}
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border-4 border-navy/20 bg-background shadow-lg">
        <div className="flex h-[720px] flex-col">
          {/* Kiosk top bar — keeps JERALPOS identity */}
          <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-6 py-4">
            <Logo />
            <div className="flex items-center gap-3">
              <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
                Autoservicio
              </span>
              {totalItems > 0 && stage === 'menu' && (
                <Button variant="primary" size="md" onClick={() => setStage('cart')}>
                  <ShoppingCart />
                  {totalItems} · {formatCurrency(total)}
                </Button>
              )}
            </div>
          </header>

          {/* Stages */}
          {stage === 'menu' && (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="border-b border-border bg-card px-4 py-3">
                <p className="mb-3 px-2 text-2xl font-bold tracking-tight text-foreground">
                  ¿Qué vas a pedir hoy?
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {kioskCategories.map((c) => {
                    const Icon = c.icon
                    const active = c.id === category
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        aria-current={active ? 'true' : undefined}
                        className={cn(
                          'flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors [&_svg]:size-4',
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-card text-foreground hover:bg-accent',
                        )}
                      >
                        <Icon aria-hidden />
                        {c.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {visibleProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addToCart(p)}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                    >
                      <div className="flex aspect-[4/3] items-center justify-center bg-muted text-muted-foreground/50">
                        <Utensils className="size-10" aria-hidden />
                      </div>
                      <div className="flex flex-1 flex-col gap-1 p-3">
                        <p className="text-sm font-semibold leading-tight text-foreground">{p.name}</p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-base font-bold tabular-nums text-foreground">
                            {formatCurrency(p.price)}
                          </span>
                          <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110 [&_svg]:size-4">
                            <Plus aria-hidden />
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {stage === 'cart' && (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center gap-3 border-b border-border bg-card px-6 py-4">
                <Button variant="ghost" size="icon" onClick={() => setStage('menu')} aria-label="Volver al menú">
                  <ArrowLeft />
                </Button>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Tu pedido</h2>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                    <ShoppingCart className="size-12" aria-hidden />
                    <p className="text-sm">Tu carrito está vacío</p>
                    <Button variant="outline" onClick={() => setStage('menu')}>
                      Ver menú
                    </Button>
                  </div>
                ) : (
                  <ul className="mx-auto flex max-w-2xl flex-col gap-3">
                    {cart.map((l) => (
                      <li
                        key={l.product.id}
                        className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm"
                      >
                        <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground/50">
                          <Utensils className="size-6" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{l.product.name}</p>
                          <p className="text-sm tabular-nums text-muted-foreground">
                            {formatCurrency(l.product.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-9"
                            onClick={() => changeQty(l.product.id, -1)}
                            aria-label="Quitar uno"
                          >
                            <Minus />
                          </Button>
                          <span className="w-6 text-center text-base font-bold tabular-nums">{l.qty}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-9"
                            onClick={() => changeQty(l.product.id, 1)}
                            aria-label="Agregar uno"
                          >
                            <Plus />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 text-danger"
                            onClick={() => removeLine(l.product.id)}
                            aria-label="Eliminar del carrito"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-border bg-card p-4">
                  <div className="mx-auto flex max-w-2xl flex-col gap-3">
                    <div className="flex justify-center gap-2">
                      {(['aqui', 'llevar'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setOrderType(t)}
                          aria-pressed={orderType === t}
                          className={cn(
                            'flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors',
                            orderType === t
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-card text-muted-foreground hover:bg-accent',
                          )}
                        >
                          {t === 'aqui' ? 'Comer aquí' : 'Para llevar'}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>IVA incluido (19%)</span>
                      <span className="tabular-nums">{formatCurrency(iva)}</span>
                    </div>
                    <div className="flex items-center justify-between text-lg font-bold text-foreground">
                      <span>Total</span>
                      <span className="tabular-nums">{formatCurrency(total)}</span>
                    </div>
                    <Button variant="primary" size="lg" className="w-full" onClick={() => setStage('pago')}>
                      Ir a pagar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {stage === 'pago' && (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center gap-3 border-b border-border bg-card px-6 py-4">
                <Button variant="ghost" size="icon" onClick={() => setStage('cart')} aria-label="Volver al carrito">
                  <ArrowLeft />
                </Button>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Elige el pago</h2>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-6">
                <div className="mx-auto flex max-w-md flex-col gap-3">
                  {['Tarjeta débito / crédito', 'QR / Nequi', 'Efectivo en caja'].map((method) => {
                    const active = payment === method
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPayment(method)}
                        aria-pressed={active}
                        className={cn(
                          'flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-base font-semibold transition-colors',
                          active
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card text-foreground hover:bg-accent',
                        )}
                      >
                        {method}
                        {active && <Check className="size-5" aria-hidden />}
                      </button>
                    )
                  })}
                  <div className="mt-2 flex items-center justify-between rounded-2xl bg-muted px-5 py-4 text-lg font-bold text-foreground">
                    <span>Total a pagar</span>
                    <span className="tabular-nums">{formatCurrency(total)}</span>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={!payment}
                    onClick={confirmPayment}
                  >
                    Confirmar pago
                  </Button>
                </div>
              </div>
            </div>
          )}

          {stage === 'confirm' && (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
              <span className="grid size-24 place-items-center rounded-full bg-success-muted text-success [&_svg]:size-12">
                <Check aria-hidden />
              </span>
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">¡Pedido confirmado!</h2>
                <p className="text-muted-foreground">
                  Gracias por tu compra. Prepararemos tu pedido en breve.
                </p>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card px-10 py-6 shadow-sm">
                <span className="text-sm font-medium text-muted-foreground">Tu turno</span>
                <span className="text-5xl font-bold tabular-nums text-primary">{turno}</span>
                <span className="mt-2 text-sm text-muted-foreground">
                  {orderType === 'aqui' ? 'Para comer aquí' : 'Para llevar'} · {formatCurrency(total)}
                </span>
              </div>
              <Button variant="outline" size="lg" onClick={resetKiosk}>
                <ShoppingBag />
                Nuevo pedido
              </Button>
            </div>
          )}
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Vista previa de la pantalla de autoservicio que verá el cliente.
      </p>
    </div>
  )
}
