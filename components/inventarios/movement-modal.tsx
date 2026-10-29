'use client'

import * as React from 'react'
import { Modal } from '@/components/jeralpos/modal'
import { Button } from '@/components/jeralpos/button'
import { Input, Label, Select, Textarea, FieldHint } from '@/components/jeralpos/input'
import { products, movementTypeMeta, type MovementType } from './mock-data'

export interface MovementAction {
  type: MovementType
  title: string
  description: string
}

export function MovementModal({
  action,
  onClose,
}: {
  action: MovementAction | null
  onClose: () => void
}) {
  const [productId, setProductId] = React.useState('')
  const [quantity, setQuantity] = React.useState('')
  const [destination, setDestination] = React.useState('')
  const [note, setNote] = React.useState('')
  const [submitted, setSubmitted] = React.useState(false)
  const [confirmed, setConfirmed] = React.useState(false)

  React.useEffect(() => {
    if (action) {
      setProductId('')
      setQuantity('')
      setDestination('')
      setNote('')
      setSubmitted(false)
      setConfirmed(false)
    }
  }, [action])

  if (!action) return null

  const isTransfer = action.type === 'transferencia'
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
        description={`${movementTypeMeta[action.type].label} aplicada correctamente.`}
        footer={
          <Button variant="primary" onClick={onClose}>
            Aceptar
          </Button>
        }
      >
        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
          <p>
            <span className="font-medium">{product?.name}</span> — {quantity} unidades
          </p>
          {isTransfer && destination && (
            <p className="mt-1 text-muted-foreground">Destino: {destination}</p>
          )}
          {note && <p className="mt-1 text-muted-foreground">{note}</p>}
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={action.title}
      description={action.description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Registrar movimiento
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="mv-product" required>
            Producto
          </Label>
          <Select
            id="mv-product"
            value={productId}
            invalid={productInvalid}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">Selecciona un producto</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code}) — {p.stock} en stock
              </option>
            ))}
          </Select>
          {productInvalid && <FieldHint invalid>Selecciona un producto.</FieldHint>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="mv-qty" required>
              Cantidad
            </Label>
            <Input
              id="mv-qty"
              type="number"
              min={1}
              value={quantity}
              invalid={qtyInvalid}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
            />
            {qtyInvalid && <FieldHint invalid>Ingresa una cantidad válida.</FieldHint>}
          </div>
          {isTransfer && (
            <div>
              <Label htmlFor="mv-dest" required>
                Sucursal destino
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
              {destInvalid && <FieldHint invalid>Selecciona la sucursal destino.</FieldHint>}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="mv-note">Observación</Label>
          <Textarea
            id="mv-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Motivo o detalle del movimiento (opcional)"
          />
        </div>
      </div>
    </Modal>
  )
}
