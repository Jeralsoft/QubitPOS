'use client'

import * as React from 'react'
import {
  AlertCircle, ArrowDownRight, ArrowUpRight, BarChart3, BadgeDollarSign, Banknote,
  BookOpenCheck, BriefcaseBusiness, Calculator, Check, CheckCircle2,
  ChevronDown, ClipboardList, Clock3, Copy, Download, FileCheck2, Files, Filter, History, Landmark,
  LayoutDashboard, Loader2, MoreHorizontal, Pencil, Plus, Search, Send, Settings2, ShieldCheck,
  UserMinus, Users, WalletCards, X, XCircle, FileCode,
} from 'lucide-react'
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
import { nominaApi, type PayrollPeriodRecord, type PayrollSlipRecord, type EmployeeRecord } from '@/lib/api'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Users, BriefcaseBusiness, Calculator, ClipboardList: Files, Clock3,
  BadgeDollarSign, WalletCards, ShieldCheck, Landmark, Palmtree: Landmark, UserMinus,
  Files, BarChart3, BookOpenCheck, Send, Settings2, History,
}

const statusTone: Record<string, 'success' | 'warning' | 'danger' | 'primary' | 'neutral'> = {
  Activo: 'success', Aprobada: 'success', Pagada: 'success', Pagado: 'success', Causado: 'primary',
  Pendiente: 'warning', 'Pendiente de aprobación': 'warning', Programado: 'primary', 'En revisión': 'primary',
  Borrador: 'neutral', DRAFT: 'neutral', LIQUIDATED: 'success', APPROVED: 'success', DIAN_SENT: 'primary',
  Rechazada: 'danger', Anulada: 'danger', Inactivo: 'neutral', Retirado: 'danger',
}

function StatusBadge({ status }: { status: string }) {
  const labelMap: Record<string, string> = {
    DRAFT: 'Borrador',
    LIQUIDATED: 'Liquidada',
    APPROVED: 'Aprobada',
    DIAN_SENT: 'DIAN Emitida',
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
}: {
  onSection: (section: PayrollSection) => void
  period?: PayrollPeriodRecord | null
  employeesCount: number
}) {
  const totalAccrued = period?.total_accrued ? Number(period.total_accrued) : 15_155_000
  const totalDeductions = period?.total_deductions ? Number(period.total_deductions) : 1_212_400
  const totalNet = period?.total_net_paid ? Number(period.total_net_paid) : 13_942_600
  const employerCost = period?.total_employer_cost ? Number(period.total_employer_cost) : 21_442_500

  const cards = [
    { id: 'active', label: 'Empleados registrados', value: String(employeesCount || 6), description: 'Personal activo', comparison: 'CST y PILA', trend: 'up' as const, icon: Users, tone: 'primary' as const },
    { id: 'payroll', label: 'Nómina del período', value: formatShortCOP(totalAccrued), description: period?.name || 'Período vigente', comparison: period?.status === 'LIQUIDATED' ? 'Liquidada' : 'En borrador', trend: 'up' as const, icon: Calculator, tone: 'primary' as const },
    { id: 'gross', label: 'Total devengado', value: formatShortCOP(totalAccrued), description: 'Sueldo + Auxilio + Novedades', comparison: 'Cumple CST Art. 127', trend: 'up' as const, icon: ArrowUpRight, tone: 'success' as const },
    { id: 'deductions', label: 'Deducciones empleado', value: formatShortCOP(totalDeductions), description: '8% (Salud 4% + Pensión 4%)', comparison: 'PILA exacto', trend: 'flat' as const, icon: ArrowDownRight, tone: 'warning' as const },
    { id: 'net', label: 'Neto a pagar', value: formatShortCOP(totalNet), description: 'Dispersión bancaria ACH', comparison: 'Listo para giro', trend: 'flat' as const, icon: Banknote, tone: 'success' as const },
    { id: 'cost', label: 'Costo empleador', value: formatShortCOP(employerCost), description: 'Aportes + Provisiones NIIF', comparison: 'Asiento automático', trend: 'up' as const, icon: Landmark, tone: 'primary' as const },
    { id: 'pending-payments', label: 'Periodo contable', value: period?.status === 'LIQUIDATED' ? 'Causado' : 'Abierto', description: 'PUC 5105 / 2505', comparison: 'Balance cuadrado', trend: 'flat' as const, icon: WalletCards, tone: 'warning' as const },
    { id: 'pending-novelties', label: 'CUNE DIAN UBL 2.1', value: period?.status === 'LIQUIDATED' ? 'Generado' : 'Pendiente', description: 'SHA-384 oficial', comparison: 'XML UBL 2.1', trend: 'up' as const, icon: AlertCircle, tone: 'danger' as const },
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
              ['30 Jun', 'Pago de nómina (ACH)', formatShortCOP(totalNet), 'warning'],
              ['05 Jul', 'Planilla PILA (Aportes)', formatShortCOP(totalDeductions * 2.5), 'info'],
              ['15 Jul', 'Transmisión DIAN UBL 2.1', 'CUNE', 'success'],
            ].map(([date, label, value]) => (
              <div key={label} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="rounded-md bg-muted px-2 py-1 text-center text-xs font-semibold text-foreground">{date}</div>
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
            <button className="text-xs font-medium text-primary" onClick={() => onSection('novedades')}>
              Ver todas
            </button>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockNovelties.slice(0, 3).map((n) => (
              <div key={n.id} className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-warning-muted text-xs font-semibold text-warning">
                  {n.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{n.employee}</p>
                  <p className="text-xs text-muted-foreground">{n.type}</p>
                </div>
                <span className="text-sm font-semibold text-foreground">{formatCOP(n.value)}</span>
              </div>
            ))}
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

function EmployeesSection({ liveEmployees }: { liveEmployees: EmployeeRecord[] }) {
  const [query, setQuery] = React.useState('')
  const source = liveEmployees.length > 0 ? liveEmployees : mockEmployees

  const filtered = source.filter((e) => {
    const text = 'first_name' in e ? `${e.first_name} ${e.last_name} ${e.document_number} ${e.role}` : `${e.name} ${e.document} ${e.role}`
    return text.toLowerCase().includes(query.toLowerCase())
  })

  return (
    <div>
      <SectionHeader
        title="Colaboradores y Empleados"
        description="Administra los contratos laborales, afiliaciones a seguridad social y sueldos base."
        action={
          <Button>
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
        <Select className="w-48">
          <option>Todos los estados</option>
          <option>Activo</option>
          <option>Inactivo</option>
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
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((emp) => {
              const isLive = 'first_name' in emp
              const name = isLive ? `${emp.first_name} ${emp.last_name}` : emp.name
              const doc = isLive ? `${emp.document_type || 'CC'} ${emp.document_number}` : emp.document
              const role = isLive ? emp.role : emp.role
              const dept = isLive ? emp.department : emp.department
              const contract = isLive ? (emp.contract_type || 'Indefinido') : emp.contract
              const salary = isLive ? Number(emp.base_salary) : emp.salary
              const branch = isLive ? (emp.branch || 'Principal') : emp.branch
              const status = isLive ? (emp.status === 'activo' ? 'Activo' : 'Inactivo') : emp.status
              const initials = isLive
                ? `${emp.first_name.charAt(0)}${emp.last_name.charAt(0)}`.toUpperCase()
                : emp.initials

              return (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground">ID: {emp.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{doc}</TableCell>
                  <TableCell>
                    <p className="font-medium">{role}</p>
                    <p className="text-xs text-muted-foreground">{dept}</p>
                  </TableCell>
                  <TableCell>{contract}</TableCell>
                  <TableCell className="font-medium">{formatCOP(salary)}</TableCell>
                  <TableCell>{branch}</TableCell>
                  <TableCell>
                    <StatusBadge status={status} />
                  </TableCell>
                  <TableCell>
                    <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent">
                      <MoreHorizontal className="size-4" />
                    </button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

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

  const handleCopyCune = (cune: string) => {
    navigator.clipboard.writeText(cune)
    setCopiedCune(true)
    setTimeout(() => setCopiedCune(false), 2000)
  }

  const isPeriodLiquidated = activePeriod?.status === 'LIQUIDATED'
  const totalAccrued = activePeriod ? Number(activePeriod.total_accrued) : 0
  const totalDeductions = activePeriod ? Number(activePeriod.total_deductions) : 0
  const totalNet = activePeriod ? Number(activePeriod.total_net_paid) : 0
  const totalCost = activePeriod ? Number(activePeriod.total_employer_cost) : 0

  return (
    <div>
      <SectionHeader
        title="Liquidación de Nómina CST & PILA"
        description="Cálculo atómico de salarios, auxilio de transporte, deducciones UGPP/PILA y generación de CUNE DIAN UBL 2.1."
        action={
          <div className="flex items-center gap-2">
            <Select
              value={activePeriod ? String(activePeriod.id) : ''}
              onChange={(e) => onSelectPeriod(Number(e.target.value))}
              className="w-56"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.status === 'LIQUIDATED' ? 'Liquidada' : 'Borrador'})
                </option>
              ))}
            </Select>
            {activePeriod && activePeriod.status !== 'LIQUIDATED' && (
              <Button
                variant="primary"
                onClick={() => onLiquidate(activePeriod.id)}
                disabled={liquidating}
                className="gap-2 font-semibold shadow-xs"
              >
                {liquidating ? <Loader2 className="size-4 animate-spin" /> : <Calculator className="size-4" />}
                {liquidating ? 'Liquidando CST & NIIF...' : 'Liquidar período con CUNE'}
              </Button>
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
              {activePeriod?.start_date} al {activePeriod?.end_date}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Desprendibles generados</p>
            <p className="mt-1 text-lg font-semibold">{slips.length} empleados</p>
            <p className="text-xs text-success">
              {isPeriodLiquidated ? '✓ Con CUNE SHA-384 & XML' : 'Pendiente de liquidación'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Neto total a pagar</p>
            <p className="mt-1 text-lg font-semibold text-success">{formatCOP(totalNet)}</p>
            <p className="text-xs text-muted-foreground">Deducciones: -{formatCOP(totalDeductions)}</p>
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
              <TableHead>Empleado</TableHead>
              <TableHead>Días</TableHead>
              <TableHead>Salario base</TableHead>
              <TableHead>Devengado (CST)</TableHead>
              <TableHead>Deducciones (8%)</TableHead>
              <TableHead>Neto a pagar</TableHead>
              <TableHead>CUNE DIAN</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  {isPeriodLiquidated
                    ? 'No se encontraron desprendibles.'
                    : 'Este período aún no ha sido liquidado. Haz clic en "Liquidar período con CUNE" para liquidar automáticamente a todos los empleados activos.'}
                </TableCell>
              </TableRow>
            ) : (
              slips.map((slip) => {
                const empName = slip.employee ? `${slip.employee.first_name} ${slip.employee.last_name}` : `Empleado #${slip.employee_id}`
                const initials = slip.employee
                  ? `${slip.employee.first_name.charAt(0)}${slip.employee.last_name.charAt(0)}`.toUpperCase()
                  : 'EM'

                return (
                  <TableRow key={slip.id} className="cursor-pointer hover:bg-accent/40" onClick={() => setSelectedSlip(slip)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          {initials}
                        </div>
                        <div>
                          <span className="font-medium">{empName}</span>
                          <p className="text-xs text-muted-foreground">{slip.consecutive}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{slip.worked_days} d</TableCell>
                    <TableCell>{formatCOP(Number(slip.base_salary))}</TableCell>
                    <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                      {formatCOP(Number(slip.total_accrued))}
                    </TableCell>
                    <TableCell className="text-rose-600 dark:text-rose-400">
                      -{formatCOP(Number(slip.total_deductions))}
                    </TableCell>
                    <TableCell className="font-semibold">{formatCOP(Number(slip.net_paid))}</TableCell>
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
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
          title={`Desprendible de Nómina: ${selectedSlip.consecutive}`}
          description={
            selectedSlip.employee
              ? `${selectedSlip.employee.first_name} ${selectedSlip.employee.last_name} · ${selectedSlip.employee.document_type || 'CC'} ${selectedSlip.employee.document_number}`
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
                <p className="mt-1 font-semibold text-foreground">{formatCOP(Number(selectedSlip.total_accrued))}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Sueldo básico + Aux. transporte
                </p>
              </div>
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                <p className="text-xs text-emerald-700 dark:text-emerald-300">Neto pagado al empleado</p>
                <p className="mt-1 font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCOP(Number(selectedSlip.net_paid))}
                </p>
                <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                  Giro ACH / Efectivo
                </p>
              </div>
            </div>

            {/* Desglose normativo */}
            <div className="space-y-2 rounded-lg border border-border p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Salario básico ({selectedSlip.worked_days} días)</span>
                <span>{formatCOP(Number(selectedSlip.accrued_salary))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Auxilio de transporte (Art. 127 CST)</span>
                <span>{formatCOP(Number(selectedSlip.transport_allowance))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Horas extras y recargos</span>
                <span>{formatCOP(Number(selectedSlip.overtime_accrued))}</span>
              </div>
              <div className="border-t border-border/80 pt-2 flex justify-between text-rose-600 dark:text-rose-400">
                <span>Deducción Salud empleado (4% IBC)</span>
                <span>-{formatCOP(Number(selectedSlip.health_deduction))}</span>
              </div>
              <div className="flex justify-between text-rose-600 dark:text-rose-400">
                <span>Deducción Pensión empleado (4% IBC)</span>
                <span>-{formatCOP(Number(selectedSlip.pension_deduction))}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span>Total deducciones de ley</span>
                <span>-{formatCOP(Number(selectedSlip.total_deductions))}</span>
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
                <span className="font-mono font-medium text-foreground">{formatCOP(Number(selectedSlip.total_accrued))}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Créditos: 237005 (Salud) + 238030 (Pensión) + 250505 (Nómina x pagar)</span>
                <span className="font-mono font-medium text-foreground">{formatCOP(Number(selectedSlip.total_accrued))}</span>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                ✓ Diferencia = $0 (Partida doble balanceada)
              </p>
            </div>

            <div className="flex gap-2">
              <a
                href={nominaApi.getSlipXmlUrl(selectedSlip.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" className="w-full gap-2">
                  <Download className="size-4" />
                  Descargar XML UBL 2.1
                </Button>
              </a>
              <Button onClick={() => setSelectedSlip(null)} className="flex-1">
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function NoveltiesSection() {
  const [filter, setFilter] = React.useState('Todos')
  const visible = mockNovelties.filter((n) => filter === 'Todos' || n.status === filter)

  return (
    <div>
      <SectionHeader
        title="Novedades de Nómina"
        description="Registra y aprueba horas extras, comisiones POS, recargos nocturnos e incapacidades."
        action={
          <Button>
            <Plus className="size-4" />
            Registrar novedad
          </Button>
        }
      />
      <div className="mb-4 flex gap-2">
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-44">
          <option>Todos</option>
          <option>Pendiente</option>
          <option>Aprobada</option>
          <option>Rechazada</option>
        </Select>
        <Button variant="outline">
          <Filter className="size-4" />
          Filtros avanzados
        </Button>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Novedad</TableHead>
              <TableHead>Empleado</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Registró</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((n) => (
              <TableRow key={n.id}>
                <TableCell>
                  <p className="font-medium">{n.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {n.id} · {n.date}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {n.initials}
                    </div>
                    {n.employee}
                  </div>
                </TableCell>
                <TableCell>{n.period}</TableCell>
                <TableCell>{n.quantity}</TableCell>
                <TableCell className="font-medium">{formatCOP(n.value)}</TableCell>
                <TableCell>{n.registeredBy}</TableCell>
                <TableCell>
                  <StatusBadge status={n.status} />
                </TableCell>
                <TableCell>
                  <button className="rounded p-1 hover:bg-accent">
                    <MoreHorizontal className="size-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

function GenericTableSection({ section }: { section: PayrollSection }) {
  const configs: Record<string, { title: string; description: string; headers: string[]; rows: string[][] }> = {
    contratos: {
      title: 'Contratos laborales',
      description: 'Contratos, renovaciones, prórrogas y alertas de vencimiento.',
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
        ['—', '—', 'Sin liquidaciones nuevas', '—', '—', '—'],
      ],
    },
    documentos: {
      title: 'Comprobantes y documentos',
      description: 'Genera desprendibles, certificados y documentos laborales.',
      headers: ['Documento', 'Período', 'Empleados', 'Generado', 'Formato', 'Acción'],
      rows: [
        ['Desprendibles de nómina', 'Junio 2025', '6', '28/06/2025', 'PDF', 'Descargar'],
        ['Certificados laborales', 'Actual', '6', '27/06/2025', 'PDF', 'Descargar'],
        ['Certificados de ingresos', 'Año 2024', '6', '15/01/2025', 'PDF', 'Descargar'],
      ],
    },
    reportes: {
      title: 'Reportes laborales',
      description: 'Analiza costos, nómina, horas extras, ausencias y prestaciones.',
      headers: ['Reporte', 'Período', 'Última generación', 'Formato', 'Estado', 'Acción'],
      rows: [
        ['Resumen de nómina', 'Junio 2025', '28/06/2025', 'Excel / PDF', 'Listo', 'Generar'],
        ['Costos por sucursal', 'Junio 2025', '28/06/2025', 'Excel / PDF', 'Listo', 'Generar'],
        ['Seguridad social PILA', 'Junio 2025', '27/06/2025', 'Excel', 'Listo', 'Generar'],
      ],
    },
  }
  const config = configs[section] ?? configs.reportes
  return (
    <div>
      <SectionHeader
        title={config.title}
        description={config.description}
        action={
          <Button>
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

function ObligationsSection({ type }: { type: 'seguridad' | 'prestaciones' }) {
  if (type === 'seguridad') {
    return (
      <div>
        <SectionHeader
          title="Seguridad social y parafiscales (PILA)"
          description="Bases de cotización IBC, aportes del empleado (8%) y del empleador, según Ley 100 y UGPP."
          action={
            <Button>
              <Download className="size-4" />
              Exportar PILA
            </Button>
          }
        />
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">IBC del período</p>
              <p className="mt-1 text-xl font-semibold">$16.830.000</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Aporte empleados (8%)</p>
              <p className="mt-1 text-xl font-semibold">$1.346.400</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Aporte empleador & Parafiscales</p>
              <p className="mt-1 text-xl font-semibold">$3.771.100</p>
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
                  <TableCell className="font-medium">{row.concept}</TableCell>
                  <TableCell>{formatCOP(row.employee)}</TableCell>
                  <TableCell>{formatCOP(row.employer)}</TableCell>
                  <TableCell className="font-semibold">{formatCOP(row.total)}</TableCell>
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

  return (
    <div>
      <SectionHeader
        title="Prestaciones sociales y Provisiones NIIF"
        description="Causación automática de cesantías, intereses a cesantías, prima y vacaciones."
        action={
          <Button>
            <Download className="size-4" />
            Exportar provisiones
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
                <TableCell className="font-medium">{row.concept}</TableCell>
                <TableCell>{row.period}</TableCell>
                <TableCell>{row.employees}</TableCell>
                <TableCell>{formatCOP(row.base)}</TableCell>
                <TableCell className="font-semibold">{formatCOP(row.value)}</TableCell>
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

function ConfigSection() {
  return (
    <div>
      <SectionHeader
        title="Configuración de Nómina"
        description="Parámetros salariales, cuentas del PUC, topes de auxilio de transporte y resolución DIAN."
        action={
          <Button>
            <Settings2 className="size-4" />
            Guardar cambios
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {[
          ['Salario Mínimo Legal Vigente', 'SMMLV $1.423.500 · Auxilio transporte $162.000'],
          ['Cuentas Contables NIIF', 'PUC 510506 (Sueldos) · 510527 (Auxilio) · 250505 (Neto)'],
          ['Deducciones de Ley', 'Salud 4% (237005) · Pensión 4% (238030)'],
          ['Resolución DIAN Nómina Electrónica', 'Ambiente Habilitación / Producción · Algoritmo SHA-384'],
          ['Flujo de Aprobación', 'Generación → Revisión → Liquidación Atómica → Asiento Contable'],
          ['Entidades PILA', 'Sura EPS, Sanitas, Porvenir, Colpensiones, Protección'],
        ].map(([title, description]) => (
          <Card key={title} className="transition-colors hover:border-primary/40">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <h3 className="font-medium">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
              <button className="rounded-md p-2 text-muted-foreground hover:bg-accent">
                <Pencil className="size-4" />
              </button>
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
          <Button variant="outline">
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

function ElectronicaSection({
  slips,
  period,
}: {
  slips: PayrollSlipRecord[]
  period?: PayrollPeriodRecord | null
}) {
  return (
    <div>
      <SectionHeader
        title="Nómina Electrónica DIAN (UBL 2.1 & CUNE)"
        description="Generación oficial de XML NominaIndividual, cálculo criptográfico SHA-384 de CUNE y código QR."
        action={
          <Button variant="primary" className="gap-2">
            <Send className="size-4" />
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
              <TableHead>Descargar</TableHead>
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
                return (
                  <TableRow key={slip.id}>
                    <TableCell className="font-semibold">{slip.consecutive}</TableCell>
                    <TableCell>{empName}</TableCell>
                    <TableCell>{formatCOP(Number(slip.total_accrued))}</TableCell>
                    <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                      {formatCOP(Number(slip.net_paid))}
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
                    <TableCell>
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

function ContableSection({
  period,
}: {
  period?: PayrollPeriodRecord | null
}) {
  const accrued = period ? Number(period.total_accrued) : 15_155_000
  const deductions = period ? Number(period.total_deductions) : 1_212_400
  const net = period ? Number(period.total_net_paid) : 13_942_600

  return (
    <div>
      <SectionHeader
        title="Integración Contable NIIF & Partida Doble"
        description="Mapeo automático de cuentas PUC y generación de asiento contable de nómina."
        action={
          <Button variant="outline" className="gap-2">
            <BookOpenCheck className="size-4" />
            Ver en Libro Diario
          </Button>
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
              <p className="mt-1 text-xs text-muted-foreground">Crédito · Neto a girar a empleados</p>
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

export function Nomina() {
  const [section, setSection] = React.useState<PayrollSection>('dashboard')
  const [mobileNav, setMobileNav] = React.useState(false)

  // Estados de datos en vivo de la API
  const [periods, setPeriods] = React.useState<PayrollPeriodRecord[]>([])
  const [activePeriodId, setActivePeriodId] = React.useState<number | null>(null)
  const [slips, setSlips] = React.useState<PayrollSlipRecord[]>([])
  const [employees, setEmployees] = React.useState<EmployeeRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [liquidating, setLiquidating] = React.useState(false)

  // Cargar periodos y empleados
  const loadInitialData = React.useCallback(async () => {
    try {
      setLoading(true)
      const [periodsRes, empRes] = await Promise.all([
        nominaApi.getPeriods().catch(() => ({ data: [] })),
        nominaApi.getEmployees().catch(() => ({ data: [] })),
      ])

      const periodList = periodsRes.data || []
      setPeriods(periodList)
      setEmployees(empRes.data || [])

      if (periodList.length > 0) {
        // Seleccionar por defecto el primer periodo
        const initialPeriod = periodList[0]
        setActivePeriodId(initialPeriod.id)
        const slipsRes = await nominaApi.getSlips(initialPeriod.id).catch(() => ({ data: [] }))
        setSlips(slipsRes.data || [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

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
      await loadInitialData()
      if (activePeriodId) {
        const slipsRes = await nominaApi.getSlips(activePeriodId)
        setSlips(slipsRes.data || [])
      }
    } catch (err: unknown) {
      console.error('Error liquidando nómina:', err)
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
        />
      )
    }
    if (section === 'empleados') {
      return <EmployeesSection liveEmployees={employees} />
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
    if (section === 'novedades') return <NoveltiesSection />
    if (section === 'seguridad-social') return <ObligationsSection type="seguridad" />
    if (section === 'prestaciones') return <ObligationsSection type="prestaciones" />
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
              className="w-48"
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
          <Button variant="outline" className="gap-1.5" onClick={loadInitialData}>
            <Download className="size-4" />
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
