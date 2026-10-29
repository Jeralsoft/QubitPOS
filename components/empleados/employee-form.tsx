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
  Briefcase,
  ShieldCheck,
  CreditCard,
  FileText,
  Lock,
  Camera,
  UserCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/jeralpos/button'
import { Input, Select, Label, FieldHint, Textarea } from '@/components/jeralpos/input'
import {
  cities,
  roles,
  branches,
  statusLabel,
  employeeInitials,
  companyDepartments,
  epsList,
  pensionFunds,
  cesantiasFunds,
  arlList,
  arlRisks,
  cajasCompensacion,
  banksList,
  type Employee,
  type EmployeeStatus,
  type DocumentType,
} from './mock-data'

interface EmployeeFormProps {
  initial?: Employee | null
  onCancel: () => void
  onSubmit: (fullName: string) => void
}

export type StaffType = 'planta' | 'contratista'

interface FormState {
  // 1. Identificación & Persona
  staffType: StaffType
  firstName: string
  lastName: string
  documentType: DocumentType
  document: string
  documentIssuePlace: string
  birthDate: string
  gender: string
  maritalStatus: string
  educationLevel: string

  // 2. Contacto & Ubicación
  phone: string
  mobile: string
  email: string
  address: string
  neighborhood: string
  city: string
  department: string
  emergencyContactName: string
  emergencyContactRelationship: string
  emergencyContactPhone: string

  // 3. Laboral & Contrato
  status: EmployeeStatus
  role: string
  branch: string
  companyDepartment: string
  hireDate: string
  contractType: string
  contractEndDate: string
  workSchedule: string
  salary: string
  payFrequency: string
  transportAllowance: string

  // 4. Seguridad Social (PILA) & POS
  eps: string
  pension: string
  cesantias: string
  arl: string
  arlRisk: string
  cajaCompensacion: string
  paymentMethod: string
  bank: string
  accountType: string
  accountNumber: string
  hasUser: boolean
  username: string
  posPin: string
  assignedRegister: string
  notes: string
}

function buildInitial(e?: Employee | null): FormState {
  return {
    staffType: 'planta',
    firstName: e?.firstName ?? '',
    lastName: e?.lastName ?? '',
    documentType: e?.documentType ?? 'CC',
    document: e?.document ?? '',
    documentIssuePlace: e?.documentIssuePlace ?? '',
    birthDate: e?.birthDate ?? '',
    gender: e?.gender ?? 'Masculino',
    maritalStatus: e?.maritalStatus ?? 'Soltero/a',
    educationLevel: e?.educationLevel ?? 'Bachiller',

    phone: e?.phone ?? '',
    mobile: e?.mobile ?? '',
    email: e?.email ?? '',
    address: e?.address ?? '',
    neighborhood: e?.neighborhood ?? '',
    city: e?.city ?? 'Bogotá',
    department: e?.department ?? 'Bogotá D.C.',
    emergencyContactName: e?.emergencyContactName ?? '',
    emergencyContactRelationship: e?.emergencyContactRelationship ?? 'Familiar',
    emergencyContactPhone: e?.emergencyContactPhone ?? '',

    status: e?.status ?? 'activo',
    role: e?.role ?? 'Vendedor',
    branch: e?.branch ?? 'Sede Principal',
    companyDepartment: e?.companyDepartment ?? 'Ventas y Atención al Cliente',
    hireDate: e?.hireDate ?? new Date().toISOString().split('T')[0],
    contractType: e?.contractType ?? 'Término indefinido',
    contractEndDate: e?.contractEndDate ?? '',
    workSchedule: e?.workSchedule ?? 'Tiempo completo (46 hrs/sem)',
    salary: e?.salary ? String(e.salary) : '1500000',
    payFrequency: e?.payFrequency ?? 'Quincenal',
    transportAllowance: e?.transportAllowance ? String(e.transportAllowance) : 'Aplica auxilio legal (<= 2 SMLMV)',

    eps: e?.eps ?? 'Sura EPS',
    pension: e?.pension ?? 'Porvenir',
    cesantias: e?.cesantias ?? 'Porvenir',
    arl: e?.arl ?? 'Sura ARL',
    arlRisk: e?.arlRisk ?? 'Clase II - Riesgo Bajo (1.044%) - Comercio / Ventas',
    cajaCompensacion: e?.cajaCompensacion ?? 'Compensar',

    paymentMethod: e?.paymentMethod ?? 'Transferencia bancaria (ACH)',
    bank: e?.bank ?? 'Bancolombia',
    accountType: e?.accountType ?? 'Ahorros',
    accountNumber: e?.accountNumber ?? '',
    hasUser: e?.hasUser ?? true,
    username: e?.username ?? '',
    posPin: e?.posPin ?? '',
    assignedRegister: e?.assignedRegister ?? 'Caja Principal 01',

    notes: e?.notes ?? '',
  }
}

type Errors = Partial<Record<keyof FormState, string>>
type Tab = 'identificacion' | 'contacto' | 'laboral' | 'seguridad_pos'

export function EmployeeForm({ initial, onCancel, onSubmit }: EmployeeFormProps) {
  const [form, setForm] = React.useState<FormState>(() => buildInitial(initial))
  const [errors, setErrors] = React.useState<Errors>({})
  const [activeTab, setActiveTab] = React.useState<Tab>('identificacion')

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  const preview: Employee = {
    ...buildInitial(initial),
    id: initial?.id ?? 'preview',
    fullName: `${form.firstName} ${form.lastName}`.trim(),
    firstName: form.firstName || 'N',
    lastName: form.lastName || 'N',
    hasUser: form.hasUser,
    username: form.username,
    salesCount: initial?.salesCount ?? 0,
    salesTotal: initial?.salesTotal ?? 0,
    cashOpenings: initial?.cashOpenings ?? 0,
    lastActivity: initial?.lastActivity ?? '',
    color: initial?.color ?? '#2563eb',
  } as Employee

  const validate = (): Errors => {
    const next: Errors = {}
    if (!form.document.trim()) next.document = 'El documento de identidad es obligatorio'
    if (!form.firstName.trim()) next.firstName = 'El nombre es obligatorio'
    if (!form.lastName.trim()) next.lastName = 'El apellido es obligatorio'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = 'Ingresa un correo electrónico válido'
    if (!form.mobile.trim() && !form.phone.trim())
      next.mobile = 'Ingresa al menos un número telefónico'
    if (!form.role) next.role = 'Selecciona un cargo para el empleado'
    return next
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) {
      if (next.document || next.firstName || next.lastName) {
        setActiveTab('identificacion')
      } else if (next.mobile || next.email) {
        setActiveTab('contacto')
      } else if (next.role) {
        setActiveTab('laboral')
      }
      return
    }
    onSubmit(`${form.firstName.trim()} ${form.lastName.trim()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-h-[82vh] flex-col gap-5">
      {/* Tab navigation matching customer-form */}
      <nav className="flex rounded-xl border border-border/80 bg-muted/30 p-1.5 gap-1.5 overflow-x-auto text-xs">
        {[
          { id: 'identificacion', label: 'Identificación & Persona', icon: User },
          { id: 'contacto', label: 'Contacto & Ubicación', icon: Mail },
          { id: 'laboral', label: 'Laboral & Contrato', icon: Briefcase },
          { id: 'seguridad_pos', label: 'Seguridad Social & POS', icon: ShieldCheck },
        ].map((t) => {
          const Icon = t.icon
          const active = activeTab === t.id
          const hasError =
            (t.id === 'identificacion' && (errors.firstName || errors.lastName || errors.document)) ||
            (t.id === 'contacto' && (errors.mobile || errors.email)) ||
            (t.id === 'laboral' && errors.role)

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
                hasError && 'text-danger font-semibold'
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{t.label}</span>
              {hasError && <span className="size-1.5 rounded-full bg-danger shrink-0" />}
            </button>
          )
        })}
      </nav>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-0.5 space-y-4">
        {/* TAB 1: IDENTIFICACIÓN & PERSONA */}
        {activeTab === 'identificacion' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {/* Tipo de Vinculación / Personal - Horizontal Segmented Selector */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Tipo de vinculación laboral
              </Label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => set('staffType', 'planta')}
                  className={cn(
                    'flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-medium transition-all select-none',
                    form.staffType === 'planta'
                      ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
                      : 'border-border/80 bg-card text-foreground/80 hover:bg-muted hover:text-foreground'
                  )}
                >
                  <UserCheck className="size-4" />
                  <span>Personal de Planta (Nómina)</span>
                </button>
                <button
                  type="button"
                  onClick={() => set('staffType', 'contratista')}
                  className={cn(
                    'flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-medium transition-all select-none',
                    form.staffType === 'contratista'
                      ? 'border-foreground bg-foreground text-background font-semibold shadow-xs'
                      : 'border-border/80 bg-card text-foreground/80 hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Briefcase className="size-4" />
                  <span>Contratista / Prestación de Servicios</span>
                </button>
              </div>
            </div>

            {/* Documento y Tipo */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="ef-doctype">Tipo de documento</Label>
                <Select
                  id="ef-doctype"
                  value={form.documentType}
                  onChange={(e) => set('documentType', e.target.value as DocumentType)}
                >
                  <option value="CC">CC (Cédula de Ciudadanía)</option>
                  <option value="CE">CE (Cédula de Extranjería)</option>
                  <option value="TI">TI (Tarjeta de Identidad)</option>
                  <option value="PA">Pasaporte (PA)</option>
                  <option value="PPT">PPT (Permiso Protección Temporal)</option>
                  <option value="PEP">PEP (Permiso Especial)</option>
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
                  placeholder="1020304050"
                  invalid={!!errors.document}
                  autoFocus
                />
                {errors.document && <FieldHint invalid>{errors.document}</FieldHint>}
              </div>

              <div>
                <Label htmlFor="ef-issue-place">Lugar de expedición</Label>
                <Input
                  id="ef-issue-place"
                  value={form.documentIssuePlace}
                  onChange={(e) => set('documentIssuePlace', e.target.value)}
                  placeholder="Bogotá D.C."
                />
              </div>
            </div>

            {/* Nombres y Apellidos */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="ef-first" required>
                  Nombres
                </Label>
                <Input
                  id="ef-first"
                  value={form.firstName}
                  onChange={(e) => set('firstName', e.target.value)}
                  placeholder="Carlos Andrés"
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
                  placeholder="Gómez Restrepo"
                  invalid={!!errors.lastName}
                />
                {errors.lastName && <FieldHint invalid>{errors.lastName}</FieldHint>}
              </div>
            </div>

            {/* Datos demográficos */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="ef-birth">Fecha de nacimiento</Label>
                <Input
                  id="ef-birth"
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => set('birthDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ef-gender">Género</Label>
                <Select
                  id="ef-gender"
                  value={form.gender}
                  onChange={(e) => set('gender', e.target.value)}
                >
                  <option>Masculino</option>
                  <option>Femenino</option>
                  <option>Otro</option>
                  <option>Prefiero no decir</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="ef-marital">Estado civil</Label>
                <Select
                  id="ef-marital"
                  value={form.maritalStatus}
                  onChange={(e) => set('maritalStatus', e.target.value)}
                >
                  <option>Soltero/a</option>
                  <option>Casado/a</option>
                  <option>Unión libre</option>
                  <option>Divorciado/a</option>
                  <option>Viudo/a</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="ef-edu">Nivel educativo</Label>
                <Select
                  id="ef-edu"
                  value={form.educationLevel}
                  onChange={(e) => set('educationLevel', e.target.value)}
                >
                  <option>Bachiller</option>
                  <option>Técnico</option>
                  <option>Tecnólogo</option>
                  <option>Profesional</option>
                  <option>Especialización / Posgrado</option>
                  <option>Primaria</option>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONTACTO & UBICACIÓN */}
        {activeTab === 'contacto' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Canales de comunicación directa
              </Label>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="ef-mobile" required>
                    Celular principal (WhatsApp)
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
                <div>
                  <Label htmlFor="ef-phone">Teléfono fijo / secundario</Label>
                  <Input
                    id="ef-phone"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    placeholder="601 448 1122"
                  />
                </div>
                <div>
                  <Label htmlFor="ef-email">Correo electrónico</Label>
                  <Input
                    id="ef-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="colaborador@qubitpos.com"
                    invalid={!!errors.email}
                  />
                  {errors.email && <FieldHint invalid>{errors.email}</FieldHint>}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Dirección y residencia
              </Label>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="ef-address">Dirección completa</Label>
                  <Input
                    id="ef-address"
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                    placeholder="Cra 45 # 128 - 20 Apto 402"
                  />
                </div>
                <div>
                  <Label htmlFor="ef-neighborhood">Barrio / Sector</Label>
                  <Input
                    id="ef-neighborhood"
                    value={form.neighborhood}
                    onChange={(e) => set('neighborhood', e.target.value)}
                    placeholder="La Castellana"
                  />
                </div>
                <div>
                  <Label htmlFor="ef-city">Ciudad / Municipio</Label>
                  <Select id="ef-city" value={form.city} onChange={(e) => set('city', e.target.value)}>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* Contacto de Emergencia */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Contacto en caso de emergencia
              </Label>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label htmlFor="ef-emerg-name">Nombre completo</Label>
                  <Input
                    id="ef-emerg-name"
                    value={form.emergencyContactName}
                    onChange={(e) => set('emergencyContactName', e.target.value)}
                    placeholder="María Gómez"
                  />
                </div>
                <div>
                  <Label htmlFor="ef-emerg-rel">Parentesco</Label>
                  <Select
                    id="ef-emerg-rel"
                    value={form.emergencyContactRelationship}
                    onChange={(e) => set('emergencyContactRelationship', e.target.value)}
                  >
                    <option>Cónyuge / Pareja</option>
                    <option>Padre / Madre</option>
                    <option>Hermano / Hermana</option>
                    <option>Hijo / Hija</option>
                    <option>Familiar cercano</option>
                    <option>Referencia personal</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ef-emerg-phone">Teléfono de emergencia</Label>
                  <Input
                    id="ef-emerg-phone"
                    value={form.emergencyContactPhone}
                    onChange={(e) => set('emergencyContactPhone', e.target.value)}
                    placeholder="320 987 6543"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LABORAL & CONTRATO */}
        {activeTab === 'laboral' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {/* Estado del Empleado - Horizontal Selector */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Estado laboral del colaborador
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
                {(Object.keys(statusLabel) as EmployeeStatus[]).map((value) => {
                  const selected = form.status === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set('status', value)}
                      aria-pressed={selected}
                      className={cn(
                        'flex h-11 items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition-all select-none',
                        selected
                          ? 'border-foreground bg-foreground text-background shadow-xs'
                          : 'border-border/80 bg-card text-foreground/80 hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {selected && <Check className="size-4 shrink-0 stroke-[2.5]" aria-hidden />}
                      <span>{statusLabel[value]}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Cargo, Sucursal, Departamento */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="ef-role" required>
                  Cargo o Rol
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
                <Label htmlFor="ef-branch">Sucursal asignada</Label>
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

              <div>
                <Label htmlFor="ef-comp-dept">Área de la empresa</Label>
                <Select
                  id="ef-comp-dept"
                  value={form.companyDepartment}
                  onChange={(e) => set('companyDepartment', e.target.value)}
                >
                  {companyDepartments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Contrato y Fechas */}
            <div className="grid gap-4 sm:grid-cols-4">
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
                  <option>Aprendizaje SENA</option>
                </Select>
              </div>

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
                <Label htmlFor="ef-contract-end">Fecha fin de contrato</Label>
                <Input
                  id="ef-contract-end"
                  type="date"
                  value={form.contractEndDate}
                  onChange={(e) => set('contractEndDate', e.target.value)}
                  placeholder="Si aplica"
                />
              </div>

              <div>
                <Label htmlFor="ef-schedule">Jornada laboral</Label>
                <Select
                  id="ef-schedule"
                  value={form.workSchedule}
                  onChange={(e) => set('workSchedule', e.target.value)}
                >
                  <option>Tiempo completo (46 hrs/sem)</option>
                  <option>Medio tiempo (23 hrs/sem)</option>
                  <option>Turnos rotativos</option>
                  <option>Fin de semana</option>
                  <option>Jornada nocturna</option>
                </Select>
              </div>
            </div>

            {/* Salario y Beneficios */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="ef-salary">Salario básico mensual ($ COP)</Label>
                <Input
                  id="ef-salary"
                  value={form.salary}
                  onChange={(e) => set('salary', e.target.value)}
                  placeholder="1500000"
                  inputMode="numeric"
                />
              </div>

              <div>
                <Label htmlFor="ef-pay-frequency">Periodicidad de pago</Label>
                <Select
                  id="ef-pay-frequency"
                  value={form.payFrequency}
                  onChange={(e) => set('payFrequency', e.target.value)}
                >
                  <option>Quincenal</option>
                  <option>Mensual</option>
                  <option>Semanal</option>
                  <option>Por horas</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="ef-transport">Auxilio de transporte</Label>
                <Select
                  id="ef-transport"
                  value={form.transportAllowance}
                  onChange={(e) => set('transportAllowance', e.target.value)}
                >
                  <option>Aplica auxilio legal (&lt;= 2 SMLMV)</option>
                  <option>No aplica / Exonerado (&gt; 2 SMLMV)</option>
                  <option>Vive en sitio de trabajo</option>
                  <option>Suministrado por la empresa</option>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SEGURIDAD SOCIAL (PILA) & POS */}
        {activeTab === 'seguridad_pos' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {/* Seguridad Social PILA */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Seguridad social integral (PILA)
              </Label>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="ef-eps">EPS (Salud)</Label>
                  <Select id="ef-eps" value={form.eps} onChange={(e) => set('eps', e.target.value)}>
                    {epsList.map((eps) => (
                      <option key={eps} value={eps}>
                        {eps}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ef-pension">Fondo de Pensiones</Label>
                  <Select
                    id="ef-pension"
                    value={form.pension}
                    onChange={(e) => set('pension', e.target.value)}
                  >
                    {pensionFunds.map((pf) => (
                      <option key={pf} value={pf}>
                        {pf}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ef-cesantias">Fondo de Cesantías</Label>
                  <Select
                    id="ef-cesantias"
                    value={form.cesantias}
                    onChange={(e) => set('cesantias', e.target.value)}
                  >
                    {cesantiasFunds.map((cf) => (
                      <option key={cf} value={cf}>
                        {cf}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ef-arl">ARL (Riesgos Laborales)</Label>
                  <Select id="ef-arl" value={form.arl} onChange={(e) => set('arl', e.target.value)}>
                    {arlList.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ef-arl-risk">Nivel de Riesgo ARL</Label>
                  <Select
                    id="ef-arl-risk"
                    value={form.arlRisk}
                    onChange={(e) => set('arlRisk', e.target.value)}
                  >
                    {arlRisks.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ef-caja-comp">Caja de Compensación</Label>
                  <Select
                    id="ef-caja-comp"
                    value={form.cajaCompensacion}
                    onChange={(e) => set('cajaCompensacion', e.target.value)}
                  >
                    {cajasCompensacion.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* Dispersión Bancaria */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                Dispersión de nómina y cuenta bancaria
              </Label>
              <div className="grid gap-3 sm:grid-cols-4">
                <div>
                  <Label htmlFor="ef-pay-method">Método de pago</Label>
                  <Select
                    id="ef-pay-method"
                    value={form.paymentMethod}
                    onChange={(e) => set('paymentMethod', e.target.value)}
                  >
                    <option>Transferencia bancaria (ACH)</option>
                    <option>Pago en efectivo</option>
                    <option>Monedero digital</option>
                    <option>Cheque</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ef-bank">Banco / Entidad</Label>
                  <Select id="ef-bank" value={form.bank} onChange={(e) => set('bank', e.target.value)}>
                    {banksList.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </Select>
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
                    <option>Depósito electrónico</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ef-account-number">Número de cuenta</Label>
                  <Input
                    id="ef-account-number"
                    value={form.accountNumber}
                    onChange={(e) => set('accountNumber', e.target.value)}
                    placeholder="12345678901"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>

            {/* Acceso POS & Observaciones */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Acceso al sistema POS & Cajas
                </Label>
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.hasUser}
                    onChange={(e) => set('hasUser', e.target.checked)}
                    className="size-3.5 rounded border-border text-primary"
                  />
                  <span>Habilitar usuario del sistema</span>
                </label>
              </div>

              {form.hasUser && (
                <div className="grid gap-3 sm:grid-cols-3 pt-1">
                  <div>
                    <Label htmlFor="ef-username">Usuario del sistema</Label>
                    <Input
                      id="ef-username"
                      value={form.username}
                      onChange={(e) => set('username', e.target.value)}
                      placeholder="cgomez"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ef-pos-pin">PIN rápido para cajero (4 dígitos)</Label>
                    <Input
                      id="ef-pos-pin"
                      type="password"
                      maxLength={4}
                      value={form.posPin}
                      onChange={(e) => set('posPin', e.target.value)}
                      placeholder="••••"
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ef-register">Caja física habitual</Label>
                    <Select
                      id="ef-register"
                      value={form.assignedRegister}
                      onChange={(e) => set('assignedRegister', e.target.value)}
                    >
                      <option>Caja Principal 01</option>
                      <option>Caja Rápida 02</option>
                      <option>Caja Móvil 03</option>
                      <option>Caja Domicilios</option>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="ef-notes">Observaciones internas y dotación</Label>
              <Textarea
                id="ef-notes"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Registro de dotación entregada, certificados médicos ocupacionales o restricciones..."
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions matching customer-form */}
      <div className="flex items-center justify-between border-t border-border/70 pt-4 mt-2">
        <span className="text-xs text-muted-foreground">Campos con (*) son obligatorios</span>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" className="rounded-xl px-5 font-semibold">
            <UserPlus className="size-4" />
            <span>{initial ? 'Guardar cambios' : 'Registrar empleado'}</span>
          </Button>
        </div>
      </div>
    </form>
  )
}
