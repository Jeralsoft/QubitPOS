'use client'

import * as React from 'react'
import { UserCog, Check, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/jeralpos/button'
import { Input, Select, Label, FieldHint, Textarea } from '@/components/jeralpos/input'
import {
  cities,
  roles,
  branches,
  statusLabel,
  employeeInitials,
  type Employee,
  type EmployeeStatus,
  type DocumentType,
} from './mock-data'

interface EmployeeFormProps {
  initial?: Employee | null
  onCancel: () => void
  onSubmit: (fullName: string) => void
}

interface FormState {
  firstName: string
  lastName: string
  documentType: DocumentType
  document: string
  birthDate: string
  phone: string
  mobile: string
  email: string
  address: string
  city: string
  role: string
  branch: string
  contractType: string
  salary: string
  payFrequency: string
  hireDate: string
  eps: string
  pension: string
  arl: string
  bank: string
  accountType: string
  accountNumber: string
  status: EmployeeStatus
  notes: string
}

function buildInitial(e?: Employee | null): FormState {
  return {
    firstName: e?.firstName ?? '',
    lastName: e?.lastName ?? '',
    documentType: e?.documentType ?? 'CC',
    document: e?.document ?? '',
    birthDate: e?.birthDate ?? '',
    phone: e?.phone ?? '',
    mobile: e?.mobile ?? '',
    email: e?.email ?? '',
    address: e?.address ?? '',
    city: e?.city ?? '',
    role: e?.role ?? 'Vendedor',
    branch: e?.branch ?? 'Sede Principal',
    contractType: 'Término indefinido',
    salary: '',
    payFrequency: 'Mensual',
    hireDate: e?.hireDate ?? '',
    eps: 'Seleccionar...',
    pension: 'Seleccionar...',
    arl: 'Seleccionar...',
    bank: 'Seleccionar...',
    accountType: 'Ahorros',
    accountNumber: '',
    status: e?.status ?? 'activo',
    notes: e?.notes ?? '',
  }
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

export function EmployeeForm({ initial, onCancel, onSubmit }: EmployeeFormProps) {
  const [form, setForm] = React.useState<FormState>(() => buildInitial(initial))
  const [errors, setErrors] = React.useState<Errors>({})

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  const preview: Employee = {
    ...buildInitial(initial),
    id: 'preview',
    fullName: `${form.firstName} ${form.lastName}`.trim(),
    firstName: form.firstName || 'N',
    lastName: form.lastName || 'N',
    hasUser: false,
    username: '',
    salesCount: 0,
    salesTotal: 0,
    cashOpenings: 0,
    lastActivity: '',
    color: initial?.color ?? '#2563eb',
  } as Employee

  const validate = (): Errors => {
    const next: Errors = {}
    if (!form.firstName.trim()) next.firstName = 'El nombre es obligatorio'
    if (!form.lastName.trim()) next.lastName = 'El apellido es obligatorio'
    if (!form.document.trim()) next.document = 'El documento es obligatorio'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = 'Ingresa un correo válido'
    if (!form.mobile.trim() && !form.phone.trim())
      next.mobile = 'Ingresa al menos un teléfono de contacto'
    if (!form.role) next.role = 'Selecciona un cargo'
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
    onSubmit(`${form.firstName.trim()} ${form.lastName.trim()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-h-[78vh] flex-col">
      <div className="flex-1 overflow-y-auto px-1">
        <FormSection
          title="Información personal"
          description="Datos de identificación del empleado."
        >
          <div className="flex items-center gap-4">
            <div
              className="flex size-16 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold text-white shadow-sm"
              style={{ backgroundColor: preview.color }}
              aria-hidden
            >
              {employeeInitials(preview)}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {}}
              className="pointer-events-none opacity-80"
            >
              <Camera />
              Subir foto
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ef-first" required>
                Nombres
              </Label>
              <Input
                id="ef-first"
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                placeholder="Laura"
                invalid={!!errors.firstName}
              />
              {errors.firstName && <FieldHint invalid>{errors.firstName}</FieldHint>}
            </div>
            <div>
              <Label htmlFor="ef-last" required>
                Apellidos
              </Label>
              <Input
                id="ef-last"
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                placeholder="Martínez"
                invalid={!!errors.lastName}
              />
              {errors.lastName && <FieldHint invalid>{errors.lastName}</FieldHint>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-[100px_minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <Label htmlFor="ef-doctype">Tipo</Label>
              <Select
                id="ef-doctype"
                value={form.documentType}
                onChange={(e) => set('documentType', e.target.value as DocumentType)}
              >
                <option value="CC">CC</option>
                <option value="CE">CE</option>
                <option value="TI">TI</option>
                <option value="PA">PA</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="ef-document" required>
                Número de documento
              </Label>
              <Input
                id="ef-document"
                value={form.document}
                onChange={(e) => set('document', e.target.value)}
                placeholder="1032456789"
                invalid={!!errors.document}
              />
              {errors.document && <FieldHint invalid>{errors.document}</FieldHint>}
            </div>
            <div>
              <Label htmlFor="ef-birth">Fecha de nacimiento</Label>
              <Input
                id="ef-birth"
                type="date"
                value={form.birthDate}
                onChange={(e) => set('birthDate', e.target.value)}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Contacto" description="Datos de contacto y ubicación.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ef-phone">Teléfono</Label>
              <Input
                id="ef-phone"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="601 448 1122"
              />
            </div>
            <div>
              <Label htmlFor="ef-mobile" required>
                Celular
              </Label>
              <Input
                id="ef-mobile"
                value={form.mobile}
                onChange={(e) => set('mobile', e.target.value)}
                placeholder="311 456 7788"
                invalid={!!errors.mobile}
              />
              {errors.mobile && <FieldHint invalid>{errors.mobile}</FieldHint>}
            </div>
          </div>
          <div>
            <Label htmlFor="ef-email">Correo</Label>
            <Input
              id="ef-email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="empleado@jeralpos.com"
              invalid={!!errors.email}
            />
            {errors.email && <FieldHint invalid>{errors.email}</FieldHint>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ef-address">Dirección</Label>
              <Input
                id="ef-address"
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder="Calle 80 #14-22"
              />
            </div>
            <div>
              <Label htmlFor="ef-city">Ciudad</Label>
              <Select id="ef-city" value={form.city} onChange={(e) => set('city', e.target.value)}>
                <option value="">Seleccionar...</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Información laboral"
          description="Cargo, sede y estado del empleado."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ef-role" required>
                Cargo
              </Label>
              <Select
                id="ef-role"
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                invalid={!!errors.role}
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
              {errors.role && <FieldHint invalid>{errors.role}</FieldHint>}
            </div>
            <div>
              <Label htmlFor="ef-branch">Sucursal</Label>
              <Select
                id="ef-branch"
                value={form.branch}
                onChange={(e) => set('branch', e.target.value)}
              >
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ef-hire">Fecha de ingreso</Label>
              <Input
                id="ef-hire"
                type="date"
                value={form.hireDate}
                onChange={(e) => set('hireDate', e.target.value)}
              />
            </div>
            <div>
              <Label>Estado</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(statusLabel) as EmployeeStatus[]).map((value) => {
                  const selected = form.status === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set('status', value)}
                      aria-pressed={selected}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                        selected
                          ? 'border-primary bg-info-muted text-primary'
                          : 'border-border bg-card text-muted-foreground hover:bg-accent',
                      )}
                    >
                      {selected && <Check className="size-4" aria-hidden />}
                      {statusLabel[value]}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ef-contract">Tipo de contrato</Label>
              <Select
                id="ef-contract"
                value={form.contractType}
                onChange={(e) => set('contractType', e.target.value)}
              >
                <option>Término indefinido</option>
                <option>Término fijo</option>
                <option>Obra o labor</option>
                <option>Prestación de servicios</option>
                <option>Aprendizaje</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="ef-pay-frequency">Periodicidad de pago</Label>
              <Select
                id="ef-pay-frequency"
                value={form.payFrequency}
                onChange={(e) => set('payFrequency', e.target.value)}
              >
                <option>Mensual</option>
                <option>Quincenal</option>
                <option>Semanal</option>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ef-salary">Salario básico</Label>
              <Input
                id="ef-salary"
                value={form.salary}
                onChange={(e) => set('salary', e.target.value)}
                placeholder="$ 1.500.000"
                inputMode="numeric"
              />
            </div>
            <div>
              <Label htmlFor="ef-account-type">Tipo de cuenta</Label>
              <Select
                id="ef-account-type"
                value={form.accountType}
                onChange={(e) => set('accountType', e.target.value)}
              >
                <option>Ahorros</option>
                <option>Corriente</option>
                <option>Pago electrónico</option>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ef-bank">Banco o entidad de pago</Label>
              <Select
                id="ef-bank"
                value={form.bank}
                onChange={(e) => set('bank', e.target.value)}
              >
                <option>Seleccionar...</option>
                <option>Bancolombia</option>
                <option>Davivienda</option>
                <option>Banco de Bogotá</option>
                <option>BBVA</option>
                <option>Nequi</option>
                <option>Daviplata</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="ef-account-number">Número de cuenta</Label>
              <Input
                id="ef-account-number"
                value={form.accountNumber}
                onChange={(e) => set('accountNumber', e.target.value)}
                placeholder="Número de cuenta"
                inputMode="numeric"
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Seguridad social"
          description="Afiliaciones necesarias para la liquidación y la PILA."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="ef-eps">EPS</Label>
              <Select id="ef-eps" value={form.eps} onChange={(e) => set('eps', e.target.value)}>
                <option>Seleccionar...</option>
                <option>Sura EPS</option>
                <option>Sanitas EPS</option>
                <option>Nueva EPS</option>
                <option>Compensar EPS</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="ef-pension">Fondo de pensiones</Label>
              <Select
                id="ef-pension"
                value={form.pension}
                onChange={(e) => set('pension', e.target.value)}
              >
                <option>Seleccionar...</option>
                <option>Porvenir</option>
                <option>Protección</option>
                <option>Colpensiones</option>
                <option>Colfondos</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="ef-arl">ARL</Label>
              <Select id="ef-arl" value={form.arl} onChange={(e) => set('arl', e.target.value)}>
                <option>Seleccionar...</option>
                <option>Sura ARL</option>
                <option>Positiva ARL</option>
                <option>Colmena ARL</option>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="ef-notes">Observaciones</Label>
            <Textarea
              id="ef-notes"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Notas internas sobre el empleado..."
              rows={3}
            />
          </div>
        </FormSection>
      </div>

      <div className="mt-1 flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          <UserCog />
          Guardar empleado
        </Button>
      </div>
    </form>
  )
}
