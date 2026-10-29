'use client'

import * as React from 'react'
import {
  Phone,
  Smartphone,
  Mail,
  MapPin,
  User,
  ShoppingBag,
  Wallet,
  CalendarClock,
  CreditCard,
  Pencil,
  FileText,
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
  supplierInitials,
  supplierTypeLabel,
  formatCurrency,
  getPayables,
  getSupplierHistory,
  payableStatusLabel,
  payableStatusVariant,
  statusLabel,
  statusVariant,
  type Supplier,
  type HistoryEntry,
  type Payable,
} from './mock-data'

const tabs = ['Resumen', 'Compras', 'Facturas', 'Cuentas por pagar', 'Pagos', 'Historial'] as const
type Tab = (typeof tabs)[number]

const historyStatusVariant: Record<
  HistoryEntry['status'],
  'success' | 'warning' | 'danger' | 'neutral' | 'primary'
> = {
  pagada: 'success',
  pendiente: 'warning',
  vencida: 'danger',
  anulada: 'neutral',
  aplicado: 'primary',
}

const historyStatusLabel: Record<HistoryEntry['status'], string> = {
  pagada: 'Pagada',
  pendiente: 'Pendiente',
  vencida: 'Vencida',
  anulada: 'Anulada',
  aplicado: 'Aplicado',
}

function FinanceStat({
  icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone?: 'default' | 'danger' | 'success'
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

function HistoryTable({ rows }: { rows: HistoryEntry[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
        <FileText className="size-6 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium text-foreground">Sin registros</p>
        <p className="text-sm text-muted-foreground">No hay documentos para mostrar.</p>
      </div>
    )
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Documento</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead className="text-right">Valor</TableHead>
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
            <TableCell>
              <Badge variant="neutral" size="sm">
                {r.type}
              </Badge>
            </TableCell>
            <TableCell
              className={cn(
                'text-right tabular-nums font-medium',
                r.amount < 0 ? 'text-danger' : 'text-foreground',
              )}
            >
              {formatCurrency(r.amount)}
            </TableCell>
            <TableCell>
              <Badge variant={historyStatusVariant[r.status]} size="sm" dot>
                {historyStatusLabel[r.status]}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function PayablesTable({ rows }: { rows: Payable[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
        <FileText className="size-6 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium text-foreground">Sin cuentas por pagar</p>
        <p className="text-sm text-muted-foreground">Este proveedor está al día.</p>
      </div>
    )
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Documento</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Vencimiento</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="hidden text-right sm:table-cell">Pagado</TableHead>
          <TableHead className="text-right">Saldo</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="font-mono text-xs text-muted-foreground">{r.document}</TableCell>
            <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">
              {r.date}
            </TableCell>
            <TableCell
              className={cn(
                'whitespace-nowrap tabular-nums',
                r.status === 'vencida' ? 'font-medium text-danger' : 'text-muted-foreground',
              )}
            >
              {r.dueDate}
            </TableCell>
            <TableCell className="text-right tabular-nums text-foreground">
              {formatCurrency(r.amount)}
            </TableCell>
            <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
              {formatCurrency(r.paid)}
            </TableCell>
            <TableCell
              className={cn(
                'text-right tabular-nums font-medium',
                r.balance > 0 ? 'text-danger' : 'text-foreground',
              )}
            >
              {formatCurrency(r.balance)}
            </TableCell>
            <TableCell>
              <Badge variant={payableStatusVariant[r.status]} size="sm" dot>
                {payableStatusLabel[r.status]}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function SupplierProfile({
  supplier,
  onEdit,
}: {
  supplier: Supplier
  onEdit: () => void
}) {
  const [tab, setTab] = React.useState<Tab>('Resumen')
  const history = React.useMemo(() => getSupplierHistory(supplier), [supplier])
  const payables = React.useMemo(() => getPayables(supplier), [supplier])

  const invoices = history.filter((h) => h.type === 'Factura' || h.type === 'Nota débito')
  const payments = history.filter((h) => h.type === 'Pago')
  const purchases = history.filter((h) => h.type === 'Compra' || h.type === 'Factura')

  const creditUsed =
    supplier.creditLimit > 0 ? Math.min(supplier.balance / supplier.creditLimit, 1) : 0

  return (
    <div className="flex max-h-[80vh] flex-col">
      {/* Identity header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold text-white shadow-sm"
            style={{ backgroundColor: supplier.color }}
            aria-hidden
          >
            {supplierInitials(supplier)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold tracking-tight text-foreground">
                {supplier.displayName}
              </h2>
              <Badge variant={statusVariant[supplier.status]} size="sm" dot>
                {statusLabel[supplier.status]}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {supplier.documentType} {supplier.document} · {supplierTypeLabel[supplier.type]}
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
        aria-label="Secciones del proveedor"
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
        {tab === 'Resumen' && (
          <div className="flex flex-col gap-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FinanceStat
                icon={<ShoppingBag />}
                label="Total compras"
                value={formatCurrency(supplier.totalPurchases)}
              />
              <FinanceStat
                icon={<CreditCard />}
                label="Total pagado"
                value={formatCurrency(supplier.totalPaid)}
                tone="success"
              />
              <FinanceStat
                icon={<Wallet />}
                label="Saldo pendiente"
                value={formatCurrency(supplier.balance)}
                tone={supplier.balance > 0 ? 'danger' : 'success'}
              />
              <FinanceStat
                icon={<CalendarClock />}
                label="Compra más reciente"
                value={supplier.lastPurchase}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">Datos de contacto</h3>
                <div className="mt-2 divide-y divide-border">
                  <InfoRow icon={<User />} label="Contacto principal" value={supplier.contactName} />
                  <InfoRow icon={<Phone />} label="Teléfono" value={supplier.phone} />
                  <InfoRow icon={<Smartphone />} label="Celular" value={supplier.mobile} />
                  <InfoRow icon={<Mail />} label="Correo" value={supplier.email} />
                  <InfoRow
                    icon={<MapPin />}
                    label="Dirección"
                    value={`${supplier.address}, ${supplier.city}, ${supplier.department}`}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">Condiciones comerciales</h3>
                <div className="mt-3 flex flex-col gap-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Condiciones de pago</span>
                    <span className="font-medium text-foreground">{supplier.paymentTerms}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cupo de crédito</span>
                    <span className="font-medium tabular-nums text-foreground">
                      {formatCurrency(supplier.creditLimit)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Días de crédito</span>
                    <span className="font-medium tabular-nums text-foreground">
                      {supplier.creditDays} días
                    </span>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Cupo utilizado</span>
                      <span className="font-medium tabular-nums text-foreground">
                        {Math.round(creditUsed * 100)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          creditUsed > 0.85
                            ? 'bg-danger'
                            : creditUsed > 0.6
                              ? 'bg-warning'
                              : 'bg-success',
                        )}
                        style={{ width: `${Math.max(creditUsed * 100, 2)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'Compras' && <HistoryTable rows={purchases} />}
        {tab === 'Facturas' && <HistoryTable rows={invoices} />}
        {tab === 'Cuentas por pagar' && (
          <div className="flex flex-col gap-5">
            <PayablesTable rows={payables} />
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CreditCard className="size-4 text-muted-foreground" aria-hidden />
                Saldo total por pagar
              </div>
              <span
                className={cn(
                  'text-lg font-bold tabular-nums',
                  supplier.balance > 0 ? 'text-danger' : 'text-success',
                )}
              >
                {formatCurrency(supplier.balance)}
              </span>
            </div>
          </div>
        )}
        {tab === 'Pagos' && <HistoryTable rows={payments} />}
        {tab === 'Historial' && <HistoryTable rows={history} />}
      </div>
    </div>
  )
}
