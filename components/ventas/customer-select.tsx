'use client'

import * as React from 'react'
import { User, ChevronDown, Search, UserPlus, Check } from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Input, Label } from '@/components/jeralpos/input'
import { Modal } from '@/components/jeralpos/modal'
import { cn } from '@/lib/utils'
import { FINAL_CONSUMER, type Customer } from './mock-data'

interface CustomerSelectProps {
  customer: Customer
  customers: Customer[]
  onSelect: (c: Customer) => void
  onCreate: (c: Customer) => void
  pickerOpen?: boolean
  onPickerOpenChange?: (open: boolean) => void
}

export function CustomerSelect({
  customer,
  customers,
  onSelect,
  onCreate,
  pickerOpen: controlledPickerOpen,
  onPickerOpenChange,
}: CustomerSelectProps) {
  const [internalPickerOpen, setInternalPickerOpen] = React.useState(false)
  const isControlled = controlledPickerOpen !== undefined
  const pickerOpen = isControlled ? controlledPickerOpen : internalPickerOpen
  const setPickerOpen = (open: boolean) => {
    if (isControlled) {
      onPickerOpenChange?.(open)
    } else {
      setInternalPickerOpen(open)
    }
  }

  const [createOpen, setCreateOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')

  const isFinal = customer.id === FINAL_CONSUMER.id
  const options = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.taxId.toLowerCase().includes(q),
    )
  }, [customers, query])

  return (
    <>
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent"
      >
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-full',
            isFinal ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary',
          )}
        >
          <User className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between">
            <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
              Cliente
            </span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-xs">
              F2
            </kbd>
          </span>
          <span className="block truncate text-sm font-medium">{customer.name}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Seleccionar cliente"
        description="Busca un cliente existente o registra uno nuevo."
      >
        <div className="flex flex-col gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o NIT/CC..."
            leadingIcon={<Search />}
            autoFocus
          />
          <div className="max-h-72 space-y-1 overflow-y-auto">
            <CustomerRow
              customer={FINAL_CONSUMER}
              selected={isFinal}
              onClick={() => {
                onSelect(FINAL_CONSUMER)
                setPickerOpen(false)
              }}
            />
            {options.map((c) => (
              <CustomerRow
                key={c.id}
                customer={c}
                selected={customer.id === c.id}
                onClick={() => {
                  onSelect(c)
                  setPickerOpen(false)
                }}
              />
            ))}
            {options.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Sin coincidencias.
              </p>
            )}
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setPickerOpen(false)
              setCreateOpen(true)
            }}
          >
            <UserPlus className="size-4" />
            Crear cliente
          </Button>
        </div>
      </Modal>

      <CreateCustomerModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(c) => {
          onCreate(c)
          setCreateOpen(false)
        }}
      />
    </>
  )
}

function CustomerRow({
  customer,
  selected,
  onClick,
}: {
  customer: Customer
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
        selected
          ? 'border-primary/40 bg-info-muted'
          : 'border-transparent hover:bg-accent',
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{customer.name}</span>
        <span className="block font-mono text-xs text-muted-foreground">{customer.taxId}</span>
      </span>
      {selected && <Check className="size-4 shrink-0 text-primary" />}
    </button>
  )
}

function CreateCustomerModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (c: Customer) => void
}) {
  const [name, setName] = React.useState('')
  const [taxId, setTaxId] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [touched, setTouched] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setName('')
      setTaxId('')
      setPhone('')
      setTouched(false)
    }
  }, [open])

  const nameInvalid = touched && name.trim().length === 0

  function submit() {
    if (name.trim().length === 0) {
      setTouched(true)
      return
    }
    onCreate({
      id: `new-${Date.now()}`,
      name: name.trim(),
      taxId: taxId.trim() || 'XAXX010101000',
      phone: phone.trim(),
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo cliente"
      description="Registra un cliente para asociarlo a la venta."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit}>Guardar cliente</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="cust-name" required>
            Nombre o razón social
          </Label>
          <Input
            id="cust-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            invalid={nameInvalid}
            placeholder="Ej. Juan Pérez"
            autoFocus
          />
          {nameInvalid && <p className="mt-1.5 text-xs text-danger">El nombre es obligatorio.</p>}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="cust-tax">NIT / Cédula</Label>
            <Input
              id="cust-tax"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value.toUpperCase())}
              placeholder="Ej. 901458321-4"
            />
          </div>
          <div>
            <Label htmlFor="cust-phone">Teléfono</Label>
            <Input
              id="cust-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="55 1234 5678"
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
