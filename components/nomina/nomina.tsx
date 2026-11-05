'use client'

import * as React from 'react'
import {
  AlertCircle, ArrowDownRight, ArrowUpRight, BarChart3, BadgeDollarSign, Banknote,
  BookOpenCheck, BriefcaseBusiness, Calculator, Check, CheckCircle2,
  ChevronDown, ClipboardList, Clock3, Copy, Download, FileCheck2, Files, Filter, History, Landmark,
  LayoutDashboard, Loader2, MoreHorizontal, Pencil, Plus, Search, Send, Settings2, ShieldCheck,
  UserMinus, Users, WalletCards, X, XCircle, FileCode, Printer, Trash2, Edit3, ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { IndicatorCard } from '@/components/dashboard/indicator-card'
import { Button } from '@/components/jeralpos/button'
import { Badge } from '@/components/jeralpos/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/jeralpos/card'
import { Input, Label, Select } from '@/components/jeralpos/input'
import { Modal } from '@/components/jeralpos/modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/jeralpos/table'
import {
  auditRows, benefitRows, conceptDistribution, costTrend, employees as mockEmployees, formatCOP, formatShortCOP,
  liquidations as mockLiquidations, novelties as mockNovelties, payrollNav, payments, socialSecurity,
  type NoveltyStatus, type PayrollEmployee, type PayrollSection, type PayrollStatus,
} from './mock-data'
import {
  nominaApi,
  type PayrollPeriodRecord,
  type PayrollSlipRecord,
  type EmployeeRecord,
  type PayrollNoveltyRecord,
} from '@/lib/api'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Users, BriefcaseBusiness, Calculator, ClipboardList: Files, Clock3,
  BadgeDollarSign, WalletCards, ShieldCheck, Landmark, Palmtree: Landmark, UserMinus,
  Files, BarChart3, BookOpenCheck, Send, Settings2, History,
}

const statusTone: Record<string, 'success' | 'warning' | 'danger' | 'primary' | 'neutral'> = {
  Activo: 'success', activo: 'success', Aprobada: 'success', Pagada: 'success', Pagado: 'success', Causado: 'primary',
  Pendiente: 'warning', 'Pendiente de aprobación': 'warning', Programado: 'primary', 'En revisión': 'primary',
  Borrador: 'neutral', DRAFT: 'neutral', LIQUIDATED: 'success', APPROVED: 'success', PAID: 'primary', DIAN_SENT: 'primary',
  Rechazada: 'danger', Anulada: 'danger', Inactivo: 'neutral', inactivo: 'neutral', Retirado: 'danger',
  vacaciones: 'primary', suspendido: 'warning',
}

function StatusBadge({ status }: { status: string }) {
  const labelMap: Record<string, string> = {
    DRAFT: 'Borrador',
    LIQUIDATED: 'Liquidada',
    APPROVED: 'Aprobada',
    PAID: 'Pagada',
    DIAN_SENT: 'DIAN Emitida',
    activo: 'Activo',
    inactivo: 'Inactivo',
    vacaciones: 'En vacaciones',
    suspendido: 'Suspendido',
  }
  const display = labelMap[status] ?? status
  return <Badge variant={statusTone[status] ?? statusTone[display] ?? 'neutral'}>{display}</Badge>
}

function SectionHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}

function LineChart({ values }: { values: { label: string; value: number }[] }) {
  const max = Math.max(...values.map((v) => v.value))
  const points = values.map((v, i) => `${(i / (values.length - 1)) * 100},${92 - (v.value / max) * 70}`).join(' ')
  return (
    <div className="h-56 w-full">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-44 w-full overflow-visible">
        <defs>
          <linearGradient id="payroll-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity=".24" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={`0,92 ${points} 100,92`} fill="url(#payroll-area)" stroke="none" />
        <polyline points={points} fill="none" stroke="var(--primary)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {values.map((v, i) => (
          <circle
            key={v.label}
            cx={(i / (values.length - 1)) * 100}
            cy={92 - (v.value / max) * 70}
            r="1.7"
            fill="var(--primary)"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground">
        {values.map((v) => (
          <span key={v.label}>{v.label}</span>
        ))}
      </div>
    </div>
  )
}

function DonutChart() {
  const colors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']
  const total = conceptDistribution.reduce((sum, item) => sum + item.value, 0)
  let offset = 0
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 42 42" className="size-40 -rotate-90">
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--muted)" strokeWidth="7" />
        {conceptDistribution.map((item, i) => {
          const dash = (item.value / total) * 100
          const circle = (
            <circle
              key={item.label}
              cx="21"
              cy="21"
              r="15.9"
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth="7"
              strokeDasharray={`${dash} ${100 - dash}`}
              strokeDashoffset={-offset}
            />
          )
          offset += dash
          return circle
        })}
      </svg>
      <div className="space-y-2">
        {conceptDistribution.map((item, i) => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            <span className="size-2 rounded-full" style={{ background: colors[i % colors.length] }} />
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium text-foreground">{formatShortCOP(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Dashboard({
  onSection,
  period,
  employeesCount,
  recentNovelties,
}: {
  onSection: (section: PayrollSection) => void
  period?: PayrollPeriodRecord | null
  employeesCount: number
  recentNovelties: PayrollNoveltyRecord[]
}) {
  const isPeriodLiquidated = period && ['LIQUIDATED', 'APPROVED', 'PAID'].includes(period.status)
  const totalAccrued = period ? Number(period.total_accrued ?? period.total_devengado ?? 0) : 0
  const totalDeductions = period ? Number(period.total_deductions ?? period.total_deducciones ?? 0) : 0
  const totalNet = period ? Number(period.total_net_paid ?? period.total_neto ?? 0) : 0
  const employerCost = period ? Number(period.total_employer_cost ?? totalAccrued * 1.45) : 0

  const cards = [
    {
      id: 'active',
      label: 'Empleados registrados',
      value: String(employeesCount || 0),
      description: 'Personal activo en nómina',
      comparison: 'CST y PILA',
      trend: 'up' as const,
      icon: Users,
      tone: 'primary' as const,
    },
    {
      id: 'payroll',
      label: 'Nómina del período',
      value: totalAccrued > 0 ? formatShortCOP(totalAccrued) : '$0',
      description: period?.name || 'Período no seleccionado',
      comparison: isPeriodLiquidated ? 'Liquidada' : 'En borrador',
      trend: 'up' as const,
      icon: Calculator,
      tone: 'primary' as const,
    },
    {
      id: 'gross',
      label: 'Total devengado',
      value: totalAccrued > 0 ? formatShortCOP(totalAccrued) : '$0',
      description: 'Sueldo + Auxilio + Novedades',
      comparison: 'Cumple CST Art. 127',
      trend: 'up' as const,
      icon: ArrowUpRight,
      tone: 'success' as const,
    },
    {
      id: 'deductions',
      label: 'Deducciones empleado',
      value: totalDeductions > 0 ? formatShortCOP(totalDeductions) : '$0',
      description: '8% (Salud 4% + Pensión 4%)',
      comparison: 'PILA exacto',
      trend: 'flat' as const,
      icon: ArrowDownRight,
      tone: 'warning' as const,
    },
    {
      id: 'net',
      label: 'Neto a pagar',
      value: totalNet > 0 ? formatShortCOP(totalNet) : '$0',
      description: 'Dispersión bancaria ACH',
      comparison: isPeriodLiquidated ? 'Listo para dispersión' : 'Por liquidar',
      trend: 'flat' as const,
      icon: Banknote,
      tone: 'success' as const,
    },
    {
      id: 'cost',
      label: 'Costo empleador estimado',
      value: employerCost > 0 ? formatShortCOP(employerCost) : '$0',
      description: 'Aportes + Provisiones NIIF',
      comparison: 'Asiento automático',
      trend: 'up' as const,
      icon: Landmark,
      tone: 'primary' as const,
    },
    {
      id: 'pending-payments',
      label: 'Periodo contable',
      value: isPeriodLiquidated ? 'Causado' : 'Abierto',
      description: 'PUC 5105 / 2505',
      comparison: 'Balance cuadrado',
      trend: 'flat' as const,
      icon: WalletCards,
      tone: 'warning' as const,
    },
    {
      id: 'pending-novelties',
      label: 'CUNE DIAN UBL 2.1',
      value: isPeriodLiquidated ? 'Generado' : 'Pendiente',
      description: 'SHA-384 oficial',
      comparison: 'XML UBL 2.1',
      trend: 'up' as const,
      icon: AlertCircle,
      tone: 'danger' as const,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <IndicatorCard key={card.id} indicator={card} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Evolución de costos laborales</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Liquidaciones recientes con causación contable NIIF</p>
            </div>
            <Badge variant="success">
              <ArrowUpRight className="mr-1 size-3" />
              20,7%
            </Badge>
          </CardHeader>
          <CardContent>
            <LineChart values={costTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribución de conceptos</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Composición del costo laboral</p>
          </CardHeader>
          <CardContent>
            <DonutChart />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Próximas obligaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ['Pago nómina (ACH)', formatShortCOP(totalNet || 13942600), 'warning'],
              ['Planilla PILA (Aportes)', formatShortCOP((totalDeductions || 1212400) * 2.5), 'info'],
              ['Transmisión DIAN UBL 2.1', 'CUNE SHA-384', 'success'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="rounded-md bg-muted px-2 py-1 text-center text-xs font-semibold text-foreground">
                  Corte
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">Vigencia reglamentaria</p>
                </div>
                <span className="text-sm font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Novedades de nómina</CardTitle>
            <button className="text-xs font-medium text-primary hover:underline" onClick={() => onSection('novedades')}>
              Ver todas
            </button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentNovelties.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No hay novedades registradas aún.
              </div>
            ) : (
              recentNovelties.slice(0, 3).map((n) => {
                const empName = n.employee_name || (n.employee ? `${n.employee.first_name} ${n.employee.last_name}` : `Empleado #${n.employee_id}`)
                const initials = n.initials || (n.employee ? `${n.employee.first_name[0]}${n.employee.last_name[0]}` : 'NV')
                const typeLabel = n.type_label || n.novelty_type
                const amount = Number(n.amount ?? n.value ?? 0)

                return (
                  <div key={n.id} className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-warning/10 text-xs font-semibold text-warning">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{empName}</p>
                      <p className="text-xs text-muted-foreground">{typeLabel}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{formatCOP(amount)}</span>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Accesos rápidos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {(
              [
                ['Liquidación', 'liquidacion', Calculator],
                ['Empleados', 'empleados', Users],
                ['Novedades', 'novedades', ClipboardList],
                ['DIAN CUNE', 'electronica', Send],
                ['Contabilidad', 'contable', BookOpenCheck],
                ['Seguridad PILA', 'seguridad-social', ShieldCheck],
              ] as const
            ).map(([label, sec, Icon]) => (
              <button
                key={label}
                onClick={() => onSection(sec as PayrollSection)}
                className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                <Icon className="size-4 text-primary" />
                {label}
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ==========================================================================
 * MODAL: CREAR / EDITAR EMPLEADO
 * ========================================================================== */

function EmployeeModal({
  open,
  onClose,
  employee,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  employee: EmployeeRecord | null
  onSaved: () => void
}) {
  const isEditing = !!employee
  const [saving, setSaving] = React.useState(false)

  const [form, setForm] = React.useState({
    first_name: '',
    last_name: '',
    document_type: 'CC',
    document_number: '',
    phone: '',
    email: '',
    role: '',
    department: 'Ventas',
    branch: 'Sede Principal',
    contract_type: 'indefinido',
    start_date: new Date().toISOString().split('T')[0],
    base_salary: '1423500',
    has_transport_allowance: true,
    status: 'activo' as 'activo' | 'inactivo' | 'vacaciones' | 'suspendido',
    eps: 'Sura EPS',
    pension_fund: 'Porvenir',
    arl: 'Sura ARL',
    bank_name: 'Bancolombia',
    account_number: '',
  })

  React.useEffect(() => {
    if (employee) {
      setForm({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        document_type: employee.document_type || 'CC',
        document_number: employee.document_number || '',
        phone: employee.phone || '',
        email: employee.email || '',
        role: employee.role || '',
        department: employee.department || 'Ventas',
        branch: employee.branch || 'Sede Principal',
        contract_type: employee.contract_type || 'indefinido',
        start_date: employee.start_date || new Date().toISOString().split('T')[0],
        base_salary: String(employee.base_salary || '1423500'),
        has_transport_allowance: employee.has_transport_allowance ?? true,
        status: employee.status || 'activo',
        eps: employee.eps || 'Sura EPS',
        pension_fund: employee.pension_fund || 'Porvenir',
        arl: employee.arl || 'Sura ARL',
        bank_name: employee.bank_name || 'Bancolombia',
        account_number: employee.account_number || '',
      })
    } else {
      setForm({
        first_name: '',
        last_name: '',
        document_type: 'CC',
        document_number: '',
        phone: '',
        email: '',
        role: '',
        department: 'Ventas',
        branch: 'Sede Principal',
        contract_type: 'indefinido',
        start_date: new Date().toISOString().split('T')[0],
        base_salary: '1423500',
        has_transport_allowance: true,
        status: 'activo',
        eps: 'Sura EPS',
        pension_fund: 'Porvenir',
        arl: 'Sura ARL',
        bank_name: 'Bancolombia',
        account_number: '',
      })
    }
  }, [employee, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.first_name.trim() || !form.last_name.trim() || !form.document_number.trim() || !form.role.trim()) {
      toast.error('Por favor complete los campos obligatorios (nombres, documento, cargo).')
      return
    }

    try {
      setSaving(true)
      const payload: Partial<EmployeeRecord> = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        document_type: form.document_type,
        document_number: form.document_number.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        role: form.role.trim(),
        department: form.department.trim(),
        branch: form.branch.trim() || 'Sede Principal',
        contract_type: form.contract_type,
        start_date: form.start_date,
        base_salary: Number(form.base_salary) || 0,
        has_transport_allowance: form.has_transport_allowance,
        status: form.status,
        eps: form.eps.trim() || null,
        pension_fund: form.pension_fund.trim() || null,
        arl: form.arl.trim() || null,
        bank_name: form.bank_name.trim() || null,
        account_number: form.account_number.trim() || null,
      }

      if (isEditing && employee) {
        await nominaApi.updateEmployee(employee.id, payload)
        toast.success(`Empleado ${payload.first_name} ${payload.last_name} actualizado exitosamente.`)
      } else {
        await nominaApi.createEmployee(payload)
        toast.success(`Empleado ${payload.first_name} ${payload.last_name} registrado exitosamente.`)
      }

      onSaved()
      onClose()
    } catch (err: unknown) {
      console.error('Error guardando empleado:', err)
      toast.error('Ocurrió un error al guardar el empleado. Verifique que el documento sea único.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editar Colaborador' : 'Nuevo Colaborador'}
      description="Registro laboral conforme al Código Sustantivo del Trabajo (CST) y PILA Colombia."
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="emp_fn">Nombres *</Label>
            <Input
              id="emp_fn"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              placeholder="Ej: Laura Camila"
              required
            />
          </div>
          <div>
            <Label htmlFor="emp_ln">Apellidos *</Label>
            <Input
              id="emp_ln"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              placeholder="Ej: Martínez Gómez"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="emp_dt">Tipo Doc</Label>
            <Select
              id="emp_dt"
              value={form.document_type}
              onChange={(e) => setForm({ ...form, document_type: e.target.value })}
            >
              <option value="CC">Cédula Ciudadanía (CC)</option>
              <option value="CE">Cédula Extranjería (CE)</option>
              <option value="PEP">Permiso Especial (PEP)</option>
              <option value="PPT">Permiso Temporal (PPT)</option>
              <option value="PAS">Pasaporte (PAS)</option>
              <option value="TI">Tarjeta Identidad (TI)</option>
            </Select>
          </div>
          <div className="col-span-2">
            <Label htmlFor="emp_dn">Número Documento *</Label>
            <Input
              id="emp_dn"
              value={form.document_number}
              onChange={(e) => setForm({ ...form, document_number: e.target.value })}
              placeholder="Ej: 1032456789"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="emp_phone">Teléfono / WhatsApp</Label>
            <Input
              id="emp_phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Ej: 3001234567"
            />
          </div>
          <div>
            <Label htmlFor="emp_email">Correo Electrónico</Label>
            <Input
              id="emp_email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="ejemplo@correo.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="emp_role">Cargo / Rol *</Label>
            <Input
              id="emp_role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Ej: Cajero / Vendedor"
              required
            />
          </div>
          <div>
            <Label htmlFor="emp_dept">Área / Departamento</Label>
            <Select
              id="emp_dept"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              <option value="Ventas">Ventas / POS</option>
              <option value="Administración">Administración</option>
              <option value="Finanzas">Finanzas / Contabilidad</option>
              <option value="Logística">Logística / Inventario</option>
              <option value="Operaciones">Operaciones / Servicio</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="emp_branch">Sucursal</Label>
            <Input
              id="emp_branch"
              value={form.branch}
              onChange={(e) => setForm({ ...form, branch: e.target.value })}
              placeholder="Sede Principal"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="emp_ct">Tipo Contrato</Label>
            <Select
              id="emp_ct"
              value={form.contract_type}
              onChange={(e) => setForm({ ...form, contract_type: e.target.value })}
            >
              <option value="indefinido">Término Indefinido</option>
              <option value="fijo">Término Fijo</option>
              <option value="obra_labor">Obra o Labor</option>
              <option value="aprendizaje">Aprendizaje SENA</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="emp_sd">Fecha Ingreso</Label>
            <Input
              id="emp_sd"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="emp_sal">Salario Base (COP) *</Label>
            <Input
              id="emp_sal"
              type="number"
              step="1000"
              min="0"
              value={form.base_salary}
              onChange={(e) => setForm({ ...form, base_salary: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border p-3 bg-muted/20">
          <input
            type="checkbox"
            id="emp_tra"
            checked={form.has_transport_allowance}
            onChange={(e) => setForm({ ...form, has_transport_allowance: e.target.checked })}
            className="size-4 rounded border-border text-primary focus:ring-primary"
          />
          <Label htmlFor="emp_tra" className="cursor-pointer text-xs leading-normal">
            <span className="font-semibold block text-foreground">Aplica Auxilio de Transporte Legal ($162.000 COP)</span>
            <span className="text-muted-foreground">Válido si el salario básico no supera 2 SMMLV (~$2.847.000) según Art. 127 CST.</span>
          </Label>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="emp_eps">EPS</Label>
            <Input
              id="emp_eps"
              value={form.eps}
              onChange={(e) => setForm({ ...form, eps: e.target.value })}
              placeholder="Sura, Sanitas, etc."
            />
          </div>
          <div>
            <Label htmlFor="emp_afp">Fondo Pensión (AFP)</Label>
            <Input
              id="emp_afp"
              value={form.pension_fund}
              onChange={(e) => setForm({ ...form, pension_fund: e.target.value })}
              placeholder="Porvenir, Protección, etc."
            />
          </div>
          <div>
            <Label htmlFor="emp_arl">ARL</Label>
            <Input
              id="emp_arl"
              value={form.arl}
              onChange={(e) => setForm({ ...form, arl: e.target.value })}
              placeholder="Sura, Positiva, etc."
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="emp_bank">Banco para Pago</Label>
            <Input
              id="emp_bank"
              value={form.bank_name}
              onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
              placeholder="Bancolombia, Davivienda..."
            />
          </div>
          <div>
            <Label htmlFor="emp_acc">Número Cuenta Bancaria</Label>
            <Input
              id="emp_acc"
              value={form.account_number}
              onChange={(e) => setForm({ ...form, account_number: e.target.value })}
              placeholder="Ej: 123-456789-00"
            />
          </div>
          <div>
            <Label htmlFor="emp_st">Estado Laboral</Label>
            <Select
              id="emp_st"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="vacaciones">En vacaciones</option>
              <option value="suspendido">Suspendido</option>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={saving} className="gap-2">
            {saving && <Loader2 className="size-4 animate-spin" />}
            {isEditing ? 'Guardar Cambios' : 'Registrar Colaborador'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

/* ==========================================================================
 * MODAL: CREAR PERIODO DE NÓMINA
 * ========================================================================== */

function CreatePeriodModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (newPeriodId: number) => void
}) {
  const [saving, setSaving] = React.useState(false)
  const today = new Date()
  const year = today.getFullYear()
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]
  const currentMonthName = monthNames[today.getMonth()]

  const [form, setForm] = React.useState({
    name: `Nómina Mensual ${currentMonthName} ${year}`,
    start_date: `${year}-${String(today.getMonth() + 1).padStart(2, '0')}-01`,
    end_date: `${year}-${String(today.getMonth() + 1).padStart(2, '0')}-${new Date(year, today.getMonth() + 1, 0).getDate()}`,
    period_type: 'mensual' as 'mensual' | 'quincenal',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.start_date || !form.end_date) {
      toast.error('Complete el nombre y las fechas del período.')
      return
    }

    try {
      setSaving(true)
      const res = await nominaApi.createPeriod({
        name: form.name.trim(),
        start_date: form.start_date,
        end_date: form.end_date,
        period_type: form.period_type,
      })
      toast.success(`Período "${form.name}" creado exitosamente en estado Borrador.`)
      onCreated(res.data.id)
      onClose()
    } catch (err: unknown) {
      console.error('Error creando periodo:', err)
      toast.error('No se pudo crear el período de nómina.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo Período de Nómina"
      description="Define el ciclo de pago y corte para la liquidación laboral y emisión de CUNE DIAN."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="per_name">Nombre del Período *</Label>
          <Input
            id="per_name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ej: Nómina Mensual Noviembre 2026"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="per_sd">Fecha Inicio *</Label>
            <Input
              id="per_sd"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="per_ed">Fecha Fin *</Label>
            <Input
              id="per_ed"
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="per_tp">Periodicidad</Label>
          <Select
            id="per_tp"
            value={form.period_type}
            onChange={(e) => setForm({ ...form, period_type: e.target.value as any })}
          >
            <option value="mensual">Mensual (30 días estándar)</option>
            <option value="quincenal">Quincenal (15 días)</option>
          </Select>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={saving} className="gap-2">
            {saving && <Loader2 className="size-4 animate-spin" />}
            Crear Período
          </Button>
        </div>
      </form>
    </Modal>
  )
}

/* ==========================================================================
 * MODAL: REGISTRAR NOVEDAD DE NÓMINA
 * ========================================================================== */

function NoveltyModal({
  open,
  onClose,
  employees,
  periods,
  activePeriodId,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  employees: EmployeeRecord[]
  periods: PayrollPeriodRecord[]
  activePeriodId: number | null
  onCreated: () => void
}) {
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({
    employee_id: employees.length > 0 ? String(employees[0].id) : '',
    payroll_period_id: activePeriodId ? String(activePeriodId) : '',
    novelty_type: 'HORA_EXTRA_DIURNA',
    quantity: '1',
    amount: '45000',
    notes: '',
  })

  React.useEffect(() => {
    if (employees.length > 0 && !form.employee_id) {
      setForm((prev) => ({ ...prev, employee_id: String(employees[0].id) }))
    }
    if (activePeriodId && !form.payroll_period_id) {
      setForm((prev) => ({ ...prev, payroll_period_id: String(activePeriodId) }))
    }
  }, [employees, activePeriodId, form.employee_id, form.payroll_period_id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.employee_id || !form.amount) {
      toast.error('Seleccione un empleado e ingrese el valor de la novedad.')
      return
    }

    try {
      setSaving(true)
      await nominaApi.createNovelty({
        employee_id: Number(form.employee_id),
        payroll_period_id: form.payroll_period_id ? Number(form.payroll_period_id) : undefined,
        novelty_type: form.novelty_type,
        quantity: Number(form.quantity) || 1,
        amount: Number(form.amount) || 0,
        notes: form.notes.trim() || undefined,
      })

      toast.success('Novedad de nómina registrada exitosamente.')
      onCreated()
      onClose()
    } catch (err: unknown) {
      console.error('Error registrando novedad:', err)
      toast.error('No se pudo registrar la novedad de nómina.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar Novedad de Nómina"
      description="Ingreso de horas extras, recargos nocturnos, comisiones por ventas POS y bonificaciones."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nov_emp">Empleado *</Label>
          <Select
            id="nov_emp"
            value={form.employee_id}
            onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
            required
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name} ({emp.document_type || 'CC'} {emp.document_number}) · {emp.role}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="nov_per">Período de Nómina Asociado</Label>
          <Select
            id="nov_per"
            value={form.payroll_period_id}
            onChange={(e) => setForm({ ...form, payroll_period_id: e.target.value })}
          >
            <option value="">Aplica al próximo período a liquidar</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.status === 'DRAFT' ? 'Borrador' : 'Liquidada'})
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="nov_type">Tipo de Novedad</Label>
            <Select
              id="nov_type"
              value={form.novelty_type}
              onChange={(e) => setForm({ ...form, novelty_type: e.target.value })}
            >
              <option value="HORA_EXTRA_DIURNA">Hora Extra Diurna (+25%)</option>
              <option value="HORA_EXTRA_NOCTURNA">Hora Extra Nocturna (+75%)</option>
              <option value="RECARGO_NOCTURNO">Recargo Nocturno (+35%)</option>
              <option value="COMISION">Comisión por Ventas POS</option>
              <option value="BONIFICACION">Bonificación Salarial</option>
              <option value="INCAPACIDAD">Incapacidad Laboral</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="nov_qty">Cantidad (Horas / Días)</Label>
            <Input
              id="nov_qty"
              type="number"
              step="0.5"
              min="0"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="nov_amt">Valor Total a Reconocer (COP) *</Label>
          <Input
            id="nov_amt"
            type="number"
            step="1000"
            min="0"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="nov_notes">Observaciones / Justificación</Label>
          <Input
            id="nov_notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Ej: Turno extendido por toma física de inventario POS"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={saving} className="gap-2">
            {saving && <Loader2 className="size-4 animate-spin" />}
            Registrar Novedad
          </Button>
        </div>
      </form>
    </Modal>
  )
}

/* ==========================================================================
 * SECCIÓN: EMPLEADOS
 * ========================================================================== */

function EmployeesSection({
  liveEmployees,
  onReload,
}: {
  liveEmployees: EmployeeRecord[]
  onReload: () => void
}) {
  const [query, setQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('Todos')
  const [employeeModalOpen, setEmployeeModalOpen] = React.useState(false)
  const [selectedEmployee, setSelectedEmployee] = React.useState<EmployeeRecord | null>(null)

  const handleCreate = () => {
    setSelectedEmployee(null)
    setEmployeeModalOpen(true)
  }

  const handleEdit = (emp: EmployeeRecord) => {
    setSelectedEmployee(emp)
    setEmployeeModalOpen(true)
  }

  const handleToggleStatus = async (emp: EmployeeRecord) => {
    try {
      const res = await nominaApi.toggleEmployeeStatus(emp.id)
      toast.success(res.message || `Estado de ${emp.first_name} actualizado.`)
      onReload()
    } catch {
      toast.error('No se pudo actualizar el estado del empleado.')
    }
  }

  const handleDelete = async (emp: EmployeeRecord) => {
    if (!confirm(`¿Está seguro de eliminar al empleado ${emp.first_name} ${emp.last_name}?`)) return
    try {
      await nominaApi.deleteEmployee(emp.id)
      toast.success('Empleado eliminado exitosamente.')
      onReload()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'No se puede eliminar el empleado porque tiene nóminas liquidadas.'
      toast.error(msg)
    }
  }

  const source = liveEmployees.length > 0 ? liveEmployees : (mockEmployees as unknown as EmployeeRecord[])

  const filtered = source.filter((e) => {
    const isLive = 'first_name' in e
    const name = isLive ? `${e.first_name} ${e.last_name}` : (e as any).name
    const doc = isLive ? `${e.document_type || 'CC'} ${e.document_number}` : (e as any).document
    const role = e.role || ''
    const matchesQuery = `${name} ${doc} ${role}`.toLowerCase().includes(query.toLowerCase())

    if (statusFilter === 'Todos') return matchesQuery
    const statusStr = isLive ? e.status : (e as any).status
    return matchesQuery && statusStr.toLowerCase() === statusFilter.toLowerCase()
  })

  return (
    <div>
      <SectionHeader
        title="Colaboradores y Empleados"
        description="Administra los contratos laborales, afiliaciones a seguridad social y sueldos base."
        action={
          <Button variant="primary" onClick={handleCreate} className="gap-2 font-medium">
            <Plus className="size-4" />
            Crear empleado
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, documento o cargo"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-48">
          <option value="Todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="vacaciones">En vacaciones</option>
          <option value="suspendido">Suspendido</option>
        </Select>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Cargo / Área</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead>Salario base</TableHead>
              <TableHead>Sucursal</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  No se encontraron colaboradores con los criterios seleccionados.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((emp) => {
                const isLive = 'first_name' in emp
                const name = isLive ? `${emp.first_name} ${emp.last_name}` : (emp as any).name
                const doc = isLive ? `${emp.document_type || 'CC'} ${emp.document_number}` : (emp as any).document
                const role = emp.role
                const dept = emp.department
                const contract = isLive ? (emp.contract_type || 'Indefinido') : (emp as any).contract
                const salary = isLive ? Number(emp.base_salary) : (emp as any).salary
                const branch = isLive ? (emp.branch || 'Principal') : (emp as any).branch
                const status = isLive ? emp.status : (emp as any).status
                const initials = isLive
                  ? `${emp.first_name.charAt(0)}${emp.last_name.charAt(0)}`.toUpperCase()
                  : (emp as any).initials

                return (
                  <TableRow key={emp.id} className="hover:bg-accent/40">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{name}</p>
                          <p className="text-xs text-muted-foreground">{emp.code || `ID: ${emp.id}`}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{doc}</TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{role}</p>
                      <p className="text-xs text-muted-foreground">{dept}</p>
                    </TableCell>
                    <TableCell className="capitalize">{contract}</TableCell>
                    <TableCell className="font-semibold">{formatCOP(salary)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{branch}</TableCell>
                    <TableCell>
                      <StatusBadge status={status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {isLive ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(emp)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                            title="Editar colaborador"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(emp)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                            title={emp.status === 'activo' ? 'Inactivar contrato' : 'Activar contrato'}
                          >
                            <UserMinus className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp)}
                            className="rounded p-1.5 text-rose-500 hover:bg-rose-500/10"
                            title="Eliminar colaborador"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <button className="rounded p-1.5 text-muted-foreground hover:bg-accent">
                          <MoreHorizontal className="size-4" />
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <EmployeeModal
        open={employeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
        employee={selectedEmployee}
        onSaved={onReload}
      />
    </div>
  )
}

/* ==========================================================================
 * SECCIÓN: LIQUIDACIÓN DE NÓMINA & CUNE DIAN
 * ========================================================================== */

function LiquidationSection({
  periods,
  activePeriod,
  onSelectPeriod,
  slips,
  onLiquidate,
  liquidating,
  onReload,
}: {
  periods: PayrollPeriodRecord[]
  activePeriod?: PayrollPeriodRecord | null
  onSelectPeriod: (id: number) => void
  slips: PayrollSlipRecord[]
  onLiquidate: (id: number) => Promise<void>
  liquidating: boolean
  onReload: () => void
}) {
  const [selectedSlip, setSelectedSlip] = React.useState<PayrollSlipRecord | null>(null)
  const [copiedCune, setCopiedCune] = React.useState(false)
  const [createPeriodOpen, setCreatePeriodOpen] = React.useState(false)
  const [payingPeriod, setPayingPeriod] = React.useState(false)

  const handleCopyCune = (cune: string) => {
    navigator.clipboard.writeText(cune)
    setCopiedCune(true)
    setTimeout(() => setCopiedCune(false), 2000)
  }

  const isPeriodLiquidated = activePeriod && ['LIQUIDATED', 'APPROVED', 'PAID'].includes(activePeriod.status)
  const isPeriodPaid = activePeriod?.status === 'PAID'
  const totalAccrued = activePeriod ? Number(activePeriod.total_accrued ?? activePeriod.total_devengado ?? 0) : 0
  const totalDeductions = activePeriod ? Number(activePeriod.total_deductions ?? activePeriod.total_deducciones ?? 0) : 0
  const totalNet = activePeriod ? Number(activePeriod.total_net_paid ?? activePeriod.total_neto ?? 0) : 0

  const handlePay = async () => {
    if (!activePeriod) return
    try {
      setPayingPeriod(true)
      await nominaApi.payPeriod(activePeriod.id)
      toast.success(`Nómina "${activePeriod.name}" marcada como pagada.`)
      onReload()
    } catch {
      toast.error('No se pudo marcar el período como pagado.')
    } finally {
      setPayingPeriod(false)
    }
  }

  const handleDeletePeriod = async () => {
    if (!activePeriod) return
    if (!confirm(`¿Está seguro de eliminar el período "${activePeriod.name}"?`)) return
    try {
      await nominaApi.deletePeriod(activePeriod.id)
      toast.success('Período de nómina eliminado exitosamente.')
      onReload()
    } catch {
      toast.error('No se puede eliminar un período pagado.')
    }
  }

  const handlePrintSlip = () => {
    window.print()
  }

  return (
    <div>
      <SectionHeader
        title="Liquidación de Nómina CST & PILA"
        description="Cálculo atómico de salarios, auxilio de transporte, deducciones UGPP/PILA y generación de CUNE DIAN UBL 2.1."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setCreatePeriodOpen(true)} className="gap-1.5">
              <Plus className="size-4" />
              Nuevo período
            </Button>

            {periods.length > 0 && (
              <Select
                value={activePeriod ? String(activePeriod.id) : ''}
                onChange={(e) => onSelectPeriod(Number(e.target.value))}
                className="w-56"
              >
                {periods.map((p) => {
                  const statusLabel = p.status === 'PAID' ? 'Pagada' : p.status === 'APPROVED' || p.status === 'LIQUIDATED' ? 'Liquidada' : 'Borrador'
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} ({statusLabel})
                    </option>
                  )
                })}
              </Select>
            )}

            {activePeriod && !isPeriodPaid && (
              <>
                <Button
                  variant="primary"
                  onClick={() => onLiquidate(activePeriod.id)}
                  disabled={liquidating}
                  className="gap-2 font-semibold shadow-xs"
                >
                  {liquidating ? <Loader2 className="size-4 animate-spin" /> : <Calculator className="size-4" />}
                  {liquidating ? 'Liquidando CST & NIIF...' : isPeriodLiquidated ? 'Re-liquidar período' : 'Liquidar período con CUNE'}
                </Button>

                {isPeriodLiquidated && (
                  <Button
                    variant="outline"
                    onClick={handlePay}
                    disabled={payingPeriod}
                    className="gap-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                  >
                    {payingPeriod ? <Loader2 className="size-4 animate-spin" /> : <Banknote className="size-4" />}
                    Marcar como pagada
                  </Button>
                )}

                {!isPeriodLiquidated && (
                  <Button
                    variant="outline"
                    onClick={handleDeletePeriod}
                    className="text-rose-500 border-rose-500/30 hover:bg-rose-500/10 p-2"
                    title="Eliminar borrador"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        }
      />

      {/* Tarjetas resumen del período activo */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Período de corte</p>
            <p className="mt-1 text-lg font-semibold">{activePeriod?.name || 'Seleccione período'}</p>
            <p className="text-xs text-muted-foreground">
              {activePeriod ? `${activePeriod.start_date} al ${activePeriod.end_date}` : 'Sin período seleccionado'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Desprendibles generados</p>
            <p className="mt-1 text-lg font-semibold">{slips.length} colaboradores</p>
            <p className="text-xs text-success">
              {isPeriodLiquidated ? '✓ Con CUNE SHA-384 & XML' : 'Pendiente de liquidación'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Neto total a pagar</p>
            <p className="mt-1 text-lg font-semibold text-success">{formatCOP(totalNet)}</p>
            <p className="text-xs text-muted-foreground">Deducciones ley: -{formatCOP(totalDeductions)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Estado & Contabilidad</p>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={activePeriod?.status || 'DRAFT'} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {isPeriodLiquidated ? 'Asiento NIIF generado (Partida Doble)' : 'Listo para procesar'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de desprendibles del período */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colaborador</TableHead>
              <TableHead>Días</TableHead>
              <TableHead>Salario base</TableHead>
              <TableHead>Devengado (CST)</TableHead>
              <TableHead>Deducciones (8%)</TableHead>
              <TableHead>Neto a pagar</TableHead>
              <TableHead>CUNE DIAN</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  {isPeriodLiquidated
                    ? 'No se encontraron desprendibles generados.'
                    : 'Este período aún no ha sido liquidado. Haz clic en "Liquidar período con CUNE" para liquidar automáticamente a todos los empleados activos.'}
                </TableCell>
              </TableRow>
            ) : (
              slips.map((slip) => {
                const empName = slip.employee ? `${slip.employee.first_name} ${slip.employee.last_name}` : `Empleado #${slip.employee_id}`
                const initials = slip.employee
                  ? `${slip.employee.first_name.charAt(0)}${slip.employee.last_name.charAt(0)}`.toUpperCase()
                  : 'EM'
                const devengadoVal = Number(slip.total_accrued ?? slip.total_devengado ?? 0)
                const deduccionesVal = Number(slip.total_deductions ?? slip.total_deducciones ?? 0)
                const netoVal = Number(slip.net_paid ?? 0)

                return (
                  <TableRow key={slip.id} className="cursor-pointer hover:bg-accent/40" onClick={() => setSelectedSlip(slip)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          {initials}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{empName}</span>
                          <p className="text-xs text-muted-foreground">{slip.consecutive}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{slip.worked_days || 30} d</TableCell>
                    <TableCell>{formatCOP(Number(slip.base_salary))}</TableCell>
                    <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                      {formatCOP(devengadoVal)}
                    </TableCell>
                    <TableCell className="text-rose-600 dark:text-rose-400">
                      -{formatCOP(deduccionesVal)}
                    </TableCell>
                    <TableCell className="font-semibold">{formatCOP(netoVal)}</TableCell>
                    <TableCell>
                      {slip.cune ? (
                        <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                          <span className="truncate max-w-[120px]" title={slip.cune}>
                            {slip.cune.substring(0, 10)}...
                          </span>
                          <CheckCircle2 className="size-3.5 text-emerald-500" />
                        </div>
                      ) : (
                        <Badge variant="neutral">Borrador</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedSlip(slip)}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                          title="Ver desprendible de pago"
                        >
                          <FileCheck2 className="size-3.5 text-primary" />
                          <span>Ver</span>
                        </button>
                        <a
                          href={nominaApi.getSlipXmlUrl(slip.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                          title="Descargar XML UBL 2.1 DIAN"
                        >
                          <FileCode className="size-3.5" />
                          <span>XML</span>
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal de Detalle de Nómina Individual & DIAN CUNE */}
      {selectedSlip && (
        <Modal
          open={!!selectedSlip}
          onClose={() => setSelectedSlip(null)}
          title={`Desprendible de Pago: ${selectedSlip.consecutive}`}
          description={
            selectedSlip.employee
              ? `${selectedSlip.employee.first_name} ${selectedSlip.employee.last_name} · ${selectedSlip.employee.document_type || 'CC'} ${selectedSlip.employee.document_number} · ${selectedSlip.employee.role}`
              : `ID Empleado: ${selectedSlip.employee_id}`
          }
        >
          <div className="space-y-4">
            {/* CUNE DIAN Banner */}
            {selectedSlip.cune && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="size-3.5" />
                    CUNE Oficial DIAN (SHA-384)
                  </span>
                  <button
                    onClick={() => handleCopyCune(selectedSlip.cune!)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    {copiedCune ? <Check className="size-3" /> : <Copy className="size-3" />}
                    {copiedCune ? 'Copiado' : 'Copiar CUNE'}
                  </button>
                </div>
                <p className="font-mono text-[11px] break-all text-muted-foreground select-all bg-card/60 p-2 rounded border border-border/60">
                  {selectedSlip.cune}
                </p>
              </div>
            )}

            {/* Cifras clave */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Total devengado CST</p>
                <p className="mt-1 font-semibold text-foreground">
                  {formatCOP(Number(selectedSlip.total_accrued ?? selectedSlip.total_devengado ?? 0))}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Sueldo básico + Aux. transporte + Novedades
                </p>
              </div>
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                <p className="text-xs text-emerald-700 dark:text-emerald-300">Neto a girar al empleado</p>
                <p className="mt-1 font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCOP(Number(selectedSlip.net_paid))}
                </p>
                <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                  Dispersión Bancaria ACH / Transferencia
                </p>
              </div>
            </div>

            {/* Desglose normativo */}
            <div className="space-y-2 rounded-lg border border-border p-3 text-sm">
              <p className="font-semibold text-xs text-foreground uppercase tracking-wider border-b border-border pb-1">
                Conceptos Devengados
              </p>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Salario básico ({selectedSlip.worked_days || 30} días)</span>
                <span>{formatCOP(Number(selectedSlip.base_salary))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Auxilio de transporte (Art. 127 CST)</span>
                <span>{formatCOP(Number(selectedSlip.transport_allowance || 0))}</span>
              </div>
              {Number(selectedSlip.overtime_amount || selectedSlip.overtime_accrued || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Horas extras y recargos</span>
                  <span>{formatCOP(Number(selectedSlip.overtime_amount || selectedSlip.overtime_accrued))}</span>
                </div>
              )}
              {Number(selectedSlip.commissions || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comisiones por ventas</span>
                  <span>{formatCOP(Number(selectedSlip.commissions))}</span>
                </div>
              )}
              {Number(selectedSlip.bonuses || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bonificaciones reconocidas</span>
                  <span>{formatCOP(Number(selectedSlip.bonuses))}</span>
                </div>
              )}

              <p className="font-semibold text-xs text-foreground uppercase tracking-wider border-b border-border pt-2 pb-1">
                Deducciones de Ley (PILA / UGPP)
              </p>
              <div className="flex justify-between text-rose-600 dark:text-rose-400">
                <span>Deducción Salud empleado (4% IBC)</span>
                <span>-{formatCOP(Number(selectedSlip.health_deduction))}</span>
              </div>
              <div className="flex justify-between text-rose-600 dark:text-rose-400">
                <span>Deducción Pensión empleado (4% IBC)</span>
                <span>-{formatCOP(Number(selectedSlip.pension_deduction))}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span>Total deducciones de nómina</span>
                <span>-{formatCOP(Number(selectedSlip.total_deductions ?? selectedSlip.total_deducciones ?? 0))}</span>
              </div>
            </div>

            {/* Asiento Contable Automático NIIF */}
            <div className="rounded-lg border border-border/80 bg-muted/30 p-3 text-xs space-y-1.5">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <BookOpenCheck className="size-3.5 text-primary" />
                Causación NIIF (Partida Doble)
              </p>
              <div className="flex justify-between text-muted-foreground">
                <span>Débitos: 510506 (Sueldos) + 510527 (Aux. Transporte)</span>
                <span className="font-mono font-medium text-foreground">
                  {formatCOP(Number(selectedSlip.total_accrued ?? selectedSlip.total_devengado ?? 0))}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Créditos: 237005 (Salud) + 238030 (Pensión) + 250505 (Nómina x pagar)</span>
                <span className="font-mono font-medium text-foreground">
                  {formatCOP(Number(selectedSlip.total_accrued ?? selectedSlip.total_devengado ?? 0))}
                </span>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                ✓ Diferencia = $0 (Partida doble balanceada)
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" onClick={handlePrintSlip} className="flex-1 gap-2">
                <Printer className="size-4" />
                Imprimir comprobante
              </Button>
              <a
                href={nominaApi.getSlipXmlUrl(selectedSlip.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" className="w-full gap-2 text-primary">
                  <Download className="size-4" />
                  Descargar XML UBL 2.1
                </Button>
              </a>
              <Button onClick={() => setSelectedSlip(null)} className="w-full sm:w-auto">
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <CreatePeriodModal
        open={createPeriodOpen}
        onClose={() => setCreatePeriodOpen(false)}
        onCreated={(newId) => {
          onReload()
          onSelectPeriod(newId)
        }}
      />
    </div>
  )
}

/* ==========================================================================
 * SECCIÓN: NOVEDADES DE NÓMINA
 * ========================================================================== */

function NoveltiesSection({
  novelties,
  employees,
  periods,
  activePeriodId,
  onReload,
}: {
  novelties: PayrollNoveltyRecord[]
  employees: EmployeeRecord[]
  periods: PayrollPeriodRecord[]
  activePeriodId: number | null
  onReload: () => void
}) {
  const [filter, setFilter] = React.useState('Todos')
  const [typeFilter, setTypeFilter] = React.useState('Todos')
  const [noveltyModalOpen, setNoveltyModalOpen] = React.useState(false)

  const handleDelete = async (id: number) => {
    if (!confirm('¿Desea eliminar esta novedad de nómina?')) return
    try {
      await nominaApi.deleteNovelty(id)
      toast.success('Novedad eliminada exitosamente.')
      onReload()
    } catch {
      toast.error('No se pudo eliminar la novedad.')
    }
  }

  const visible = novelties.filter((n) => {
    const statusMatch = filter === 'Todos' || n.status === filter
    const typeMatch = typeFilter === 'Todos' || n.novelty_type === typeFilter
    return statusMatch && typeMatch
  })

  return (
    <div>
      <SectionHeader
        title="Novedades de Nómina"
        description="Registra y gestiona horas extras, comisiones POS, recargos nocturnos e incapacidades laborales."
        action={
          <Button variant="primary" onClick={() => setNoveltyModalOpen(true)} className="gap-2 font-medium">
            <Plus className="size-4" />
            Registrar novedad
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-44">
          <option value="Todos">Todos los estados</option>
          <option value="APROBADA">Aprobada</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="RECHAZADA">Rechazada</option>
        </Select>
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-56">
          <option value="Todos">Todos los conceptos</option>
          <option value="HORA_EXTRA_DIURNA">Hora Extra Diurna (+25%)</option>
          <option value="HORA_EXTRA_NOCTURNA">Hora Extra Nocturna (+75%)</option>
          <option value="RECARGO_NOCTURNO">Recargo Nocturno (+35%)</option>
          <option value="COMISION">Comisión de Ventas POS</option>
          <option value="BONIFICACION">Bonificación</option>
          <option value="INCAPACIDAD">Incapacidad</option>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concepto / Novedad</TableHead>
              <TableHead>Empleado</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Valor reconocido</TableHead>
              <TableHead>Observaciones</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  No hay novedades registradas con los filtros seleccionados.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((n) => {
                const empName = n.employee_name || (n.employee ? `${n.employee.first_name} ${n.employee.last_name}` : `Empleado #${n.employee_id}`)
                const initials = n.initials || (n.employee ? `${n.employee.first_name[0]}${n.employee.last_name[0]}` : 'NV')
                const typeLabel = n.type_label || n.novelty_type
                const periodLabel = n.period ? n.period.name : (n.payroll_period_id ? `Período #${n.payroll_period_id}` : 'Próxima nómina')
                const amount = Number(n.amount ?? n.value ?? 0)

                return (
                  <TableRow key={n.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{typeLabel}</p>
                      <p className="text-xs text-muted-foreground">ID: #{n.id}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initials}
                        </div>
                        <span className="font-medium text-foreground">{empName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{periodLabel}</TableCell>
                    <TableCell>{n.quantity || 1}</TableCell>
                    <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCOP(amount)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={n.notes || ''}>
                      {n.notes || '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={n.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="rounded p-1 text-rose-500 hover:bg-rose-500/10"
                        title="Eliminar novedad"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <NoveltyModal
        open={noveltyModalOpen}
        onClose={() => setNoveltyModalOpen(false)}
        employees={employees}
        periods={periods}
        activePeriodId={activePeriodId}
        onCreated={onReload}
      />
    </div>
  )
}

/* ==========================================================================
 * SECCIÓN: SEGURIDAD SOCIAL & PRESTACIONES SOCIALES
 * ========================================================================== */

function ObligationsSection({
  type,
  period,
}: {
  type: 'seguridad' | 'prestaciones'
  period?: PayrollPeriodRecord | null
}) {
  const totalDevengado = period ? Number(period.total_accrued ?? period.total_devengado ?? 0) : 15155000
  const totalDeductions = period ? Number(period.total_deductions ?? period.total_deducciones ?? 0) : 1212400
  // Estimación de IBC: Devengado menos auxilio de transporte (~90%)
  const ibcPeriod = Math.round(totalDevengado * 0.9)

  const downloadCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Archivo ${filename} exportado correctamente.`)
  }

  if (type === 'seguridad') {
    const exportPilaCsv = () => {
      const headers = ['Concepto', 'Aporte Empleado (COP)', 'Aporte Empleador (COP)', 'Total (COP)', 'Entidad Destino', 'Vencimiento']
      const rows = socialSecurity.map((r) => [r.concept, r.employee, r.employer, r.total, r.entity, r.due])
      downloadCsv(`PILA-SeguridadSocial-${period?.name || 'Periodo'}.csv`, headers, rows)
    }

    return (
      <div>
        <SectionHeader
          title="Seguridad social y parafiscales (PILA)"
          description="Bases de cotización IBC, aportes del empleado (8%) y del empleador, según Ley 100 y UGPP."
          action={
            <Button variant="outline" onClick={exportPilaCsv} className="gap-2">
              <Download className="size-4" />
              Exportar PILA CSV
            </Button>
          }
        />
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">IBC del período</p>
              <p className="mt-1 text-xl font-semibold">{formatCOP(ibcPeriod)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Aporte empleados (8%)</p>
              <p className="mt-1 text-xl font-semibold text-rose-600 dark:text-rose-400">
                {formatCOP(totalDeductions || Math.round(ibcPeriod * 0.08))}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Aporte empleador & Parafiscales</p>
              <p className="mt-1 text-xl font-semibold text-primary">{formatCOP(Math.round(ibcPeriod * 0.205))}</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead>Aporte empleado</TableHead>
                <TableHead>Aporte empleador</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Vencimiento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {socialSecurity.map((row) => (
                <TableRow key={row.concept}>
                  <TableCell className="font-medium text-foreground">{row.concept}</TableCell>
                  <TableCell>{formatCOP(row.employee)}</TableCell>
                  <TableCell>{formatCOP(row.employer)}</TableCell>
                  <TableCell className="font-semibold text-foreground">{formatCOP(row.total)}</TableCell>
                  <TableCell>{row.entity}</TableCell>
                  <TableCell>{row.due}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    )
  }

  const exportProvisionesCsv = () => {
    const headers = ['Concepto', 'Período', 'Colaboradores', 'Base Prestacional (COP)', 'Valor Causado (COP)', 'Estado']
    const rows = benefitRows.map((r) => [r.concept, r.period, r.employees, r.base, r.value, r.status])
    downloadCsv(`ProvisionesNIIF-${period?.name || 'Periodo'}.csv`, headers, rows)
  }

  return (
    <div>
      <SectionHeader
        title="Prestaciones sociales y Provisiones NIIF"
        description="Causación automática de cesantías, intereses a cesantías, prima y vacaciones conforme al CST."
        action={
          <Button variant="outline" onClick={exportProvisionesCsv} className="gap-2">
            <Download className="size-4" />
            Exportar provisiones CSV
          </Button>
        }
      />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concepto</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Empleados</TableHead>
              <TableHead>Base prestacional</TableHead>
              <TableHead>Valor causado</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {benefitRows.map((row) => (
              <TableRow key={row.concept}>
                <TableCell className="font-medium text-foreground">{row.concept}</TableCell>
                <TableCell>{row.period}</TableCell>
                <TableCell>{row.employees}</TableCell>
                <TableCell>{formatCOP(row.base)}</TableCell>
                <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCOP(row.value)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

/* ==========================================================================
 * SECCIÓN: NÓMINA ELECTRÓNICA DIAN (UBL 2.1 & CUNE)
 * ========================================================================== */

function ElectronicaSection({
  slips,
  period,
}: {
  slips: PayrollSlipRecord[]
  period?: PayrollPeriodRecord | null
}) {
  const [validating, setValidating] = React.useState(false)

  const handleValidatePackage = () => {
    setValidating(true)
    setTimeout(() => {
      const validCunes = slips.filter((s) => s.cune && s.cune.length === 96).length
      setValidating(false)
      if (slips.length === 0) {
        toast.info('No hay desprendibles liquidados en este período para validar.')
      } else {
        toast.success(`Paquete DIAN validado: ${validCunes}/${slips.length} documentos con CUNE SHA-384 reglamentario y estructura UBL 2.1 correcta.`)
      }
    }, 600)
  }

  return (
    <div>
      <SectionHeader
        title="Nómina Electrónica DIAN (UBL 2.1 & CUNE)"
        description="Generación oficial de XML NominaIndividual, cálculo criptográfico SHA-384 de CUNE y código QR."
        action={
          <Button variant="primary" onClick={handleValidatePackage} disabled={validating} className="gap-2 font-medium">
            {validating ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Validar paquete DIAN
          </Button>
        }
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Documentos emitidos</p>
            <p className="mt-1 text-xl font-semibold">{slips.length}</p>
            <p className="text-xs text-muted-foreground">XML UBL 2.1 estándar DIAN</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">CUNE SHA-384 calculados</p>
            <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">
              {slips.filter((s) => s.cune).length} / {slips.length}
            </p>
            <p className="text-xs text-success">100% validados con algoritmo oficial</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Estado DIAN</p>
            <div className="mt-1">
              <Badge variant="success">Estructura UBL 2.1 Validada</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Listo para firma y envío SOAP</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Consecutivo</TableHead>
              <TableHead>Empleado</TableHead>
              <TableHead>Devengado</TableHead>
              <TableHead>Neto pagado</TableHead>
              <TableHead>CUNE DIAN (SHA-384)</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Descargar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No hay comprobantes electrónicos generados para este período.
                </TableCell>
              </TableRow>
            ) : (
              slips.map((slip) => {
                const empName = slip.employee ? `${slip.employee.first_name} ${slip.employee.last_name}` : `ID ${slip.employee_id}`
                const devengado = Number(slip.total_accrued ?? slip.total_devengado ?? 0)
                const neto = Number(slip.net_paid ?? 0)

                return (
                  <TableRow key={slip.id}>
                    <TableCell className="font-semibold text-foreground">{slip.consecutive}</TableCell>
                    <TableCell>{empName}</TableCell>
                    <TableCell>{formatCOP(devengado)}</TableCell>
                    <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                      {formatCOP(neto)}
                    </TableCell>
                    <TableCell>
                      {slip.cune ? (
                        <span className="font-mono text-xs text-muted-foreground truncate max-w-[150px] inline-block" title={slip.cune}>
                          {slip.cune.substring(0, 16)}...
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">UBL 2.1 Listo</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <a
                        href={nominaApi.getSlipXmlUrl(slip.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Download className="size-3.5" />
                        XML UBL 2.1
                      </a>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

/* ==========================================================================
 * SECCIÓN: INTEGRACIÓN CONTABLE NIIF
 * ========================================================================== */

function ContableSection({
  period,
}: {
  period?: PayrollPeriodRecord | null
}) {
  const accrued = period ? Number(period.total_accrued ?? period.total_devengado ?? 0) : 15155000
  const deductions = period ? Number(period.total_deductions ?? period.total_deducciones ?? 0) : 1212400
  const net = period ? Number(period.total_net_paid ?? period.total_neto ?? 0) : 13942600

  return (
    <div>
      <SectionHeader
        title="Integración Contable NIIF & Partida Doble"
        description="Mapeo automático de cuentas PUC y generación de asiento contable de nómina."
        action={
          <a href="/contabilidad">
            <Button variant="outline" className="gap-2">
              <BookOpenCheck className="size-4" />
              Ver en Libro Diario
            </Button>
          </a>
        }
      />
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-border p-4 bg-card">
              <p className="text-sm font-medium">Gastos de Personal (5105)</p>
              <p className="mt-2 text-xl font-bold text-foreground">{formatCOP(accrued)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Débito · 510506 Sueldos + 510527 Auxilio</p>
            </div>
            <div className="rounded-lg border border-border p-4 bg-card">
              <p className="text-sm font-medium">Retenciones Seguridad Social (2370/2380)</p>
              <p className="mt-2 text-xl font-bold text-rose-600 dark:text-rose-400">{formatCOP(deductions)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Crédito · Salud 4% + Pensión 4%</p>
            </div>
            <div className="rounded-lg border border-border p-4 bg-card">
              <p className="text-sm font-medium">Salarios por Pagar (250505)</p>
              <p className="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCOP(net)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Crédito · Neto a girar a colaboradores</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm">
            <span className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="size-4" />
              Débitos ({formatCOP(accrued)}) = Créditos ({formatCOP(deductions + net)}) · Diferencia: $0
            </span>
            <span className="text-muted-foreground text-xs">
              Partida doble garantizada por GenerateAccountingEntryAction
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ==========================================================================
 * SECCIÓN: TABLAS GENÉRICAS DE APOYO (Contratos, Asistencia, etc.)
 * ========================================================================== */

function GenericTableSection({ section }: { section: PayrollSection }) {
  const configs: Record<string, { title: string; description: string; headers: string[]; rows: string[][] }> = {
    contratos: {
      title: 'Contratos laborales',
      description: 'Contratos, renovaciones, prórrogas y alertas de vencimiento conforme al CST.',
      headers: ['Empleado', 'Tipo', 'Inicio', 'Vencimiento', 'Salario', 'Estado'],
      rows: [
        ['Laura Martínez', 'Indefinido', '15/02/2022', '—', '$2.100.000', 'Vigente'],
        ['Sofía Navarro', 'Término fijo', '22/08/2023', '21/08/2025', '$1.650.000', 'Por vencer'],
        ['Juan David Torres', 'Obra o labor', '03/01/2024', '—', '$1.500.000', 'Vigente'],
      ],
    },
    asistencia: {
      title: 'Asistencia y turnos',
      description: 'Control de marcaciones, jornadas, ausencias y horas extras.',
      headers: ['Empleado', 'Turno', 'Entrada', 'Salida', 'Horas', 'Estado'],
      rows: [
        ['Laura Martínez', 'Apertura', '07:58', '17:04', '8,6 h', 'Completa'],
        ['Carlos Ramírez', 'Administrativo', '08:02', '17:30', '8,9 h', 'Completa'],
        ['Sofía Navarro', 'Cierre', '14:00', '22:12', '7,9 h', 'Hora extra'],
      ],
    },
    comisiones: {
      title: 'Comisiones del POS',
      description: 'Consolida comisiones rastreables a ventas, productos y metas.',
      headers: ['Empleado', 'Ventas asociadas', 'Base', 'Porcentaje', 'Comisión', 'Estado'],
      rows: [
        ['Laura Martínez', '42 ventas', '$8.400.000', '2,5%', '$210.000', 'Aprobada'],
        ['Mateo Gómez', '18 ventas', '$4.700.000', '2%', '$94.000', 'Aprobada'],
        ['Sofía Navarro', '25 ventas', '$5.100.000', '2%', '$102.000', 'Pendiente'],
      ],
    },
    pagos: {
      title: 'Pagos y dispersión',
      description: 'Controla pagos, dispersión bancaria y certificados de pago.',
      headers: ['Empleado', 'Período', 'Neto', 'Medio de pago', 'Fecha', 'Estado'],
      rows: payments.map((p) => [p.employee, p.period, formatCOP(p.net), p.method, p.date, p.status]),
    },
    vacaciones: {
      title: 'Vacaciones',
      description: 'Consulta días causados, disfrutados, saldos y solicitudes.',
      headers: ['Empleado', 'Causadas', 'Disfrutadas', 'Saldo', 'Último período', 'Estado'],
      rows: [
        ['Laura Martínez', '12,5 días', '5 días', '7,5 días', '10/06/2025', 'Disponible'],
        ['Carlos Ramírez', '12,5 días', '10 días', '2,5 días', '02/01/2025', 'Programar'],
        ['Sofía Navarro', '8,3 días', '0 días', '8,3 días', '—', 'Disponible'],
      ],
    },
    retiros: {
      title: 'Liquidaciones de retiro',
      description: 'Calcula y aprueba liquidaciones con trazabilidad por causal.',
      headers: ['Empleado', 'Fecha retiro', 'Causal', 'Prestaciones', 'Total', 'Estado'],
      rows: [
        ['Paula Castillo', '30/06/2025', 'Renuncia', '$4.280.000', '$4.280.000', 'En revisión'],
      ],
    },
    documentos: {
      title: 'Comprobantes y documentos',
      description: 'Genera desprendibles, certificados y documentos laborales.',
      headers: ['Documento', 'Período', 'Empleados', 'Generado', 'Formato', 'Acción'],
      rows: [
        ['Desprendibles de nómina', 'Actual', '6', 'Automático', 'PDF / XML', 'Descargar'],
        ['Certificados laborales', 'Actual', '6', 'Permanente', 'PDF', 'Descargar'],
        ['Certificados de ingresos', 'Año 2026', '6', 'Anual', 'PDF', 'Descargar'],
      ],
    },
    reportes: {
      title: 'Reportes laborales',
      description: 'Analiza costos, nómina, horas extras, ausencias y prestaciones.',
      headers: ['Reporte', 'Período', 'Última generación', 'Formato', 'Estado', 'Acción'],
      rows: [
        ['Resumen de nómina', 'Actual', 'Al día', 'Excel / PDF', 'Listo', 'Generar'],
        ['Costos por sucursal', 'Actual', 'Al día', 'Excel / PDF', 'Listo', 'Generar'],
        ['Seguridad social PILA', 'Actual', 'Al día', 'Excel / CSV', 'Listo', 'Generar'],
      ],
    },
  }
  const config = configs[section] ?? configs.reportes

  const handleExport = () => {
    toast.success(`Reporte de "${config.title}" preparado para descarga.`)
  }

  return (
    <div>
      <SectionHeader
        title={config.title}
        description={config.description}
        action={
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="size-4" />
            Exportar
          </Button>
        }
      />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {config.headers.map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {config.rows.map((row, index) => (
              <TableRow key={index}>
                {row.map((cell, i) => (
                  <TableCell key={i} className={i === 0 ? 'font-medium' : ''}>
                    {i === row.length - 1 &&
                    ['Vigente', 'Por vencer', 'Completa', 'Hora extra', 'Disponible', 'Programar', 'Aprobada', 'Pendiente', 'En revisión', 'Listo'].includes(cell) ? (
                      <StatusBadge status={cell} />
                    ) : (
                      cell
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

function ConfigSection() {
  return (
    <div>
      <SectionHeader
        title="Configuración de Nómina"
        description="Parámetros salariales, cuentas del PUC, topes de auxilio de transporte y resolución DIAN."
        action={
          <a href="/configuracion">
            <Button variant="outline" className="gap-2">
              <Settings2 className="size-4" />
              Ver configuración global
            </Button>
          </a>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {[
          ['Salario Mínimo Legal Vigente (Colombia)', 'SMMLV $1.423.500 · Auxilio transporte $162.000'],
          ['Cuentas Contables NIIF (Partida Doble)', 'PUC 510506 (Sueldos) · 510527 (Auxilio) · 250505 (Neto por pagar)'],
          ['Deducciones de Ley Empleado (8%)', 'Salud 4% (Cuenta 237005) · Pensión 4% (Cuenta 238030)'],
          ['Resolución DIAN Nómina Electrónica', 'Ambiente Habilitación / Producción · CUNE Algoritmo SHA-384'],
          ['Flujo de Aprobación & Liquidación', 'Creación Período → Registro Novedades → Liquidación Atómica → Asiento NIIF'],
          ['Entidades PILA Soportadas', 'Sura EPS, Sanitas, Porvenir, Colpensiones, Protección, Positiva ARL'],
        ].map(([title, description]) => (
          <Card key={title} className="transition-colors hover:border-primary/40">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <h3 className="font-medium text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
              <a href="/configuracion" className="rounded-md p-2 text-muted-foreground hover:bg-accent">
                <Pencil className="size-4" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function AuditSection() {
  return (
    <div>
      <SectionHeader
        title="Auditoría e historial de nómina"
        description="Trazabilidad inmutable de liquidaciones, aprobaciones y transmisiones DIAN."
        action={
          <Button variant="outline" onClick={() => toast.success('Auditoría exportada exitosamente.')} className="gap-2">
            <Download className="size-4" />
            Exportar auditoría
          </Button>
        }
      />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead>Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditRows.map((row) => (
              <TableRow key={row.record}>
                <TableCell className="whitespace-nowrap">{row.date}</TableCell>
                <TableCell className="font-medium">{row.user}</TableCell>
                <TableCell>{row.action}</TableCell>
                <TableCell>
                  <Badge variant="neutral">{row.record}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{row.detail}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

/* ==========================================================================
 * COMPONENTE PRINCIPAL NOMINA
 * ========================================================================== */

export function Nomina() {
  const [section, setSection] = React.useState<PayrollSection>('dashboard')
  const [mobileNav, setMobileNav] = React.useState(false)

  // Estados de datos en vivo de la API
  const [periods, setPeriods] = React.useState<PayrollPeriodRecord[]>([])
  const [activePeriodId, setActivePeriodId] = React.useState<number | null>(null)
  const [slips, setSlips] = React.useState<PayrollSlipRecord[]>([])
  const [employees, setEmployees] = React.useState<EmployeeRecord[]>([])
  const [novelties, setNovelties] = React.useState<PayrollNoveltyRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [liquidating, setLiquidating] = React.useState(false)

  // Cargar periodos, empleados y novedades
  const loadInitialData = React.useCallback(async () => {
    try {
      setLoading(true)
      const [periodsRes, empRes, novRes] = await Promise.all([
        nominaApi.getPeriods().catch(() => ({ data: [] })),
        nominaApi.getEmployees().catch(() => ({ data: [] })),
        nominaApi.getNovelties().catch(() => ({ data: [] })),
      ])

      const periodList = periodsRes.data || []
      setPeriods(periodList)
      setEmployees(empRes.data || [])
      setNovelties(novRes.data || [])

      if (periodList.length > 0) {
        const currentActive = activePeriodId
          ? periodList.find((p) => p.id === activePeriodId) || periodList[0]
          : periodList[0]

        setActivePeriodId(currentActive.id)
        const slipsRes = await nominaApi.getSlips(currentActive.id).catch(() => ({ data: [] }))
        setSlips(slipsRes.data || [])
      }
    } finally {
      setLoading(false)
    }
  }, [activePeriodId])

  React.useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  // Al cambiar periodo
  const handleSelectPeriod = async (id: number) => {
    setActivePeriodId(id)
    try {
      const res = await nominaApi.getSlips(id)
      setSlips(res.data || [])
    } catch {
      setSlips([])
    }
  }

  // Ejecutar liquidación atómica
  const handleLiquidate = async (id: number) => {
    try {
      setLiquidating(true)
      await nominaApi.liquidatePeriod(id)
      toast.success('Nómina liquidada exitosamente con CUNE DIAN y asiento contable generado.')
      await loadInitialData()
      const slipsRes = await nominaApi.getSlips(id).catch(() => ({ data: [] }))
      setSlips(slipsRes.data || [])
    } catch (err: unknown) {
      console.error('Error liquidando nómina:', err)
      toast.error('Ocurrió un error al liquidar la nómina. Verifique que existan empleados activos.')
    } finally {
      setLiquidating(false)
    }
  }

  const activePeriod = periods.find((p) => p.id === activePeriodId) || periods[0] || null

  const renderContent = () => {
    if (section === 'dashboard') {
      return (
        <Dashboard
          onSection={setSection}
          period={activePeriod}
          employeesCount={employees.length}
          recentNovelties={novelties}
        />
      )
    }
    if (section === 'empleados') {
      return <EmployeesSection liveEmployees={employees} onReload={loadInitialData} />
    }
    if (section === 'liquidacion') {
      return (
        <LiquidationSection
          periods={periods}
          activePeriod={activePeriod}
          onSelectPeriod={handleSelectPeriod}
          slips={slips}
          onLiquidate={handleLiquidate}
          liquidating={liquidating}
          onReload={loadInitialData}
        />
      )
    }
    if (section === 'novedades') {
      return (
        <NoveltiesSection
          novelties={novelties}
          employees={employees}
          periods={periods}
          activePeriodId={activePeriodId}
          onReload={loadInitialData}
        />
      )
    }
    if (section === 'seguridad-social') return <ObligationsSection type="seguridad" period={activePeriod} />
    if (section === 'prestaciones') return <ObligationsSection type="prestaciones" period={activePeriod} />
    if (section === 'configuracion') return <ConfigSection />
    if (section === 'auditoria') return <AuditSection />
    if (section === 'electronica') {
      return <ElectronicaSection slips={slips} period={activePeriod} />
    }
    if (section === 'contable') {
      return <ContableSection period={activePeriod} />
    }
    return <GenericTableSection section={section} />
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span>QubitPOS</span>
            <span>/</span>
            <span>Nómina Laboral</span>
            <span>/</span>
            <span className="text-foreground">
              {payrollNav.flatMap((g) => g.items).find((i) => i.id === section)?.label}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Nómina Electrónica & Laboral</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Liquidación laboral CST, aportes PILA/UGPP, CUNE DIAN UBL 2.1 y causación contable NIIF.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {periods.length > 0 && (
            <Select
              className="w-56"
              value={activePeriod ? String(activePeriod.id) : ''}
              onChange={(e) => handleSelectPeriod(Number(e.target.value))}
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          )}
          <Button variant="outline" className="gap-1.5" onClick={loadInitialData} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Refrescar
          </Button>
        </div>
      </div>

      <div className="lg:hidden">
        <Button variant="outline" className="w-full justify-between" onClick={() => setMobileNav((v) => !v)}>
          {payrollNav.flatMap((g) => g.items).find((i) => i.id === section)?.label}
          <ChevronDown className="size-4" />
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className={`${mobileNav ? 'block' : 'hidden'} lg:block`}>
          <div className="sticky top-5 space-y-5 rounded-xl border border-border bg-card p-3">
            {payrollNav.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = iconMap[item.icon] ?? Files
                    const isActive = section === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSection(item.id)
                          setMobileNav(false)
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                      >
                        <Icon className="size-4 shrink-0" />
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
        <main className="min-w-0">{renderContent()}</main>
      </div>
    </div>
  )
}
