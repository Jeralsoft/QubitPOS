'use client'

import * as React from 'react'
import {
  Building2,
  Building,
  User,
  Check,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  DollarSign,
  Landmark,
} from 'lucide-react'
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
  dv: string
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
  bank: string
  accountType: string
  accountNumber: string
  taxRegime: string
  status: SupplierStatus
}

type Tab = 'identificacion' | 'contacto' | 'comercial'
type Errors = Partial<Record<keyof FormState, string>>

export function SupplierForm({ initial, onCancel, onSubmit }: SupplierFormProps) {
  const [activeTab, setActiveTab] = React.useState<Tab>('identificacion')
  const [errors, setErrors] = React.useState<Errors>({})

  const [form, setForm] = React.useState<FormState>(() => ({
    personType: initial?.personType ?? 'juridica',
    documentType: initial?.documentType ?? 'NIT',
    document: initial?.document ?? '',
    dv: initial?.dv ?? '',
    businessName: initial?.businessName ?? '',
    tradeName: initial?.tradeName ?? '',
    contactName: initial?.contactName ?? '',
    phone: initial?.phone ?? '',
    mobile: initial?.mobile ?? '',
    email: initial?.email ?? '',
    address: initial?.address ?? '',
    city: initial?.city ?? cities[0],
    department: initial?.department ?? departments[0],
    type: initial?.type ?? 'productos',
    paymentTerms: initial?.paymentTerms ?? paymentTermsList[1],
    creditDays: initial ? String(initial.creditDays) : '30',
    creditLimit: initial ? String(initial.creditLimit) : '0',
    bank: initial?.bank ?? 'Bancolombia',
    accountType: initial?.accountType ?? 'Ahorros',
    accountNumber: initial?.accountNumber ?? '',
    taxRegime: initial?.taxRegime ?? 'Responsable de IVA',
    status: initial?.status ?? 'activo',
  }))

  const isCompany = form.personType === 'juridica'

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  const validate = (): boolean => {
    const next: Errors = {}
    if (!form.document.trim()) next.document = 'El documento o NIT es obligatorio'
    if (!form.businessName.trim()) next.businessName = 'El nombre o razón social es obligatorio'
    if (!form.mobile.trim() && !form.phone.trim()) {
      next.mobile = 'Ingresa al menos un teléfono de contacto'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      if (errors.document || errors.businessName) setActiveTab('identificacion')
      else if (errors.mobile || errors.phone) setActiveTab('contacto')
      return
    }
    onSubmit(form.tradeName || form.businessName)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Tab navigation */}
      <nav className="flex rounded-xl border border-border/80 bg-muted/30 p-1.5 gap-1.5 overflow-x-auto text-xs">
        {[
          { id: 'identificacion', label: 'Identificación & Razón Social', icon: Building },
          { id: 'contacto', label: 'Contacto & Ubicación', icon: Mail },
          { id: 'comercial', label: 'Condiciones, Banco & Estado', icon: DollarSign },
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

      {/* Tab contents */}
      <div className="space-y-4">
        {/* TAB 1: IDENTIFICACIÓN & EMPRESA */}
        {activeTab === 'identificacion' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {/* Personería */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Tipo de personería jurídica
              </Label>
              <div className="grid grid-cols-2 gap-2.5">
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
                  <span>Persona Natural / Independiente</span>
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="sf-doc-type">Tipo de documento</Label>
                <Select
                  id="sf-doc-type"
                  value={form.documentType}
                  onChange={(e) => set('documentType', e.target.value as DocumentType)}
                >
                  {isCompany ? (
                    <option value="NIT">NIT (Empresa)</option>
                  ) : (
                    <>
                      <option value="CC">CC (Cédula de Ciudadanía)</option>
                      <option value="NIT">NIT (Persona Natural)</option>
                      <option value="CE">CE (Cédula de Extranjería)</option>
                    </>
                  )}
                </Select>
              </div>

              <div className={isCompany ? 'sm:col-span-1' : 'sm:col-span-2'}>
                <Label htmlFor="sf-doc" required>
                  Número de documento
                </Label>
                <Input
                  id="sf-doc"
                  value={form.document}
                  onChange={(e) => set('document', e.target.value)}
                  placeholder={isCompany ? '900876543' : '1030405060'}
                  invalid={!!errors.document}
                  autoFocus
                />
                {errors.document && <FieldHint invalid>{errors.document}</FieldHint>}
              </div>

              {isCompany && (
                <div>
                  <Label htmlFor="sf-dv">DV (Dígito)</Label>
                  <Input
                    id="sf-dv"
                    value={form.dv}
                    onChange={(e) => set('dv', e.target.value)}
                    placeholder="1"
                    maxLength={1}
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="sf-bname" required>
                  Razón social
                </Label>
                <Input
                  id="sf-bname"
                  value={form.businessName}
                  onChange={(e) => set('businessName', e.target.value)}
                  placeholder="Distribuidora Nacional de Bebidas S.A.S."
                  invalid={!!errors.businessName}
                />
                {errors.businessName && <FieldHint invalid>{errors.businessName}</FieldHint>}
              </div>

              <div>
                <Label htmlFor="sf-tname">Nombre comercial / Marca</Label>
                <Input
                  id="sf-tname"
                  value={form.tradeName}
                  onChange={(e) => set('tradeName', e.target.value)}
                  placeholder="DisBebidas Andina"
                />
              </div>
            </div>

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
          </div>
        )}

        {/* TAB 2: CONTACTO & UBICACIÓN */}
        {activeTab === 'contacto' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            <div>
              <Label htmlFor="sf-contact">Persona de contacto / Asesor comercial</Label>
              <Input
                id="sf-contact"
                leadingIcon={<User />}
                value={form.contactName}
                onChange={(e) => set('contactName', e.target.value)}
                placeholder="Mauricio Gómez — Director de Cuentas"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="sf-mobile" required>
                  Celular / WhatsApp pedidos
                </Label>
                <Input
                  id="sf-mobile"
                  leadingIcon={<Phone />}
                  value={form.mobile}
                  onChange={(e) => set('mobile', e.target.value)}
                  placeholder="315 876 5432"
                  invalid={!!errors.mobile}
                />
                {errors.mobile && <FieldHint invalid>{errors.mobile}</FieldHint>}
              </div>

              <div>
                <Label htmlFor="sf-phone">Teléfono fijo</Label>
                <Input
                  id="sf-phone"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="601 789 4512"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="sf-email">Correo de pedidos y cartera</Label>
              <Input
                id="sf-email"
                type="email"
                leadingIcon={<Mail />}
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="pedidos@proveedor.com"
              />
            </div>

            <div>
              <Label htmlFor="sf-addr">Dirección de despacho / Bodega</Label>
              <Input
                id="sf-addr"
                leadingIcon={<MapPin />}
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder="Zona Industrial Montevideo, Calle 19 # 68D-04"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="sf-city">Ciudad</Label>
                <Select
                  id="sf-city"
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
                <Label htmlFor="sf-dept">Departamento</Label>
                <Select
                  id="sf-dept"
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

        {/* TAB 3: CONDICIONES COMERCIALES, BANCO & ESTADO EN HORIZONTAL */}
        {activeTab === 'comercial' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {/* ESTADO EN DISPOSICIÓN HORIZONTAL */}
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Estado del proveedor
                </Label>
                <span className="text-xs text-muted-foreground">Disponibilidad para compras y recepción</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 w-full">
                {(Object.keys(statusLabel) as SupplierStatus[]).map((value) => {
                  const selected = form.status === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set('status', value)}
                      aria-pressed={selected}
                      className={cn(
                        'flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-medium transition-all select-none',
                        selected
                          ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
                          : 'border-border/80 bg-card text-foreground/80 hover:bg-muted hover:text-foreground',
                      )}
                    >
                      {selected && <Check className="size-4 shrink-0 stroke-[2.5]" aria-hidden />}
                      <span>{statusLabel[value]}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="sf-terms">Plazo de pago</Label>
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

              <div>
                <Label htmlFor="sf-days">Días de crédito pactados</Label>
                <Input
                  id="sf-days"
                  inputMode="numeric"
                  value={form.creditDays}
                  onChange={(e) => set('creditDays', e.target.value)}
                  placeholder="30"
                />
              </div>

              <div>
                <Label htmlFor="sf-credit">Cupo de crédito asignado ($)</Label>
                <Input
                  id="sf-credit"
                  inputMode="numeric"
                  value={form.creditLimit}
                  onChange={(e) => set('creditLimit', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Información bancaria para transferencias */}
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3">
              <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Landmark className="size-4 text-primary" />
                Información Bancaria para Pagos / Egresos
              </span>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="sf-bank">Banco</Label>
                  <Select
                    id="sf-bank"
                    value={form.bank}
                    onChange={(e) => set('bank', e.target.value)}
                  >
                    <option>Bancolombia</option>
                    <option>Banco de Bogotá</option>
                    <option>Davivienda</option>
                    <option>BBVA Colombia</option>
                    <option>Banco de Occidente</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sf-acctype">Tipo de cuenta</Label>
                  <Select
                    id="sf-acctype"
                    value={form.accountType}
                    onChange={(e) => set('accountType', e.target.value)}
                  >
                    <option>Ahorros</option>
                    <option>Corriente</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sf-accnum">Número de cuenta</Label>
                  <Input
                    id="sf-accnum"
                    value={form.accountNumber}
                    onChange={(e) => set('accountNumber', e.target.value)}
                    placeholder="123-456789-00"
                  />
                </div>
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
          <Building2 />
          {initial ? 'Guardar cambios' : 'Registrar proveedor'}
        </Button>
      </div>
    </form>
  )
}
