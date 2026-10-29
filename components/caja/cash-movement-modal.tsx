'use client'

import * as React from 'react'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  CreditCard,
  Building2,
  MoreHorizontal,
  Check,
} from 'lucide-react'
import { Modal } from '@/components/jeralpos/modal'
import { Button } from '@/components/jeralpos/button'
import { Input, Select, Label, Textarea, FieldHint } from '@/components/jeralpos/input'
import { paymentMethods, formatCurrency, type PaymentMethod } from './mock-data'
import { cn } from '@/lib/utils'

export interface MovementPayload {
  kind: 'ingreso' | 'egreso'
  concept: string
  amount: number
  method: PaymentMethod
  notes: string
}

const incomeConcepts = [
  'Aporte de base adicional',
  'Cobro de cartera',
  'Reembolso de proveedor',
  'Otro ingreso',
]
const expenseConcepts = [
  'Pago de domicilio',
  'Compra de insumos y víveres',
  'Pago de servicios públicos',
  'Gasto menor / Imprevistos',
  'Otro egreso',
]

const methodIcons: Record<PaymentMethod, typeof Banknote> = {
  Efectivo: Banknote,
  Tarjeta: CreditCard,
  Transferencia: Building2,
  Otro: MoreHorizontal,
}

export function CashMovementModal({
  open,
  kind,
  onClose,
  onConfirm,
}: {
  open: boolean
  kind: 'ingreso' | 'egreso'
  onClose: () => void
  onConfirm: (payload: MovementPayload) => void
}) {
  const isIncome = kind === 'ingreso'
  const concepts = isIncome ? incomeConcepts : expenseConcepts

  const [concept, setConcept] = React.useState(concepts[0])
  const [amount, setAmount] = React.useState('')
  const [method, setMethod] = React.useState<PaymentMethod>('Efectivo')
  const [notes, setNotes] = React.useState('')
  const [touched, setTouched] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setConcept(concepts[0])
      setAmount('')
      setMethod('Efectivo')
      setNotes('')
      setTouched(false)
    }
  }, [open, kind, concepts])

  const amountNum = Number.parseFloat(amount)
  const amountInvalid = touched && (!amount || Number.isNaN(amountNum) || amountNum <= 0)

  const submit = () => {
    setTouched(true)
    if (!amount || Number.isNaN(amountNum) || amountNum <= 0) return
    onConfirm({ kind, concept, amount: amountNum, method, notes })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isIncome ? 'Registrar ingreso a caja' : 'Registrar egreso de caja'}
      description={
        isIncome
          ? 'Registra una entrada manual de dinero en la gaveta fuera de ventas.'
          : 'Registra un egreso o gasto menor con salida de dinero en efectivo.'
      }
      className="max-w-lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant={isIncome ? 'primary' : 'danger'} onClick={submit}>
            {isIncome ? <ArrowDownCircle /> : <ArrowUpCircle />}
            {isIncome ? 'Registrar ingreso' : 'Registrar egreso'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        {/* Method Horizontal Selector */}
        <div>
          <Label className="mb-2 block">Método de pago / canal</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
            {paymentMethods.map((m) => {
              const isSelected = method === m
              const Icon = methodIcons[m] ?? MoreHorizontal
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-center transition-all',
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary font-semibold shadow-xs'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  )}
                >
                  <Icon className="size-4" />
                  <span className="text-xs">{m}</span>
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5">
                      <Check className="size-3 text-primary" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <Label htmlFor="mv-concept" required>
            Concepto del movimiento
          </Label>
          <Select id="mv-concept" value={concept} onChange={(e) => setConcept(e.target.value)}>
            {concepts.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="mv-amount" required>
            Monto a {isIncome ? 'ingresar' : 'egresar'} (COP)
          </Label>
          <Input
            id="mv-amount"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => setTouched(true)}
            invalid={amountInvalid}
          />
          <FieldHint invalid={amountInvalid}>
            {amountInvalid
              ? 'Ingresa un valor mayor a cero.'
              : amount && !Number.isNaN(amountNum)
                ? formatCurrency(amountNum)
                : 'Monto a registrar en la caja.'}
          </FieldHint>
        </div>

        <div>
          <Label htmlFor="mv-notes">Observaciones aclaratorias</Label>
          <Textarea
            id="mv-notes"
            rows={2}
            placeholder="Detalles del movimiento, número de recibo o beneficiario..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  )
}
