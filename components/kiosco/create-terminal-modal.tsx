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

const TERMINAL_STATUS_SEMAFORO: Record<
  TerminalStatus,
  {
    label: string
    dotColor: string
    selectedClass: string
    unselectedHover: string
    badgeClass: string
  }
> = {
  ONLINE: {
    label: 'Online',
    dotColor: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]',
    selectedClass: 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30 font-semibold shadow-xs',
    unselectedHover: 'hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:text-emerald-600 dark:hover:text-emerald-400',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  OFFLINE: {
    label: 'Offline',
    dotColor: 'bg-slate-400 shadow-[0_0_6px_rgba(148,163,184,0.7)]',
    selectedClass: 'border-slate-500 bg-slate-500/10 text-slate-700 dark:text-slate-300 ring-1 ring-slate-500/30 font-semibold shadow-xs',
    unselectedHover: 'hover:border-slate-500/40 hover:bg-slate-500/5 hover:text-slate-600 dark:hover:text-slate-400',
    badgeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
  },
  MANTENIMIENTO: {
    label: 'Mantenimiento',
    dotColor: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]',
    selectedClass: 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30 font-semibold shadow-xs',
    unselectedHover: 'hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-amber-600 dark:hover:text-amber-400',
    badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  },
  BLOQUEADO: {
    label: 'Bloqueado',
    dotColor: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]',
    selectedClass: 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30 font-semibold shadow-xs',
    unselectedHover: 'hover:border-rose-500/40 hover:bg-rose-500/5 hover:text-rose-600 dark:hover:text-rose-400',
    badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  },
}

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
          {/* Estado de Terminal con Semáforo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Estado del terminal
              </Label>
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all',
                  TERMINAL_STATUS_SEMAFORO[status].badgeClass
                )}
              >
                <span className={cn('size-2 rounded-full animate-pulse', TERMINAL_STATUS_SEMAFORO[status].dotColor)} />
                <span>{TERMINAL_STATUS_SEMAFORO[status].label}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
              {statuses.map((s) => {
                const selected = status === s
                const sem = TERMINAL_STATUS_SEMAFORO[s]
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={cn(
                      'flex h-10 items-center justify-center gap-2 rounded-xl border text-xs transition-all select-none px-2',
                      selected
                        ? sem.selectedClass
                        : cn('border-border/80 bg-card text-foreground/80', sem.unselectedHover)
                    )}
                  >
                    <span
                      className={cn(
                        'size-2.5 rounded-full transition-all',
                        sem.dotColor,
                        !selected && 'opacity-60 scale-90'
                      )}
                    />
                    <span>{sem.label}</span>
                  </button>
                )
              })}
            </div>
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
