'use client'

import * as React from 'react'
import { Plus, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/jeralpos/modal'
import { Button } from '@/components/jeralpos/button'
import { Input, Select, Label } from '@/components/jeralpos/input'
import { cn } from '@/lib/utils'
import {
  accountOptions,
  entryTotals,
  formatCurrency,
  type JournalEntry,
  type JournalLine,
} from './mock-data'

export interface NewEntryDraft {
  number: string
  date: string
  concept: string
  reference: string
  lines: JournalLine[]
}

interface JournalEntryModalProps {
  open: boolean
  onClose: () => void
  nextNumber: string
  onCreate: (draft: NewEntryDraft) => void
}

function emptyLine(): JournalLine {
  return { account: accountOptions[0], description: '', debit: 0, credit: 0 }
}

export function JournalEntryModal({ open, onClose, nextNumber, onCreate }: JournalEntryModalProps) {
  const today = React.useMemo(() => {
    const d = new Date()
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  }, [])

  const [date, setDate] = React.useState(today)
  const [concept, setConcept] = React.useState('')
  const [reference, setReference] = React.useState('')
  const [lines, setLines] = React.useState<JournalLine[]>([emptyLine(), emptyLine()])
  const [error, setError] = React.useState<string | null>(null)

  // Reset the form whenever the modal is (re)opened.
  React.useEffect(() => {
    if (open) {
      setDate(today)
      setConcept('')
      setReference('')
      setLines([emptyLine(), emptyLine()])
      setError(null)
    }
  }, [open, today])

  const totals = entryTotals(lines)
  const balanced = totals.diff === 0 && totals.debit > 0

  const updateLine = (i: number, patch: Partial<JournalLine>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))

  const addLine = () => setLines((prev) => [...prev, emptyLine()])
  const removeLine = (i: number) =>
    setLines((prev) => (prev.length <= 2 ? prev : prev.filter((_, idx) => idx !== i)))

  const handleSubmit = () => {
    if (!concept.trim()) {
      setError('Ingresa el concepto del asiento.')
      return
    }
    if (totals.debit === 0) {
      setError('Registra al menos un valor en débito o crédito.')
      return
    }
    if (totals.diff !== 0) {
      setError('La partida está descuadrada: el débito debe igualar al crédito.')
      return
    }
    onCreate({ number: nextNumber, date, concept: concept.trim(), reference: reference.trim(), lines })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo asiento contable"
      description="Registra un movimiento de partida doble."
      className="max-w-3xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!balanced}>
            <CheckCircle2 />
            Contabilizar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Cabecera */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="e-number">Número</Label>
            <Input id="e-number" value={nextNumber} readOnly className="bg-muted" />
          </div>
          <div>
            <Label htmlFor="e-date">Fecha</Label>
            <Input id="e-date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="DD/MM/AAAA" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="e-ref">Referencia</Label>
            <Input
              id="e-ref"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Documento soporte"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <Label htmlFor="e-concept" required>
              Concepto
            </Label>
            <Input
              id="e-concept"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Descripción del asiento"
            />
          </div>
        </div>

        {/* Detalle */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Detalle</h3>
            <Button variant="ghost" size="sm" onClick={addLine}>
              <Plus />
              Agregar línea
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Cuenta</th>
                  <th className="px-3 py-2 font-medium">Descripción</th>
                  <th className="px-3 py-2 text-right font-medium">Débito</th>
                  <th className="px-3 py-2 text-right font-medium">Crédito</th>
                  <th className="w-10 px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-2 py-1.5">
                      <Select
                        value={line.account}
                        onChange={(e) => updateLine(i, { account: e.target.value })}
                        className="h-9"
                        aria-label={`Cuenta línea ${i + 1}`}
                      >
                        {accountOptions.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        value={line.description}
                        onChange={(e) => updateLine(i, { description: e.target.value })}
                        placeholder="Detalle"
                        className="h-9"
                        aria-label={`Descripción línea ${i + 1}`}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        type="number"
                        min={0}
                        value={line.debit || ''}
                        onChange={(e) =>
                          updateLine(i, { debit: Number(e.target.value) || 0, credit: 0 })
                        }
                        placeholder="0"
                        className="h-9 text-right tabular-nums"
                        aria-label={`Débito línea ${i + 1}`}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        type="number"
                        min={0}
                        value={line.credit || ''}
                        onChange={(e) =>
                          updateLine(i, { credit: Number(e.target.value) || 0, debit: 0 })
                        }
                        placeholder="0"
                        className="h-9 text-right tabular-nums"
                        aria-label={`Crédito línea ${i + 1}`}
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => removeLine(i)}
                        disabled={lines.length <= 2}
                        aria-label={`Eliminar línea ${i + 1}`}
                        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-danger-muted hover:text-danger disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4"
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totales */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Total débito</p>
            <p className="mt-0.5 text-base font-bold tabular-nums text-foreground">
              {formatCurrency(totals.debit)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Total crédito</p>
            <p className="mt-0.5 text-base font-bold tabular-nums text-foreground">
              {formatCurrency(totals.credit)}
            </p>
          </div>
          <div
            className={cn(
              'rounded-lg border p-3',
              balanced
                ? 'border-success/30 bg-success-muted'
                : totals.debit === 0
                  ? 'border-border bg-card'
                  : 'border-danger/30 bg-danger-muted',
            )}
          >
            <p className="text-xs text-muted-foreground">Diferencia</p>
            <p
              className={cn(
                'mt-0.5 flex items-center gap-1.5 text-base font-bold tabular-nums',
                balanced ? 'text-success' : totals.debit === 0 ? 'text-foreground' : 'text-danger',
              )}
            >
              {balanced && <CheckCircle2 className="size-4" aria-hidden />}
              {formatCurrency(Math.abs(totals.diff))}
            </p>
          </div>
        </div>

        {error && (
          <p className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-muted px-3 py-2 text-sm text-danger">
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}
      </div>
    </Modal>
  )
}
