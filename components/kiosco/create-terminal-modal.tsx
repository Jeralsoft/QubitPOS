'use client'

import * as React from 'react'
import { Modal } from '@/components/jeralpos/modal'
import { Button } from '@/components/jeralpos/button'
import { Input, Select, Label, FieldHint } from '@/components/jeralpos/input'
import { cn } from '@/lib/utils'
import {
  branches,
  printers,
  paymentMethods,
  type TerminalStatus,
} from './mock-data'

export interface NewTerminalDraft {
  name: string
  code: string
  branch: string
  location: string
  status: TerminalStatus
  printer: string
  payments: string[]
}

const statuses: TerminalStatus[] = ['ONLINE', 'OFFLINE', 'MANTENIMIENTO', 'BLOQUEADO']

export function CreateTerminalModal({
  open,
  onClose,
  nextCode,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  nextCode: string
  onCreate: (draft: NewTerminalDraft) => void
}) {
  const [name, setName] = React.useState('')
  const [branch, setBranch] = React.useState(branches[0])
  const [location, setLocation] = React.useState('')
  const [status, setStatus] = React.useState<TerminalStatus>('ONLINE')
  const [printer, setPrinter] = React.useState(printers[0])
  const [payments, setPayments] = React.useState<string[]>(['Efectivo', 'Tarjeta débito'])
  const [touched, setTouched] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setName('')
      setBranch(branches[0])
      setLocation('')
      setStatus('ONLINE')
      setPrinter(printers[0])
      setPayments(['Efectivo', 'Tarjeta débito'])
      setTouched(false)
    }
  }, [open])

  const nameInvalid = touched && name.trim().length === 0
  const locationInvalid = touched && location.trim().length === 0

  const togglePayment = (method: string) =>
    setPayments((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method],
    )

  const handleSubmit = () => {
    setTouched(true)
    if (name.trim().length === 0 || location.trim().length === 0) return
    onCreate({ name: name.trim(), code: nextCode, branch, location: location.trim(), status, printer, payments })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo kiosco"
      description="Registra una terminal de autoservicio."
      className="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Guardar kiosco
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="k-name" required>
              Nombre
            </Label>
            <Input
              id="k-name"
              placeholder="Kiosco Entrada 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              invalid={nameInvalid}
            />
            {nameInvalid && <FieldHint invalid>El nombre es obligatorio.</FieldHint>}
          </div>
          <div>
            <Label htmlFor="k-code">Código</Label>
            <Input id="k-code" value={nextCode} readOnly className="bg-muted" />
            <FieldHint>Se asigna automáticamente.</FieldHint>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="k-branch">Sucursal</Label>
            <Select id="k-branch" value={branch} onChange={(e) => setBranch(e.target.value)}>
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="k-location" required>
              Ubicación
            </Label>
            <Input
              id="k-location"
              placeholder="Entrada principal"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              invalid={locationInvalid}
            />
            {locationInvalid && <FieldHint invalid>La ubicación es obligatoria.</FieldHint>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="k-status">Estado</Label>
            <Select
              id="k-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TerminalStatus)}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="k-printer">Impresora</Label>
            <Select id="k-printer" value={printer} onChange={(e) => setPrinter(e.target.value)}>
              {printers.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label>Métodos de pago</Label>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((method) => {
              const active = payments.includes(method)
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => togglePayment(method)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:bg-accent',
                  )}
                >
                  {method}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </Modal>
  )
}
