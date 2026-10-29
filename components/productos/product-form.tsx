'use client'

import * as React from 'react'
import {
  Package,
  Check,
  DollarSign,
  Boxes,
  Tag,
  Barcode,
  Truck,
  MapPin,
  Percent,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/jeralpos/button'
import { Input, Textarea, Select, Label, FieldHint } from '@/components/jeralpos/input'
import {
  categories,
  brands,
  units,
  suppliersList,
  statusLabel,
  type Product,
  type ProductStatus,
} from './mock-data'

interface ProductFormProps {
  initial?: Product | null
  onCancel: () => void
  onSubmit: (name: string) => void
}

interface FormState {
  code: string
  barcode: string
  name: string
  description: string
  category: string
  brand: string
  unit: string
  supplier: string
  location: string
  purchasePrice: string
  salePrice: string
  wholesalePrice: string
  taxRate: string
  stock: string
  minStock: string
  maxStock: string
  allowDecimals: boolean
  status: ProductStatus
}

type Tab = 'general' | 'precios' | 'inventario'
type Errors = Partial<Record<keyof FormState, string>>

export function ProductForm({ initial, onCancel, onSubmit }: ProductFormProps) {
  const [activeTab, setActiveTab] = React.useState<Tab>('general')
  const [errors, setErrors] = React.useState<Errors>({})

  const [form, setForm] = React.useState<FormState>(() => ({
    code: initial?.code ?? '',
    barcode: initial?.barcode ?? '',
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    category: initial?.category ?? categories[0],
    brand: initial?.brand ?? brands[0],
    unit: initial?.unit ?? 'Unidad',
    supplier: initial?.supplier ?? suppliersList[0],
    location: initial?.location ?? '',
    purchasePrice: initial ? String(initial.purchasePrice) : '',
    salePrice: initial ? String(initial.salePrice) : '',
    wholesalePrice: initial?.wholesalePrice ? String(initial.wholesalePrice) : '',
    taxRate: initial?.taxRate !== undefined ? String(initial.taxRate) : '19',
    stock: initial ? String(initial.stock) : '0',
    minStock: initial ? String(initial.minStock) : '10',
    maxStock: initial?.maxStock ? String(initial.maxStock) : '100',
    allowDecimals: initial?.allowDecimals ?? false,
    status: initial?.status ?? 'activo',
  }))

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  const purchase = Number.parseFloat(form.purchasePrice) || 0
  const sale = Number.parseFloat(form.salePrice) || 0
  const marginAmt = sale - purchase
  const marginPct = purchase > 0 ? (marginAmt / purchase) * 100 : 0

  const validate = (): boolean => {
    const next: Errors = {}
    if (!form.code.trim()) next.code = 'El código SKU es obligatorio'
    if (!form.name.trim()) next.name = 'El nombre del producto es obligatorio'
    if (!form.purchasePrice || purchase <= 0) next.purchasePrice = 'Ingresa un costo válido'
    if (!form.salePrice || sale <= 0) next.salePrice = 'Ingresa un precio de venta válido'
    if (sale > 0 && purchase > 0 && sale < purchase) {
      next.salePrice = 'El precio de venta no debe ser menor al de compra'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      if (errors.code || errors.name) setActiveTab('general')
      else if (errors.purchasePrice || errors.salePrice) setActiveTab('precios')
      return
    }
    onSubmit(form.name)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Tab bar navigation */}
      <nav className="flex rounded-xl border border-border/80 bg-muted/30 p-1.5 gap-1.5 overflow-x-auto text-xs">
        {[
          { id: 'general', label: 'Información General', icon: Package },
          { id: 'precios', label: 'Precios, Costos & Impuestos', icon: DollarSign },
          { id: 'inventario', label: 'Inventario, Bodega & Estado', icon: Boxes },
        ].map((t) => {
          const Icon = t.icon
          const active = activeTab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as Tab)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 px-3 font-medium transition-all select-none whitespace-nowrap',
                active
                  ? 'bg-card text-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{t.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Tab contents */}
      <div className="space-y-4">
        {/* TAB 1: INFORMACIÓN GENERAL */}
        {activeTab === 'general' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pf-code" required>
                  Código / SKU
                </Label>
                <Input
                  id="pf-code"
                  value={form.code}
                  onChange={(e) => set('code', e.target.value.toUpperCase())}
                  placeholder="Ej: BEB-001"
                  invalid={!!errors.code}
                  autoFocus
                />
                {errors.code && <FieldHint invalid>{errors.code}</FieldHint>}
              </div>

              <div>
                <Label htmlFor="pf-barcode">
                  Código de barras (EAN-13 / UPC)
                </Label>
                <Input
                  id="pf-barcode"
                  leadingIcon={<Barcode />}
                  value={form.barcode}
                  onChange={(e) => set('barcode', e.target.value)}
                  placeholder="7702001000012"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pf-name" required>
                Nombre del producto
              </Label>
              <Input
                id="pf-name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Ej: Coca-Cola 600ml botella PET"
                invalid={!!errors.name}
              />
              {errors.name && <FieldHint invalid>{errors.name}</FieldHint>}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="pf-cat">Categoría</Label>
                <Select
                  id="pf-cat"
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="pf-brand">Marca</Label>
                <Select
                  id="pf-brand"
                  value={form.brand}
                  onChange={(e) => set('brand', e.target.value)}
                >
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="pf-unit">Unidad de medida</Label>
                <Select
                  id="pf-unit"
                  value={form.unit}
                  onChange={(e) => set('unit', e.target.value)}
                >
                  {units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="pf-desc">Descripción detallada</Label>
              <Textarea
                id="pf-desc"
                rows={2}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Características, presentación, contenido neto o notas adicionales..."
              />
            </div>
          </div>
        )}

        {/* TAB 2: PRECIOS & IMPUESTOS */}
        {activeTab === 'precios' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="pf-purchase" required>
                  Precio de compra (Costo)
                </Label>
                <Input
                  id="pf-purchase"
                  inputMode="numeric"
                  value={form.purchasePrice}
                  onChange={(e) => set('purchasePrice', e.target.value)}
                  placeholder="2400"
                  invalid={!!errors.purchasePrice}
                />
                {errors.purchasePrice && <FieldHint invalid>{errors.purchasePrice}</FieldHint>}
              </div>

              <div>
                <Label htmlFor="pf-sale" required>
                  Precio de venta (Público)
                </Label>
                <Input
                  id="pf-sale"
                  inputMode="numeric"
                  value={form.salePrice}
                  onChange={(e) => set('salePrice', e.target.value)}
                  placeholder="3500"
                  invalid={!!errors.salePrice}
                />
                {errors.salePrice && <FieldHint invalid>{errors.salePrice}</FieldHint>}
              </div>

              <div>
                <Label htmlFor="pf-wholesale">
                  Precio mayorista (Opcional)
                </Label>
                <Input
                  id="pf-wholesale"
                  inputMode="numeric"
                  value={form.wholesalePrice}
                  onChange={(e) => set('wholesalePrice', e.target.value)}
                  placeholder="3100"
                />
              </div>
            </div>

            {/* Margen de ganancia en vivo */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-foreground">Rentabilidad estimada</span>
                  <p className="text-[11px] text-muted-foreground">Basado en costo y precio público</p>
                </div>
                <div className="text-right">
                  <span className={cn('text-base font-bold tabular-nums', marginAmt >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-danger')}>
                    {marginAmt >= 0 ? `+${marginPct.toFixed(1)}%` : `${marginPct.toFixed(1)}%`}
                  </span>
                  <p className="text-[11px] text-muted-foreground tabular-nums">Ganancia: ${marginAmt.toLocaleString('es-CO')}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pf-tax">Tarifa de IVA</Label>
                <Select
                  id="pf-tax"
                  value={form.taxRate}
                  onChange={(e) => set('taxRate', e.target.value)}
                >
                  <option value="0">Exento / 0%</option>
                  <option value="5">Reducido / 5%</option>
                  <option value="19">General DIAN / 19%</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="pf-supplier">Proveedor principal</Label>
                <Select
                  id="pf-supplier"
                  value={form.supplier}
                  onChange={(e) => set('supplier', e.target.value)}
                >
                  {suppliersList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INVENTARIO, BODEGA & ESTADO EN HORIZONTAL */}
        {activeTab === 'inventario' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {/* ESTADO EN DISPOSICIÓN HORIZONTAL */}
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Estado del producto
                </Label>
                <span className="text-xs text-muted-foreground">Disponibilidad para ventas POS</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
                {(Object.keys(statusLabel) as ProductStatus[]).map((value) => {
                  const selected = form.status === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set('status', value)}
                      aria-pressed={selected}
                      className={cn(
                        'flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-medium transition-all select-none',
                        selected
                          ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
                          : 'border-border/80 bg-card text-foreground/80 hover:bg-muted hover:text-foreground',
                      )}
                    >
                      {selected && <Check className="size-4 shrink-0 stroke-[2.5]" aria-hidden />}
                      <span>{statusLabel[value]}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="pf-stock">Stock actual</Label>
                <Input
                  id="pf-stock"
                  inputMode="numeric"
                  value={form.stock}
                  onChange={(e) => set('stock', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="pf-min">Stock mínimo de alerta</Label>
                <Input
                  id="pf-min"
                  inputMode="numeric"
                  value={form.minStock}
                  onChange={(e) => set('minStock', e.target.value)}
                  placeholder="10"
                />
              </div>

              <div>
                <Label htmlFor="pf-max">Capacidad máxima</Label>
                <Input
                  id="pf-max"
                  inputMode="numeric"
                  value={form.maxStock}
                  onChange={(e) => set('maxStock', e.target.value)}
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pf-loc">Ubicación física / Estantería</Label>
                <Input
                  id="pf-loc"
                  leadingIcon={<MapPin />}
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="Ej: Pasillo 2 - Estante B"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  id="pf-decimals"
                  type="checkbox"
                  checked={form.allowDecimals}
                  onChange={(e) => set('allowDecimals', e.target.checked)}
                  className="size-4.5 rounded border-border text-primary focus:ring-primary/20"
                />
                <Label htmlFor="pf-decimals" className="cursor-pointer font-normal text-xs text-foreground">
                  Artículo pesable (permite ventas con decimales / kg / g)
                </Label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer buttons */}
      <div className="mt-2 flex items-center justify-end gap-2 border-t border-border/80 pt-4">
        <Button type="button" variant="outline" size="md" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" size="md">
          <Check />
          {initial ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  )
}
