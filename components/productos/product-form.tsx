'use client'

import * as React from 'react'
import { ImagePlus, X, Check, PackagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/jeralpos/button'
import { Input, Textarea, Select, Label, FieldHint } from '@/components/jeralpos/input'
import { categories, brands, units } from './mock-data'

interface ProductFormProps {
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
  purchasePrice: string
  salePrice: string
  wholesalePrice: string
  tax: string
  discount: string
  initialStock: string
  minStock: string
  maxStock: string
  status: 'activo' | 'inactivo'
}

const initialState: FormState = {
  code: '',
  barcode: '',
  name: '',
  description: '',
  category: '',
  brand: '',
  unit: 'Unidad',
  purchasePrice: '',
  salePrice: '',
  wholesalePrice: '',
  tax: '16',
  discount: '0',
  initialStock: '',
  minStock: '',
  maxStock: '',
  status: 'activo',
}

type Errors = Partial<Record<keyof FormState, string>>

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="grid gap-x-6 gap-y-4 border-t border-border py-5 md:grid-cols-[220px_1fr] first:border-t-0 first:pt-0">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  )
}

export function ProductForm({ onCancel, onSubmit }: ProductFormProps) {
  const [form, setForm] = React.useState<FormState>(initialState)
  const [errors, setErrors] = React.useState<Errors>({})
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  const validate = (): Errors => {
    const next: Errors = {}
    if (!form.code.trim()) next.code = 'El código es obligatorio'
    if (!form.name.trim()) next.name = 'El nombre es obligatorio'
    if (!form.category) next.category = 'Selecciona una categoría'

    const purchase = Number.parseFloat(form.purchasePrice)
    const sale = Number.parseFloat(form.salePrice)
    if (!form.purchasePrice || Number.isNaN(purchase) || purchase < 0)
      next.purchasePrice = 'Ingresa un precio válido'
    if (!form.salePrice || Number.isNaN(sale) || sale < 0)
      next.salePrice = 'Ingresa un precio válido'
    if (!next.purchasePrice && !next.salePrice && sale < purchase)
      next.salePrice = 'El precio de venta no puede ser menor al de compra'

    if (form.initialStock && Number.parseInt(form.initialStock, 10) < 0)
      next.initialStock = 'El stock no puede ser negativo'

    const min = Number.parseInt(form.minStock || '0', 10)
    const max = Number.parseInt(form.maxStock || '0', 10)
    if (form.minStock && form.maxStock && max < min)
      next.maxStock = 'El stock máximo debe ser mayor al mínimo'

    return next
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) {
      const first = document.querySelector<HTMLElement>('[aria-invalid="true"]')
      first?.focus()
      return
    }
    onSubmit(form.name.trim())
  }

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImagePreview(url)
  }

  const margin =
    form.purchasePrice && form.salePrice
      ? Number.parseFloat(form.salePrice) - Number.parseFloat(form.purchasePrice)
      : null

  return (
    <form onSubmit={handleSubmit} className="flex max-h-[80vh] flex-col">
      <div className="flex-1 overflow-y-auto px-1">
        <FormSection
          title="Información general"
          description="Datos básicos para identificar el producto."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pf-code" required>
                Código
              </Label>
              <Input
                id="pf-code"
                value={form.code}
                onChange={(e) => set('code', e.target.value)}
                placeholder="BEB-0001"
                invalid={!!errors.code}
              />
              {errors.code && <FieldHint invalid>{errors.code}</FieldHint>}
            </div>
            <div>
              <Label htmlFor="pf-barcode">Código de barras</Label>
              <Input
                id="pf-barcode"
                value={form.barcode}
                onChange={(e) => set('barcode', e.target.value)}
                placeholder="7501055300012"
                inputMode="numeric"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="pf-name" required>
              Nombre
            </Label>
            <Input
              id="pf-name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Coca-Cola 600ml"
              invalid={!!errors.name}
            />
            {errors.name && <FieldHint invalid>{errors.name}</FieldHint>}
          </div>
          <div>
            <Label htmlFor="pf-description">Descripción</Label>
            <Textarea
              id="pf-description"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Descripción breve del producto..."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="pf-category" required>
                Categoría
              </Label>
              <Select
                id="pf-category"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                invalid={!!errors.category}
              >
                <option value="">Seleccionar...</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              {errors.category && <FieldHint invalid>{errors.category}</FieldHint>}
            </div>
            <div>
              <Label htmlFor="pf-brand">Marca</Label>
              <Select
                id="pf-brand"
                value={form.brand}
                onChange={(e) => set('brand', e.target.value)}
              >
                <option value="">Seleccionar...</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="pf-unit">Unidad de medida</Label>
              <Select id="pf-unit" value={form.unit} onChange={(e) => set('unit', e.target.value)}>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </FormSection>

        <FormSection title="Precios" description="Define costos, márgenes e impuestos.">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="pf-purchase" required>
                Precio de compra
              </Label>
              <Input
                id="pf-purchase"
                value={form.purchasePrice}
                onChange={(e) => set('purchasePrice', e.target.value)}
                placeholder="0.00"
                inputMode="decimal"
                invalid={!!errors.purchasePrice}
              />
              {errors.purchasePrice && <FieldHint invalid>{errors.purchasePrice}</FieldHint>}
            </div>
            <div>
              <Label htmlFor="pf-sale" required>
                Precio de venta
              </Label>
              <Input
                id="pf-sale"
                value={form.salePrice}
                onChange={(e) => set('salePrice', e.target.value)}
                placeholder="0.00"
                inputMode="decimal"
                invalid={!!errors.salePrice}
              />
              {errors.salePrice ? (
                <FieldHint invalid>{errors.salePrice}</FieldHint>
              ) : (
                margin !== null && (
                  <FieldHint>
                    Margen: <span className="font-medium text-success">${margin.toFixed(2)}</span>
                  </FieldHint>
                )
              )}
            </div>
            <div>
              <Label htmlFor="pf-wholesale">Precio mayorista</Label>
              <Input
                id="pf-wholesale"
                value={form.wholesalePrice}
                onChange={(e) => set('wholesalePrice', e.target.value)}
                placeholder="0.00"
                inputMode="decimal"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pf-tax">Impuesto (%)</Label>
              <Input
                id="pf-tax"
                value={form.tax}
                onChange={(e) => set('tax', e.target.value)}
                placeholder="16"
                inputMode="decimal"
              />
            </div>
            <div>
              <Label htmlFor="pf-discount">Descuento (%)</Label>
              <Input
                id="pf-discount"
                value={form.discount}
                onChange={(e) => set('discount', e.target.value)}
                placeholder="0"
                inputMode="decimal"
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Inventario" description="Controla existencias y puntos de reorden.">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="pf-initial">Stock inicial</Label>
              <Input
                id="pf-initial"
                value={form.initialStock}
                onChange={(e) => set('initialStock', e.target.value)}
                placeholder="0"
                inputMode="numeric"
                invalid={!!errors.initialStock}
              />
              {errors.initialStock && <FieldHint invalid>{errors.initialStock}</FieldHint>}
            </div>
            <div>
              <Label htmlFor="pf-min">Stock mínimo</Label>
              <Input
                id="pf-min"
                value={form.minStock}
                onChange={(e) => set('minStock', e.target.value)}
                placeholder="0"
                inputMode="numeric"
              />
            </div>
            <div>
              <Label htmlFor="pf-max">Stock máximo</Label>
              <Input
                id="pf-max"
                value={form.maxStock}
                onChange={(e) => set('maxStock', e.target.value)}
                placeholder="0"
                inputMode="numeric"
                invalid={!!errors.maxStock}
              />
              {errors.maxStock && <FieldHint invalid>{errors.maxStock}</FieldHint>}
            </div>
          </div>
        </FormSection>

        <FormSection title="Imagen" description="Sube una fotografía del producto.">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40',
                imagePreview && 'border-solid',
              )}
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview || '/placeholder.svg'}
                  alt="Vista previa del producto"
                  className="size-full object-cover"
                />
              ) : (
                <ImagePlus className="size-7 text-muted-foreground" aria-hidden />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImage}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                <ImagePlus />
                Cargar imagen
              </Button>
              {imagePreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setImagePreview(null)
                    if (fileRef.current) fileRef.current.value = ''
                  }}
                >
                  <X />
                  Quitar
                </Button>
              )}
              <p className="text-xs text-muted-foreground">PNG o JPG, hasta 2MB.</p>
            </div>
          </div>
        </FormSection>

        <FormSection title="Estado" description="Disponibilidad del producto en el catálogo.">
          <div className="flex gap-3">
            {(['activo', 'inactivo'] as const).map((value) => {
              const selected = form.status === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('status', value)}
                  aria-pressed={selected}
                  className={cn(
                    'flex flex-1 items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium capitalize transition-colors',
                    selected
                      ? value === 'activo'
                        ? 'border-success bg-success-muted text-success'
                        : 'border-danger bg-danger-muted text-danger'
                      : 'border-border bg-card text-muted-foreground hover:bg-accent',
                  )}
                >
                  {value}
                  {selected && <Check className="size-4" aria-hidden />}
                </button>
              )
            })}
          </div>
        </FormSection>
      </div>

      <div className="mt-1 flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          <PackagePlus />
          Guardar producto
        </Button>
      </div>
    </form>
  )
}
