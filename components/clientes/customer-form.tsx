'use client'

import * as React from 'react'
import { UserPlus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/jeralpos/button'
import { Input, Select, Label, FieldHint } from '@/components/jeralpos/input'
import {
  cities,
  departments,
  priceLists,
  customerTypeLabel,
  statusLabel,
  type Customer,
  type CustomerStatus,
  type CustomerType,
  type DocumentType,
  type PersonType,
} from './mock-data'

interface CustomerFormProps {
  initial?: Customer | null
  onCancel: () => void
  onSubmit: (displayName: string) => void
}

interface FormState {
  personType: PersonType
  documentType: DocumentType
  document: string
  firstName: string
  lastName: string
  businessName: string
  phone: string
  mobile: string
  email: string
  address: string
  city: string
  department: string
  type: CustomerType
  creditLimit: string
  creditDays: string
  priceList: string
  status: CustomerStatus
}

function buildInitial(c?: Customer | null): FormState {
  return {
    personType: c?.personType ?? 'natural',
    documentType: c?.documentType ?? 'CC',
    document: c?.document ?? '',
    firstName: c?.firstName ?? '',
    lastName: c?.lastName ?? '',
    businessName: c?.businessName ?? '',
    phone: c?.phone ?? '',
    mobile: c?.mobile ?? '',
    email: c?.email ?? '',
    address: c?.address ?? '',
    city: c?.city ?? '',
    department: c?.department ?? '',
    type: c?.type ?? 'minorista',
    creditLimit: c ? String(c.creditLimit) : '0',
    creditDays: c ? String(c.creditDays) : '0',
    priceList: c?.priceList ?? 'General',
    status: c?.status ?? 'activo',
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

export function CustomerForm({ initial, onCancel, onSubmit }: CustomerFormProps) {
  const [form, setForm] = React.useState<FormState>(() => buildInitial(initial))
  const [errors, setErrors] = React.useState<Errors>({})

  const isCompany = form.personType === 'juridica'

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  const validate = (): Errors => {
    const next: Errors = {}
    if (!form.document.trim()) next.document = 'El documento es obligatorio'
    if (isCompany) {
      if (!form.businessName.trim()) next.businessName = 'La razón social es obligatoria'
    } else {
      if (!form.firstName.trim()) next.firstName = 'Los nombres son obligatorios'
      if (!form.lastName.trim()) next.lastName = 'Los apellidos son obligatorios'
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = 'Ingresa un correo válido'
    if (!form.mobile.trim() && !form.phone.trim())
      next.mobile = 'Ingresa al menos un teléfono de contacto'
    if (form.creditLimit && Number.parseFloat(form.creditLimit) < 0)
      next.creditLimit = 'El límite no puede ser negativo'
    if (form.creditDays && Number.parseInt(form.creditDays, 10) < 0)
      next.creditDays = 'Los días no pueden ser negativos'
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
    const displayName = isCompany
      ? form.businessName.trim()
      : `${form.firstName.trim()} ${form.lastName.trim()}`.trim()
    onSubmit(displayName)
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-h-[78vh] flex-col">
      <div className="flex-1 overflow-y-auto px-1">
        <FormSection
          title="Información personal"
          description="Identifica al cliente y su tipo de persona."
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_110px_1fr]">
            <div>
              <Label htmlFor="cf-persontype">Tipo de persona</Label>
              <Select
                id="cf-persontype"
                value={form.personType}
                onChange={(e) => set('personType', e.target.value as PersonType)}
              >
                <option value="natural">Persona natural</option>
                <option value="juridica">Persona jurídica</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="cf-doctype">Documento</Label>
              <Select
                id="cf-doctype"
                value={form.documentType}
                onChange={(e) => set('documentType', e.target.value as DocumentType)}
              >
                <option value="CC">CC</option>
                <option value="NIT">NIT</option>
                <option value="CE">CE</option>
                <option value="PP">PP</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="cf-document" required>
                Número
              </Label>
              <Input
                id="cf-document"
                value={form.document}
                onChange={(e) => set('document', e.target.value)}
                placeholder="1032456789"
                inputMode="numeric"
                invalid={!!errors.document}
              />
              {errors.document && <FieldHint invalid>{errors.document}</FieldHint>}
            </div>
          </div>

          {isCompany ? (
            <div>
              <Label htmlFor="cf-business" required>
                Razón social
              </Label>
              <Input
                id="cf-business"
                value={form.businessName}
                onChange={(e) => set('businessName', e.target.value)}
                placeholder="Distribuidora El Progreso S.A.S"
                invalid={!!errors.businessName}
              />
              {errors.businessName && <FieldHint invalid>{errors.businessName}</FieldHint>}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cf-first" required>
                  Nombres
                </Label>
                <Input
                  id="cf-first"
                  value={form.firstName}
                  onChange={(e) => set('firstName', e.target.value)}
                  placeholder="María Fernanda"
                  invalid={!!errors.firstName}
                />
                {errors.firstName && <FieldHint invalid>{errors.firstName}</FieldHint>}
              </div>
              <div>
                <Label htmlFor="cf-last" required>
                  Apellidos
                </Label>
                <Input
                  id="cf-last"
                  value={form.lastName}
                  onChange={(e) => set('lastName', e.target.value)}
                  placeholder="Gómez Ruiz"
                  invalid={!!errors.lastName}
                />
                {errors.lastName && <FieldHint invalid>{errors.lastName}</FieldHint>}
              </div>
            </div>
          )}
        </FormSection>

        <FormSection title="Contacto" description="Medios de comunicación y ubicación.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cf-phone">Teléfono</Label>
              <Input
                id="cf-phone"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="601 745 2210"
              />
            </div>
            <div>
              <Label htmlFor="cf-mobile" required>
                Celular
              </Label>
              <Input
                id="cf-mobile"
                value={form.mobile}
                onChange={(e) => set('mobile', e.target.value)}
                placeholder="310 456 7890"
                invalid={!!errors.mobile}
              />
              {errors.mobile && <FieldHint invalid>{errors.mobile}</FieldHint>}
            </div>
          </div>
          <div>
            <Label htmlFor="cf-email">Correo</Label>
            <Input
              id="cf-email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="cliente@correo.com"
              invalid={!!errors.email}
            />
            {errors.email && <FieldHint invalid>{errors.email}</FieldHint>}
          </div>
          <div>
            <Label htmlFor="cf-address">Dirección</Label>
            <Input
              id="cf-address"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="Cra 15 #93-45"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cf-city">Ciudad</Label>
              <Select id="cf-city" value={form.city} onChange={(e) => set('city', e.target.value)}>
                <option value="">Seleccionar...</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="cf-dep">Departamento</Label>
              <Select
                id="cf-dep"
                value={form.department}
                onChange={(e) => set('department', e.target.value)}
              >
                <option value="">Seleccionar...</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Información comercial"
          description="Condiciones de crédito y clasificación."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cf-type">Tipo de cliente</Label>
              <Select
                id="cf-type"
                value={form.type}
                onChange={(e) => set('type', e.target.value as CustomerType)}
              >
                {(Object.keys(customerTypeLabel) as CustomerType[]).map((t) => (
                  <option key={t} value={t}>
                    {customerTypeLabel[t]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="cf-pricelist">Lista de precios</Label>
              <Select
                id="cf-pricelist"
                value={form.priceList}
                onChange={(e) => set('priceList', e.target.value)}
              >
                {priceLists.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cf-credit">Límite de crédito</Label>
              <Input
                id="cf-credit"
                value={form.creditLimit}
                onChange={(e) => set('creditLimit', e.target.value)}
                placeholder="0"
                inputMode="numeric"
                invalid={!!errors.creditLimit}
              />
              {errors.creditLimit && <FieldHint invalid>{errors.creditLimit}</FieldHint>}
            </div>
            <div>
              <Label htmlFor="cf-days">Días de crédito</Label>
              <Input
                id="cf-days"
                value={form.creditDays}
                onChange={(e) => set('creditDays', e.target.value)}
                placeholder="0"
                inputMode="numeric"
                invalid={!!errors.creditDays}
              />
              {errors.creditDays && <FieldHint invalid>{errors.creditDays}</FieldHint>}
            </div>
          </div>
          <div>
            <Label>Estado</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(statusLabel) as CustomerStatus[]).map((value) => {
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
        </FormSection>
      </div>

      <div className="mt-1 flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          <UserPlus />
          Guardar cliente
        </Button>
      </div>
    </form>
  )
}
