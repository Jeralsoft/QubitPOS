'use client'

import * as React from 'react'
import {
  Phone,
  Smartphone,
  Mail,
  MapPin,
  Cake,
  Briefcase,
  Building,
  CalendarClock,
  ShoppingBag,
  DollarSign,
  Wallet,
  Activity as ActivityIcon,
  Pencil,
  FileText,
  User,
  ShieldCheck,
  ShoppingCart,
  LogIn,
  LogOut,
  RotateCcw,
  PackageCheck,
  CircleCheck,
  CircleX,
} from 'lucide-react'
import { Badge } from '@/components/jeralpos/badge'
import { Button } from '@/components/jeralpos/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/jeralpos/table'
import { cn } from '@/lib/utils'
import {
  employeeInitials,
  formatCurrency,
  getEmployeeActivity,
  getEmployeeSales,
  getEmployeeCashSessions,
  getEmployeeAudit,
  statusLabel,
  statusVariant,
  type Employee,
  type ActivityEntry,
  type ActivityType,
  type SaleEntry,
  type CashSession,
  type AuditEntry,
} from './mock-data'

const tabs = ['Información', 'Actividad', 'Ventas', 'Caja', 'Auditoría'] as const
type Tab = (typeof tabs)[number]

const activityIcon: Record<ActivityType, React.ReactNode> = {
  venta: <ShoppingCart />,
  apertura_caja: <Wallet />,
  cierre_caja: <Wallet />,
  ingreso: <LogIn />,
  ajuste: <PackageCheck />,
  devolucion: <RotateCcw />,
  sesion: <LogOut />,
}

const activityTone: Record<ActivityType, string> = {
  venta: 'bg-info-muted text-primary',
  apertura_caja: 'bg-success-muted text-success',
  cierre_caja: 'bg-warning-muted text-warning',
  ingreso: 'bg-muted text-muted-foreground',
  ajuste: 'bg-info-muted text-primary',
  devolucion: 'bg-danger-muted text-danger',
  sesion: 'bg-muted text-muted-foreground',
}

const saleStatusVariant: Record<SaleEntry['status'], 'success' | 'danger' | 'warning'> = {
  completada: 'success',
  anulada: 'danger',
  pendiente: 'warning',
}

const saleStatusLabel: Record<SaleEntry['status'], string> = {
  completada: 'Completada',
  anulada: 'Anulada',
  pendiente: 'Pendiente',
}

const cashStatusVariant: Record<
  CashSession['status'],
  'success' | 'warning' | 'danger' | 'primary'
> = {
  cuadrada: 'success',
  sobrante: 'primary',
  faltante: 'danger',
  abierta: 'warning',
}

const cashStatusLabel: Record<CashSession['status'], string> = {
  cuadrada: 'Cuadrada',
  sobrante: 'Sobrante',
  faltante: 'Faltante',
  abierta: 'Abierta',
}

function Stat({
  icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone?: 'default' | 'danger' | 'success' | 'primary'
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground [&_svg]:size-4">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p
        className={cn(
          'mt-2 text-lg font-bold tracking-tight tabular-nums',
          tone === 'danger' && 'text-danger',
          tone === 'success' && 'text-success',
          tone === 'primary' && 'text-primary',
          tone === 'default' && 'text-foreground',
        )}
      >
        {value}
      </p>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="mt-0.5 text-muted-foreground [&_svg]:size-4">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value || '—'}</p>
      </div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
      <FileText className="size-6 text-muted-foreground" aria-hidden />
      <p className="text-sm font-medium text-foreground">Sin registros</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

function ActivityTimeline({ rows }: { rows: ActivityEntry[] }) {
  if (rows.length === 0) return <EmptyState label="No hay actividad registrada." />
  return (
    <ol className="relative flex flex-col">
      {rows.map((r, i) => (
        <li key={r.id} className="relative flex gap-4 pb-6 last:pb-0">
          {i < rows.length - 1 && (
            <span
              className="absolute left-[19px] top-10 h-[calc(100%-1.5rem)] w-px bg-border"
              aria-hidden
            />
          )}
          <span
            className={cn(
              'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full [&_svg]:size-4',
              activityTone[r.type],
            )}
            aria-hidden
          >
            {activityIcon[r.type]}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <p className="text-sm font-medium text-foreground">{r.title}</p>
              {r.amount !== undefined && (
                <span
                  className={cn(
                    'text-sm font-semibold tabular-nums',
                    r.amount < 0 ? 'text-danger' : 'text-foreground',
                  )}
                >
                  {formatCurrency(r.amount)}
                </span>
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">{r.detail}</p>
            <p className="text-xs tabular-nums text-muted-foreground">
              {r.date} · {r.time}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}

function SalesTable({ rows }: { rows: SaleEntry[] }) {
  if (rows.length === 0) return <EmptyState label="Este empleado no ha registrado ventas." />
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Documento</TableHead>
          <TableHead className="hidden sm:table-cell">Cliente</TableHead>
          <TableHead className="hidden text-right md:table-cell">Ítems</TableHead>
          <TableHead className="hidden lg:table-cell">Método</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">
              {r.date}
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">{r.document}</TableCell>
            <TableCell className="hidden truncate sm:table-cell">{r.customer}</TableCell>
            <TableCell className="hidden text-right tabular-nums text-muted-foreground md:table-cell">
              {r.items}
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              <Badge variant="neutral" size="sm">
                {r.method}
              </Badge>
            </TableCell>
            <TableCell className="text-right tabular-nums font-medium text-foreground">
              {formatCurrency(r.total)}
            </TableCell>
            <TableCell>
              <Badge variant={saleStatusVariant[r.status]} size="sm" dot>
                {saleStatusLabel[r.status]}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function CashTable({ rows }: { rows: CashSession[] }) {
  if (rows.length === 0) return <EmptyState label="Este empleado no gestiona caja." />
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Caja</TableHead>
          <TableHead className="text-right">Base</TableHead>
          <TableHead className="hidden text-right sm:table-cell">Ventas</TableHead>
          <TableHead className="text-right">Cierre</TableHead>
          <TableHead className="hidden text-right md:table-cell">Diferencia</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">
              {r.date}
            </TableCell>
            <TableCell className="text-muted-foreground">{r.register}</TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {formatCurrency(r.opening)}
            </TableCell>
            <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
              {formatCurrency(r.sales)}
            </TableCell>
            <TableCell className="text-right tabular-nums font-medium text-foreground">
              {r.status === 'abierta' ? '—' : formatCurrency(r.closing)}
            </TableCell>
            <TableCell
              className={cn(
                'hidden text-right tabular-nums font-medium md:table-cell',
                r.difference < 0
                  ? 'text-danger'
                  : r.difference > 0
                    ? 'text-primary'
                    : 'text-muted-foreground',
              )}
            >
              {r.status === 'abierta' ? '—' : formatCurrency(r.difference)}
            </TableCell>
            <TableCell>
              <Badge variant={cashStatusVariant[r.status]} size="sm" dot>
                {cashStatusLabel[r.status]}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function AuditTable({ rows }: { rows: AuditEntry[] }) {
  if (rows.length === 0) return <EmptyState label="No hay eventos de auditoría." />
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Acción</TableHead>
          <TableHead className="hidden sm:table-cell">Módulo</TableHead>
          <TableHead className="hidden font-mono lg:table-cell">IP</TableHead>
          <TableHead>Resultado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">
              {r.date} {r.time}
            </TableCell>
            <TableCell className="font-medium text-foreground">{r.action}</TableCell>
            <TableCell className="hidden sm:table-cell">
              <Badge variant="neutral" size="sm">
                {r.module}
              </Badge>
            </TableCell>
            <TableCell className="hidden font-mono text-xs text-muted-foreground lg:table-cell">
              {r.ip}
            </TableCell>
            <TableCell>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 text-sm font-medium [&_svg]:size-4',
                  r.result === 'exitoso' ? 'text-success' : 'text-danger',
                )}
              >
                {r.result === 'exitoso' ? <CircleCheck /> : <CircleX />}
                {r.result === 'exitoso' ? 'Exitoso' : 'Fallido'}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function EmployeeProfile({ employee, onEdit }: { employee: Employee; onEdit: () => void }) {
  const [tab, setTab] = React.useState<Tab>('Información')
  const activity = React.useMemo(() => getEmployeeActivity(employee), [employee])
  const sales = React.useMemo(() => getEmployeeSales(employee), [employee])
  const cash = React.useMemo(() => getEmployeeCashSessions(employee), [employee])
  const audit = React.useMemo(() => getEmployeeAudit(employee), [employee])

  return (
    <div className="flex max-h-[80vh] flex-col">
      {/* Identity header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold text-white shadow-sm"
            style={{ backgroundColor: employee.color }}
            aria-hidden
          >
            {employeeInitials(employee)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold tracking-tight text-foreground">
                {employee.fullName}
              </h2>
              <Badge variant={statusVariant[employee.status]} size="sm" dot>
                {statusLabel[employee.status]}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {employee.role} · {employee.branch}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil />
          Editar
        </Button>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Secciones del empleado"
        className="mt-4 flex gap-1 overflow-x-auto border-b border-border"
      >
        {tabs.map((t) => {
          const active = t === tab
          return (
            <button
              key={t}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                '-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {t}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto pt-5">
        {/* Stats always visible on top */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            icon={<ShoppingBag />}
            label="Ventas realizadas"
            value={employee.salesCount.toLocaleString('es-CO')}
            tone="primary"
          />
          <Stat
            icon={<DollarSign />}
            label="Total vendido"
            value={formatCurrency(employee.salesTotal)}
            tone="success"
          />
          <Stat
            icon={<Wallet />}
            label="Aperturas de caja"
            value={employee.cashOpenings.toLocaleString('es-CO')}
          />
          <Stat
            icon={<ActivityIcon />}
            label="Última actividad"
            value={employee.lastActivity || '—'}
          />
        </div>

        <div className="pt-6">
          {tab === 'Información' && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">Datos personales</h3>
                <div className="mt-2 divide-y divide-border">
                  <InfoRow
                    icon={<User />}
                    label="Documento"
                    value={`${employee.documentType} ${employee.document}`}
                  />
                  <InfoRow icon={<Cake />} label="Fecha de nacimiento" value={employee.birthDate} />
                  <InfoRow icon={<Phone />} label="Teléfono" value={employee.phone} />
                  <InfoRow icon={<Smartphone />} label="Celular" value={employee.mobile} />
                  <InfoRow icon={<Mail />} label="Correo" value={employee.email} />
                  <InfoRow
                    icon={<MapPin />}
                    label="Dirección"
                    value={`${employee.address}, ${employee.city}`}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">Información laboral</h3>
                <div className="mt-2 divide-y divide-border">
                  <InfoRow icon={<Briefcase />} label="Cargo" value={employee.role} />
                  <InfoRow icon={<Building />} label="Sucursal" value={employee.branch} />
                  <InfoRow icon={<CalendarClock />} label="Fecha de ingreso" value={employee.hireDate} />
                  <InfoRow
                    icon={<ShieldCheck />}
                    label="Usuario del sistema"
                    value={employee.hasUser ? employee.username : 'Sin usuario asignado'}
                  />
                </div>
                {employee.notes && (
                  <div className="mt-4 rounded-lg bg-muted/50 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Observaciones</p>
                    <p className="mt-1 text-sm text-foreground">{employee.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {tab === 'Actividad' && <ActivityTimeline rows={activity} />}
          {tab === 'Ventas' && <SalesTable rows={sales} />}
          {tab === 'Caja' && <CashTable rows={cash} />}
          {tab === 'Auditoría' && <AuditTable rows={audit} />}
        </div>
      </div>
    </div>
  )
}
