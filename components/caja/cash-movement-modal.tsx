'use client'

import * as React from 'react'
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { Modal } from '@/components/jeralpos/modal'
import { Button } from '@/components/jeralpos/button'
import { Input, Select, Label, Textarea, FieldHint } from '@/components/jeralpos/input'
import { paymentMethods, formatCurrency, type PaymentMethod } from './mock-data'

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
  'Compra de insumos',
  'Pago de servicios',
  'Gasto menor',
  'Otro egreso',
]

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

  // Reset concept when the modal switches kind.
  React.useEffect(() => {
    if (open) {
      setConcept(concepts[0])
      setAmount('')
      setMethod('Efectivo')
      setNotes('')
      setTouched(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, kind])

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
      title={isIncome ? 'Registrar ingreso' : 'Registrar egreso'}
      description={
        isIncome
          ? 'Agrega dinero a la caja fuera de una venta.'
          : 'Registra una salida de dinero de la caja.'
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
        <div>
          <Label htmlFor="mv-concept" required>
            Concepto
          </Label>
          <Select id="mv-concept" value={concept} onChange={(e) => setConcept(e.target.value)}>
            {concepts.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="mv-amount" required>
              Valor
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
                  : 'Monto del movimiento.'}
            </FieldHint>
          </div>
          <div>
            <Label htmlFor="mv-method" required>
              Método de pago
            </Label>
            <Select
              id="mv-method"
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            >
              {paymentMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="mv-notes">Observaciones</Label>
          <Textarea
            id="mv-notes"
            placeholder="Detalle del movimiento (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  )
}
