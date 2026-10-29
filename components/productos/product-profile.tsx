'use client'

import * as React from 'react'
import {
  Package,
  Barcode,
  Tag,
  DollarSign,
  Boxes,
  TrendingUp,
  MapPin,
  Calendar,
  Truck,
  Percent,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Pencil,
  Copy,
} from 'lucide-react'
import { Modal } from '@/components/jeralpos/modal'
import { Badge } from '@/components/jeralpos/badge'
import { Button } from '@/components/jeralpos/button'
import {
  formatCurrency,
  stockLevel,
  statusLabel,
  statusVariant,
  type Product,
} from './mock-data'
import { cn } from '@/lib/utils'

interface ProductProfileProps {
  product: Product | null
  onClose: () => void
  onEdit: (product: Product) => void
  onDuplicate: (product: Product) => void
}

type Tab = 'general' | 'precios' | 'inventario' | 'ventas'

export function ProductProfile({
  product,
  onClose,
  onEdit,
  onDuplicate,
}: ProductProfileProps) {
  const [tab, setTab] = React.useState<Tab>('general')

  if (!product) return null

  const level = stockLevel(product)
  const marginAmt = product.salePrice - product.purchasePrice
  const marginPct = product.purchasePrice > 0 ? (marginAmt / product.purchasePrice) * 100 : 0

  return (
    <Modal
      open={!!product}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-xs"
            style={{ backgroundColor: product.color }}
          >
            {product.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{product.name}</h2>
            <p className="text-xs text-muted-foreground font-mono">{product.code} · {product.barcode}</p>
          </div>
        </div>
      }
      description="Ficha integral del artículo, existencias, precios y trazabilidad."
      className="max-w-2xl"
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              onDuplicate(product)
              onClose()
            }}
          >
            <Copy />
            Duplicar
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={onClose}>
              Cerrar
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onClose()
                onEdit(product)
              }}
            >
              <Pencil />
              Editar producto
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Navigation tabs */}
        <nav className="flex gap-1.5 rounded-xl border border-border/80 bg-muted/40 p-1 text-xs">
          {[
            { id: 'general', label: 'General', icon: Package },
            { id: 'precios', label: 'Precios & Margen', icon: DollarSign },
            { id: 'inventario', label: 'Inventario & Ubicación', icon: Boxes },
            { id: 'ventas', label: 'Rendimiento', icon: TrendingUp },
          ].map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as Tab)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 font-medium transition-all',
                  active
                    ? 'bg-card text-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                <Icon className="size-3.5" />
                <span>{t.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Tab 1: General */}
        {tab === 'general' && (
          <div className="space-y-3.5 animate-in fade-in-50 duration-150">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border/70 bg-card p-3">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">Estado</span>
                <div className="mt-1">
                  <Badge variant={statusVariant[product.status]}>{statusLabel[product.status]}</Badge>
                </div>
              </div>
              <div className="rounded-xl border border-border/70 bg-card p-3">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">Categoría</span>
                <p className="mt-1 text-sm font-semibold text-foreground truncate">{product.category}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-card p-3">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">Marca</span>
                <p className="mt-1 text-sm font-semibold text-foreground truncate">{product.brand}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-card p-3">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">Unidad</span>
                <p className="mt-1 text-sm font-semibold text-foreground truncate">{product.unit ?? 'Unidad'}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 space-y-2">
              <span className="text-xs font-semibold text-foreground">Descripción del artículo</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {product.description || 'Sin descripción detallada registrada para este artículo.'}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3">
                <Truck className="size-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <span className="text-[11px] text-muted-foreground">Proveedor habitual</span>
                  <p className="text-xs font-medium text-foreground truncate">{product.supplier ?? 'No asignado'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3">
                <MapPin className="size-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <span className="text-[11px] text-muted-foreground">Ubicación en almacén</span>
                  <p className="text-xs font-medium text-foreground truncate">{product.location ?? 'Almacén general'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Precios & Margen */}
        {tab === 'precios' && (
          <div className="space-y-3.5 animate-in fade-in-50 duration-150">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-card p-3.5">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">Precio de compra</span>
                <p className="mt-1.5 text-lg font-bold tabular-nums text-foreground">{formatCurrency(product.purchasePrice)}</p>
                <span className="text-[10px] text-muted-foreground">Costo base unitario</span>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 dark:bg-emerald-500/10">
                <span className="text-[11px] text-emerald-800 dark:text-emerald-300 uppercase font-semibold">Precio de venta</span>
                <p className="mt-1.5 text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-400">{formatCurrency(product.salePrice)}</p>
                <span className="text-[10px] text-emerald-600/80">Público en POS</span>
              </div>
              <div className="rounded-xl border border-border/70 bg-card p-3.5">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">Precio mayorista</span>
                <p className="mt-1.5 text-lg font-bold tabular-nums text-foreground">{formatCurrency(product.wholesalePrice ?? product.salePrice * 0.9)}</p>
                <span className="text-[10px] text-muted-foreground">Clientes con cupo</span>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <span className="text-xs font-semibold text-foreground">Margen de ganancia bruta</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  +{marginPct.toFixed(1)}% ({formatCurrency(marginAmt)})
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Tarifa de IVA:</span>
                  <p className="font-semibold text-foreground">{product.taxRate ?? 19}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Precio sin IVA:</span>
                  <p className="font-semibold text-foreground">
                    {formatCurrency(Math.round(product.salePrice / (1 + (product.taxRate ?? 19) / 100)))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Inventario */}
        {tab === 'inventario' && (
          <div className="space-y-3.5 animate-in fade-in-50 duration-150">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/70 bg-card p-3.5 text-center">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">Stock actual</span>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{product.stock}</p>
                <Badge
                  variant={level === 'out' ? 'danger' : level === 'low' ? 'warning' : 'success'}
                  size="sm"
                  dot
                  className="mt-1.5"
                >
                  {level === 'out' ? 'Agotado' : level === 'low' ? 'Stock bajo' : 'Nivel óptimo'}
                </Badge>
              </div>
              <div className="rounded-xl border border-border/70 bg-card p-3.5 text-center">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">Stock mínimo</span>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{product.minStock}</p>
                <span className="text-[10px] text-muted-foreground">Alerta de reposición</span>
              </div>
              <div className="rounded-xl border border-border/70 bg-card p-3.5 text-center">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">Stock máximo</span>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{product.maxStock ?? product.minStock * 4}</p>
                <span className="text-[10px] text-muted-foreground">Capacidad bodega</span>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Último reabastecimiento:</span>
                <span className="font-medium text-foreground">{product.lastRestock ?? 'Recientemente'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Permite venta por fracción/peso:</span>
                <span className="font-medium text-foreground">{product.allowDecimals ? 'Sí (Decimales)' : 'No (Entero)'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Valor total en bodega:</span>
                <span className="font-semibold text-foreground">{formatCurrency(product.purchasePrice * product.stock)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Rendimiento */}
        {tab === 'ventas' && (
          <div className="space-y-3.5 animate-in fade-in-50 duration-150">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/70 bg-card p-4">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">Unidades vendidas</span>
                <p className="mt-1.5 text-2xl font-bold tabular-nums text-foreground">{product.salesCount ?? 120}</p>
                <span className="text-[10px] text-emerald-600 font-medium">Top rotación en su categoría</span>
              </div>
              <div className="rounded-xl border border-border/70 bg-card p-4">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">Facturación generada</span>
                <p className="mt-1.5 text-2xl font-bold tabular-nums text-foreground">
                  {formatCurrency((product.salesCount ?? 120) * product.salePrice)}
                </p>
                <span className="text-[10px] text-muted-foreground">Ingreso total acumulado</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
