'use client'

import * as React from 'react'
import { Building2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/jeralpos/button'
import { Input, Select, Label, FieldHint } from '@/components/jeralpos/input'
import {
  cities,
  departments,
  paymentTermsList,
  supplierTypeLabel,
  statusLabel,
  type Supplier,
  type SupplierStatus,
  type SupplierType,
  type DocumentType,
  type PersonType,
} from './mock-data'

interface SupplierFormProps {
  initial?: Supplier | null
  onCancel: () => void
  onSubmit: (displayName: string) => void
}

interface FormState {
  personType: PersonType
  documentType: DocumentType
  document: string
  businessName: string
  tradeName: string
  contactName: string
  phone: string
  mobile: string
  email: string
  address: string
  city: string
  department: string
  type: SupplierType
  paymentTerms: string
  creditDays: string
  creditLimit: string
  status: SupplierStatus
}

function buildInitial(s?: Supplier | null): FormState {
  return {
    personType: s?.personType ?? 'juridica',
    documentType: s?.documentType ?? 'NIT',
    document: s?.document ?? '',
    businessName: s?.businessName ?? '',
    tradeName: s?.tradeName ?? '',
    contactName: s?.contactName ?? '',
    phone: s?.phone ?? '',
    mobile: s?.mobile ?? '',
    email: s?.email ?? '',
    address: s?.address ?? '',
    city: s?.city ?? '',
    department: s?.department ?? '',
    type: s?.type ?? 'productos',
    paymentTerms: s?.paymentTerms ?? 'Crédito 30 días',
    creditDays: s ? String(s.creditDays) : '30',
    creditLimit: s ? String(s.creditLimit) : '0',
    status: s?.status ?? 'activo',
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

export function SupplierForm({ initial, onCancel, onSubmit }: SupplierFormProps) {
  const [form, setForm] = React.useState<FormState>(() => buildInitial(initial))
  const [errors, setErrors] = React.useState<Errors>({})

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  const validate = (): Errors => {
    const next: Errors = {}
    if (!form.document.trim()) next.document = 'El documento es obligatorio'
    if (!form.businessName.trim()) next.businessName = 'La razón social es obligatoria'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = 'Ingresa un correo válido'
    if (!form.mobile.trim() && !form.phone.trim())
      next.mobile = 'Ingresa al menos un teléfono de contacto'
    if (form.creditLimit && Number.parseFloat(form.creditLimit) < 0)
      next.creditLimit = 'El cupo no puede ser negativo'
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
    onSubmit(form.businessName.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-h-[78vh] flex-col">
      <div className="flex-1 overflow-y-auto px-1">
        <FormSection
          title="Datos básicos"
          description="Identifica al proveedor y su tipo de persona."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sf-persontype">Tipo de persona</Label>
              <Select
                id="sf-persontype"
                value={form.personType}
                onChange={(e) => set('personType', e.target.value as PersonType)}
              >
                <option value="juridica">Persona jurídica</option>
                <option value="natural">Persona natural</option>
              </Select>
            </div>
            <div className="grid grid-cols-[110px_1fr] gap-2">
              <div>
                <Label htmlFor="sf-doctype">Documento</Label>
                <Select
                  id="sf-doctype"
                  value={form.documentType}
                  onChange={(e) => set('documentType', e.target.value as DocumentType)}
                >
                  <option value="NIT">NIT</option>
                  <option value="CC">CC</option>
                  <option value="CE">CE</option>
                  <option value="RUT">RUT</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="sf-document" required>
                  Número
                </Label>
                <Input
                  id="sf-document"
                  value={form.document}
                  onChange={(e) => set('document', e.target.value)}
                  placeholder="900123456-1"
                  invalid={!!errors.document}
                />
              </div>
            </div>
          </div>
          {errors.document && <FieldHint invalid>{errors.document}</FieldHint>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sf-business" required>
                Razón social
              </Label>
              <Input
                id="sf-business"
                value={form.businessName}
                onChange={(e) => set('businessName', e.target.value)}
                placeholder="Alimentos del Valle S.A.S"
                invalid={!!errors.businessName}
              />
              {errors.businessName && <FieldHint invalid>{errors.businessName}</FieldHint>}
            </div>
            <div>
              <Label htmlFor="sf-trade">Nombre comercial</Label>
              <Input
                id="sf-trade"
                value={form.tradeName}
                onChange={(e) => set('tradeName', e.target.value)}
                placeholder="Alivalle"
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Contacto" description="Datos del contacto principal y ubicación.">
          <div>
            <Label htmlFor="sf-contact">Contacto principal</Label>
            <Input
              id="sf-contact"
              value={form.contactName}
              onChange={(e) => set('contactName', e.target.value)}
              placeholder="Jorge Restrepo"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sf-phone">Teléfono</Label>
              <Input
                id="sf-phone"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="602 555 1020"
              />
            </div>
            <div>
              <Label htmlFor="sf-mobile" required>
                Celular
              </Label>
              <Input
                id="sf-mobile"
                value={form.mobile}
                onChange={(e) => set('mobile', e.target.value)}
                placeholder="311 456 7788"
                invalid={!!errors.mobile}
              />
              {errors.mobile && <FieldHint invalid>{errors.mobile}</FieldHint>}
            </div>
          </div>
          <div>
            <Label htmlFor="sf-email">Correo</Label>
            <Input
              id="sf-email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="proveedor@correo.com"
              invalid={!!errors.email}
            />
            {errors.email && <FieldHint invalid>{errors.email}</FieldHint>}
          </div>
          <div>
            <Label htmlFor="sf-address">Dirección</Label>
            <Input
              id="sf-address"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="Zona Industrial Acopi, Bod 14"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sf-city">Ciudad</Label>
              <Select id="sf-city" value={form.city} onChange={(e) => set('city', e.target.value)}>
                <option value="">Seleccionar...</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="sf-dep">Departamento</Label>
              <Select
                id="sf-dep"
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
          description="Condiciones de pago y clasificación."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sf-type">Tipo de proveedor</Label>
              <Select
                id="sf-type"
                value={form.type}
                onChange={(e) => set('type', e.target.value as SupplierType)}
              >
                {(Object.keys(supplierTypeLabel) as SupplierType[]).map((t) => (
                  <option key={t} value={t}>
                    {supplierTypeLabel[t]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="sf-terms">Condiciones de pago</Label>
              <Select
                id="sf-terms"
                value={form.paymentTerms}
                onChange={(e) => set('paymentTerms', e.target.value)}
              >
                {paymentTermsList.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sf-days">Días de crédito</Label>
              <Input
                id="sf-days"
                value={form.creditDays}
                onChange={(e) => set('creditDays', e.target.value)}
                placeholder="30"
                inputMode="numeric"
                invalid={!!errors.creditDays}
              />
              {errors.creditDays && <FieldHint invalid>{errors.creditDays}</FieldHint>}
            </div>
            <div>
              <Label htmlFor="sf-credit">Cupo de crédito</Label>
              <Input
                id="sf-credit"
                value={form.creditLimit}
                onChange={(e) => set('creditLimit', e.target.value)}
                placeholder="0"
                inputMode="numeric"
                invalid={!!errors.creditLimit}
              />
              {errors.creditLimit && <FieldHint invalid>{errors.creditLimit}</FieldHint>}
            </div>
          </div>
          <div>
            <Label>Estado</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(statusLabel) as SupplierStatus[]).map((value) => {
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
          <Building2 />
          Guardar proveedor
        </Button>
      </div>
    </form>
  )
}
