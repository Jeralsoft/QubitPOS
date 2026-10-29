'use client'

import * as React from 'react'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  ArrowLeftRight,
  Check,
} from 'lucide-react'
import { Modal } from '@/components/jeralpos/modal'
import { Button } from '@/components/jeralpos/button'
import { Input, Label, Select, Textarea, FieldHint } from '@/components/jeralpos/input'
import { cn } from '@/lib/utils'
import { products, movementTypeMeta, type MovementType } from './mock-data'

export interface MovementAction {
  type: MovementType
  title: string
  description: string
}

const typeOptions: Array<{
  type: MovementType
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { type: 'entrada', label: 'Entrada', icon: ArrowDownToLine },
  { type: 'salida', label: 'Salida', icon: ArrowUpFromLine },
  { type: 'ajuste', label: 'Ajuste', icon: SlidersHorizontal },
  { type: 'transferencia', label: 'Traslado', icon: ArrowLeftRight },
]

export function MovementModal({
  action,
  onClose,
}: {
  action: MovementAction | null
  onClose: () => void
}) {
  const [currentType, setCurrentType] = React.useState<MovementType>('entrada')
  const [productId, setProductId] = React.useState('')
  const [quantity, setQuantity] = React.useState('')
  const [destination, setDestination] = React.useState('')
  const [note, setNote] = React.useState('')
  const [submitted, setSubmitted] = React.useState(false)
  const [confirmed, setConfirmed] = React.useState(false)

  React.useEffect(() => {
    if (action) {
      setCurrentType(action.type)
      setProductId('')
      setQuantity('')
      setDestination('')
      setNote('')
      setSubmitted(false)
      setConfirmed(false)
    }
  }, [action])

  if (!action) return null

  const isTransfer = currentType === 'transferencia'
  const qtyNum = Number(quantity)
  const productInvalid = submitted && !productId
  const qtyInvalid = submitted && (!quantity || qtyNum <= 0)
  const destInvalid = submitted && isTransfer && !destination

  const handleSubmit = () => {
    setSubmitted(true)
    if (!productId || !quantity || qtyNum <= 0 || (isTransfer && !destination)) return
    setConfirmed(true)
  }

  if (confirmed) {
    const product = products.find((p) => p.id === productId)
    return (
      <Modal
        open
        onClose={onClose}
        title="Movimiento registrado"
        description={`${movementTypeMeta[currentType].label} aplicada correctamente al Kárdex.`}
        footer={
          <Button variant="primary" onClick={onClose}>
            Aceptar
          </Button>
        }
      >
        <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm space-y-1">
          <p>
            <span className="font-semibold text-foreground">{product?.name}</span> —{' '}
            <span className="font-bold text-foreground">{quantity} unidades</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Tipo: <span className="font-medium capitalize text-foreground">{movementTypeMeta[currentType].label}</span>
          </p>
          {isTransfer && destination && (
            <p className="text-xs text-muted-foreground">Destino: {destination}</p>
          )}
          {note && <p className="text-xs text-muted-foreground">Nota: {note}</p>}
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={movementTypeMeta[currentType].label}
      description="Registra la afectación de existencias en tiempo real con trazabilidad."
      className="max-w-xl"
      footer={
        <>
          <Button variant="outline" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="md" onClick={handleSubmit}>
            Registrar movimiento
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Horizontal movement type selector */}
        <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tipo de afectación
            </Label>
            <span className="text-xs text-muted-foreground">Operación Kárdex</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
            {typeOptions.map(({ type, label, icon: Icon }) => {
              const selected = currentType === type
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCurrentType(type)}
                  aria-pressed={selected}
                  className={cn(
                    'flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-medium transition-all select-none',
                    selected
                      ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
                      : 'border-border/80 bg-card text-foreground/80 hover:bg-muted hover:text-foreground',
                  )}
                >
                  {selected && <Check className="size-4 shrink-0 stroke-[2.5]" aria-hidden />}
                  <Icon className="size-4 shrink-0" />
                  <span>{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <Label htmlFor="mv-product" required>
            Producto a afectar
          </Label>
          <Select
            id="mv-product"
            value={productId}
            invalid={productInvalid}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">Selecciona un producto del inventario</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code}) — {p.stock} disponibles
              </option>
            ))}
          </Select>
          {productInvalid && <FieldHint invalid>Selecciona un producto válido.</FieldHint>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="mv-qty" required>
              Cantidad de unidades
            </Label>
            <Input
              id="mv-qty"
              type="number"
              min={1}
              value={quantity}
              invalid={qtyInvalid}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
            />
            {qtyInvalid && <FieldHint invalid>Ingresa una cantidad mayor a 0.</FieldHint>}
          </div>

          {isTransfer && (
            <div>
              <Label htmlFor="mv-dest" required>
                Bodega / Sucursal destino
              </Label>
              <Select
                id="mv-dest"
                value={destination}
                invalid={destInvalid}
                onChange={(e) => setDestination(e.target.value)}
              >
                <option value="">Selecciona destino</option>
                <option value="Sucursal Centro">Sucursal Centro</option>
                <option value="Sucursal Norte">Sucursal Norte</option>
                <option value="Bodega Central">Bodega Central</option>
              </Select>
              {destInvalid && <FieldHint invalid>Selecciona la sucursal de destino.</FieldHint>}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="mv-note">Observaciones / Motivo</Label>
          <Textarea
            id="mv-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej: Factura de proveedor #4892, conteo físico o merma..."
          />
        </div>
      </div>
    </Modal>
  )
}
