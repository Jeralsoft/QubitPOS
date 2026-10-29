'use client'

import * as React from 'react'
import { LockOpen } from 'lucide-react'
import { Modal } from '@/components/jeralpos/modal'
import { Button } from '@/components/jeralpos/button'
import { Input, Select, Label, Textarea, FieldHint } from '@/components/jeralpos/input'
import { registers, branches, users, formatCurrency } from './mock-data'

export interface OpenPayload {
  register: string
  branch: string
  user: string
  openingBalance: number
  notes: string
}

export function OpenCashModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (payload: OpenPayload) => void
}) {
  const [register, setRegister] = React.useState(registers[0])
  const [branch, setBranch] = React.useState(branches[0])
  const [user, setUser] = React.useState(users[0])
  const [amount, setAmount] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [touched, setTouched] = React.useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const amountNum = Number.parseFloat(amount)
  const amountInvalid = touched && (!amount || Number.isNaN(amountNum) || amountNum < 0)

  const submit = () => {
    setTouched(true)
    if (!amount || Number.isNaN(amountNum) || amountNum < 0) return
    onConfirm({ register, branch, user, openingBalance: amountNum, notes })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Abrir caja"
      description="Registra la apertura y el monto inicial en efectivo."
      className="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={submit}>
            <LockOpen />
            Confirmar apertura
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="open-register" required>
            Caja
          </Label>
          <Select id="open-register" value={register} onChange={(e) => setRegister(e.target.value)}>
            {registers.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="open-branch" required>
            Sucursal
          </Label>
          <Select id="open-branch" value={branch} onChange={(e) => setBranch(e.target.value)}>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="open-user" required>
            Usuario
          </Label>
          <Select id="open-user" value={user} onChange={(e) => setUser(e.target.value)}>
            {users.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="open-date">Fecha</Label>
          <Input id="open-date" type="date" defaultValue={today} readOnly />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="open-amount" required>
            Monto inicial
          </Label>
          <Input
            id="open-amount"
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
              ? 'Ingresa un monto inicial válido.'
              : amount && !Number.isNaN(amountNum)
                ? `Base de caja: ${formatCurrency(amountNum)}`
                : 'Efectivo con el que inicia la caja.'}
          </FieldHint>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="open-notes">Observaciones</Label>
          <Textarea
            id="open-notes"
            placeholder="Notas de la apertura (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  )
}
