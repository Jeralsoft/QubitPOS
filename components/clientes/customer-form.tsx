'use client'

import * as React from 'react'
import {
  User,
  Building,
  Check,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  ShieldCheck,
  DollarSign,
} from 'lucide-react'
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
  onSubmit: (displayName: string, data?: Partial<Customer>) => void
}

interface FormState {
  personType: PersonType
  documentType: DocumentType
  document: string
  dv: string
  firstName: string
  lastName: string
  businessName: string
  phone: string
  mobile: string
  email: string
  invoiceEmail: string
  address: string
  neighborhood: string
  city: string
  department: string
  type: CustomerType
  creditLimit: string
  creditDays: string
  priceList: string
  discountPct: string
  taxRegime: string
  fiscalResponsibilities: string
  status: CustomerStatus
}

type Tab = 'identificacion' | 'contacto' | 'comercial'
type Errors = Partial<Record<keyof FormState, string>>

const CUSTOMER_STATUS_SEMAFORO: Record<
  CustomerStatus,
  {
    label: string
    dotColor: string
    selectedClass: string
    unselectedHover: string
    badgeClass: string
  }
> = {
  activo: {
    label: 'Activo',
    dotColor: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]',
    selectedClass: 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30 font-semibold shadow-xs',
    unselectedHover: 'hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:text-emerald-600 dark:hover:text-emerald-400',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  moroso: {
    label: 'Moroso',
    dotColor: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]',
    selectedClass: 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30 font-semibold shadow-xs',
    unselectedHover: 'hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-amber-600 dark:hover:text-amber-400',
    badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  },
  inactivo: {
    label: 'Inactivo',
    dotColor: 'bg-slate-400 shadow-[0_0_6px_rgba(148,163,184,0.7)]',
    selectedClass: 'border-slate-500 bg-slate-500/10 text-slate-700 dark:text-slate-300 ring-1 ring-slate-500/30 font-semibold shadow-xs',
    unselectedHover: 'hover:border-slate-500/40 hover:bg-slate-500/5 hover:text-slate-600 dark:hover:text-slate-400',
    badgeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
  },
  bloqueado: {
    label: 'Bloqueado',
    dotColor: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]',
    selectedClass: 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30 font-semibold shadow-xs',
    unselectedHover: 'hover:border-rose-500/40 hover:bg-rose-500/5 hover:text-rose-600 dark:hover:text-rose-400',
    badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  },
}

export function CustomerForm({ initial, onCancel, onSubmit }: CustomerFormProps) {
  const [activeTab, setActiveTab] = React.useState<Tab>('identificacion')
  const [errors, setErrors] = React.useState<Errors>({})

  const [form, setForm] = React.useState<FormState>(() => ({
    personType: initial?.personType ?? 'natural',
    documentType: initial?.documentType ?? 'CC',
    document: initial?.document ?? '',
    dv: initial?.dv ?? '',
    firstName: initial?.firstName ?? '',
    lastName: initial?.lastName ?? '',
    businessName: initial?.businessName ?? '',
    phone: initial?.phone ?? '',
    mobile: initial?.mobile ?? '',
    email: initial?.email ?? '',
    invoiceEmail: initial?.invoiceEmail ?? '',
    address: initial?.address ?? '',
    neighborhood: initial?.neighborhood ?? '',
    city: initial?.city ?? cities[0],
    department: initial?.department ?? departments[0],
    type: initial?.type ?? 'minorista',
    creditLimit: initial ? String(initial.creditLimit) : '0',
    creditDays: initial ? String(initial.creditDays) : '0',
    priceList: initial?.priceList ?? priceLists[0],
    discountPct: initial?.discountPct ? String(initial.discountPct) : '0',
    taxRegime: initial?.taxRegime ?? 'No responsable de IVA',
    fiscalResponsibilities: initial?.fiscalResponsibilities ?? 'R-99-PN No responsable de IVA',
    status: initial?.status ?? 'activo',
  }))

  const isCompany = form.personType === 'juridica'

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  const validate = (): boolean => {
    const next: Errors = {}
    if (!form.document.trim()) next.document = 'El número de identificación es obligatorio'
    if (isCompany) {
      if (!form.businessName.trim()) next.businessName = 'La razón social es obligatoria'
    } else {
      if (!form.firstName.trim()) next.firstName = 'El nombre es obligatorio'
      if (!form.lastName.trim()) next.lastName = 'El apellido es obligatorio'
    }
    if (!form.mobile.trim() && !form.phone.trim()) {
      next.mobile = 'Ingresa al menos un número telefónico'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      if (errors.document || errors.firstName || errors.lastName || errors.businessName) {
        setActiveTab('identificacion')
      } else if (errors.mobile || errors.phone) {
        setActiveTab('contacto')
      }
      return
    }
    const displayName = isCompany
      ? form.businessName
      : `${form.firstName} ${form.lastName}`.trim()
    onSubmit(displayName)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Tab navigation */}
      <nav className="flex rounded-xl border border-border/80 bg-muted/30 p-1.5 gap-1.5 overflow-x-auto text-xs">
        {[
          { id: 'identificacion', label: 'Identificación & Persona', icon: isCompany ? Building : User },
          { id: 'contacto', label: 'Contacto & Facturación DIAN', icon: Mail },
          { id: 'comercial', label: 'Condiciones Comerciales & Estado', icon: DollarSign },
        ].map((t) => {
          const Icon = t.icon
          const active = activeTab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as Tab)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 px-3 font-medium transition-all select-none whitespace-nowrap',
                active
                  ? 'bg-card text-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{t.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Tab content */}
      <div className="space-y-4">
        {/* TAB 1: IDENTIFICACIÓN & PERSONA */}
        {activeTab === 'identificacion' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {/* Persona Natural vs Jurídica */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Tipo de personería jurídica
              </Label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    set('personType', 'natural')
                    if (form.documentType === 'NIT') set('documentType', 'CC')
                  }}
                  className={cn(
                    'flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-medium transition-all select-none',
                    !isCompany
                      ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
                      : 'border-border/80 bg-card text-foreground/80 hover:bg-muted hover:text-foreground',
                  )}
                >
                  <User className="size-4" />
                  <span>Persona Natural</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    set('personType', 'juridica')
                    set('documentType', 'NIT')
                  }}
                  className={cn(
                    'flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-medium transition-all select-none',
                    isCompany
                      ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
                      : 'border-border/80 bg-card text-foreground/80 hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Building className="size-4" />
                  <span>Persona Jurídica (Empresa)</span>
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="cf-doc-type">Tipo de documento</Label>
                <Select
                  id="cf-doc-type"
                  value={form.documentType}
                  onChange={(e) => set('documentType', e.target.value as DocumentType)}
                >
                  {isCompany ? (
                    <option value="NIT">NIT (Número de Identificación Tributaria)</option>
                  ) : (
                    <>
                      <option value="CC">CC (Cédula de Ciudadanía)</option>
                      <option value="CE">CE (Cédula de Extranjería)</option>
                      <option value="PP">Pasaporte</option>
                      <option value="NIT">NIT (Persona Natural)</option>
                    </>
                  )}
                </Select>
              </div>

              <div className={isCompany ? 'sm:col-span-1' : 'sm:col-span-2'}>
                <Label htmlFor="cf-doc" required>
                  Número de documento
                </Label>
                <Input
                  id="cf-doc"
                  value={form.document}
                  onChange={(e) => set('document', e.target.value)}
                  placeholder={isCompany ? '901234567' : '1020304050'}
                  invalid={!!errors.document}
                  autoFocus
                />
                {errors.document && <FieldHint invalid>{errors.document}</FieldHint>}
              </div>

              {isCompany && (
                <div>
                  <Label htmlFor="cf-dv">DV (Dígito)</Label>
                  <Input
                    id="cf-dv"
                    value={form.dv}
                    onChange={(e) => set('dv', e.target.value)}
                    placeholder="4"
                    maxLength={1}
                  />
                </div>
              )}
            </div>

            {isCompany ? (
              <div>
                <Label htmlFor="cf-bname" required>
                  Razón social / Nombre comercial
                </Label>
                <Input
                  id="cf-bname"
                  value={form.businessName}
                  onChange={(e) => set('businessName', e.target.value)}
                  placeholder="Distribuciones & Servicios Andina S.A.S."
                  invalid={!!errors.businessName}
                />
                {errors.businessName && <FieldHint invalid>{errors.businessName}</FieldHint>}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="cf-fname" required>
                    Nombres
                  </Label>
                  <Input
                    id="cf-fname"
                    value={form.firstName}
                    onChange={(e) => set('firstName', e.target.value)}
                    placeholder="Carlos Andrés"
                    invalid={!!errors.firstName}
                  />
                  {errors.firstName && <FieldHint invalid>{errors.firstName}</FieldHint>}
                </div>

                <div>
                  <Label htmlFor="cf-lname" required>
                    Apellidos
                  </Label>
                  <Input
                    id="cf-lname"
                    value={form.lastName}
                    onChange={(e) => set('lastName', e.target.value)}
                    placeholder="Gómez Restrepo"
                    invalid={!!errors.lastName}
                  />
                  {errors.lastName && <FieldHint invalid>{errors.lastName}</FieldHint>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONTACTO & FACTURACIÓN DIAN */}
        {activeTab === 'contacto' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cf-mobile" required>
                  Celular principal
                </Label>
                <Input
                  id="cf-mobile"
                  leadingIcon={<Phone />}
                  value={form.mobile}
                  onChange={(e) => set('mobile', e.target.value)}
                  placeholder="310 123 4567"
                  invalid={!!errors.mobile}
                />
                {errors.mobile && <FieldHint invalid>{errors.mobile}</FieldHint>}
              </div>

              <div>
                <Label htmlFor="cf-phone">Teléfono fijo</Label>
                <Input
                  id="cf-phone"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="601 246 8135"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cf-email">Correo de contacto</Label>
                <Input
                  id="cf-email"
                  type="email"
                  leadingIcon={<Mail />}
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="contacto@empresa.com"
                />
              </div>

              <div>
                <Label htmlFor="cf-invemail">Correo entrega factura electrónica (DIAN)</Label>
                <Input
                  id="cf-invemail"
                  type="email"
                  leadingIcon={<FileText />}
                  value={form.invoiceEmail}
                  onChange={(e) => set('invoiceEmail', e.target.value)}
                  placeholder="facturacion@empresa.com"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Label htmlFor="cf-addr">Dirección fiscal</Label>
                <Input
                  id="cf-addr"
                  leadingIcon={<MapPin />}
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="Carrera 15 # 85-30 Oficina 402"
                />
              </div>

              <div>
                <Label htmlFor="cf-neigh">Barrio / Sector</Label>
                <Input
                  id="cf-neigh"
                  value={form.neighborhood}
                  onChange={(e) => set('neighborhood', e.target.value)}
                  placeholder="Chicó Norte"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cf-city">Ciudad / Municipio</Label>
                <Select
                  id="cf-city"
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                >
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="cf-dept">Departamento</Label>
                <Select
                  id="cf-dept"
                  value={form.department}
                  onChange={(e) => set('department', e.target.value)}
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONDICIONES COMERCIALES, CRÉDITO & ESTADO */}
        {activeTab === 'comercial' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {/* ESTADO EN DISPOSICIÓN HORIZONTAL CON SEMÁFORO */}
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    Estado del cliente
                  </Label>
                  <span className="text-[11px] text-muted-foreground">Semáforo de crédito y habilitación comercial</span>
                </div>
                {/* Indicador en vivo de semáforo */}
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all',
                    CUSTOMER_STATUS_SEMAFORO[form.status].badgeClass
                  )}
                >
                  <span
                    className={cn(
                      'size-2 rounded-full animate-pulse',
                      CUSTOMER_STATUS_SEMAFORO[form.status].dotColor
                    )}
                  />
                  <span>{CUSTOMER_STATUS_SEMAFORO[form.status].label}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
                {(Object.keys(statusLabel) as CustomerStatus[]).map((value) => {
                  const selected = form.status === value
                  const sem = CUSTOMER_STATUS_SEMAFORO[value]
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set('status', value)}
                      aria-pressed={selected}
                      className={cn(
                        'flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs transition-all select-none',
                        selected
                          ? sem.selectedClass
                          : cn('border-border/80 bg-card text-foreground/80', sem.unselectedHover)
                      )}
                    >
                      <span
                        className={cn(
                          'size-2.5 shrink-0 rounded-full transition-all',
                          sem.dotColor,
                          !selected && 'opacity-60 scale-90'
                        )}
                      />
                      <span>{statusLabel[value]}</span>
                      {selected && <Check className="size-3.5 shrink-0 stroke-[2.5] ml-0.5" aria-hidden />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
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

              <div>
                <Label htmlFor="cf-disc">% Descuento fijo</Label>
                <Input
                  id="cf-disc"
                  inputMode="numeric"
                  value={form.discountPct}
                  onChange={(e) => set('discountPct', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cf-credit">Cupo de crédito ($ COP)</Label>
                <Input
                  id="cf-credit"
                  inputMode="numeric"
                  value={form.creditLimit}
                  onChange={(e) => set('creditLimit', e.target.value)}
                  placeholder="0"
                />
                <FieldHint>Monto máximo para compras a crédito en POS</FieldHint>
              </div>

              <div>
                <Label htmlFor="cf-days">Plazo de crédito (Días)</Label>
                <Input
                  id="cf-days"
                  inputMode="numeric"
                  value={form.creditDays}
                  onChange={(e) => set('creditDays', e.target.value)}
                  placeholder="30"
                />
                <FieldHint>Días de vencimiento de factura electrónica</FieldHint>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cf-regime">Régimen fiscal</Label>
                <Select
                  id="cf-regime"
                  value={form.taxRegime}
                  onChange={(e) => set('taxRegime', e.target.value)}
                >
                  <option>No responsable de IVA</option>
                  <option>Responsable de IVA</option>
                  <option>Régimen Simple de Tributación (RST)</option>
                  <option>Gran Contribuyente</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="cf-fiscal">Responsabilidad tributaria DIAN</Label>
                <Select
                  id="cf-fiscal"
                  value={form.fiscalResponsibilities}
                  onChange={(e) => set('fiscalResponsibilities', e.target.value)}
                >
                  <option>R-99-PN No responsable de IVA</option>
                  <option>O-13 Gran contribuyente</option>
                  <option>O-15 Autorretenedor</option>
                  <option>O-23 Agente de retención en el IVA</option>
                  <option>O-47 Régimen simple</option>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer buttons */}
      <div className="mt-2 flex items-center justify-end gap-2 border-t border-border/80 pt-4">
        <Button type="button" variant="outline" size="md" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" size="md">
          <UserPlus />
          {initial ? 'Guardar cambios' : 'Registrar cliente'}
        </Button>
      </div>
    </form>
  )
}
