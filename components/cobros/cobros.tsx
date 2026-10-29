'use client'

import * as React from 'react'
import {
  Download,
  RefreshCw,
  Search,
  Wallet,
  CalendarClock,
  AlertTriangle,
  CircleDollarSign,
  TrendingUp,
  XCircle,
  Eye,
  FileText,
  History,
  Printer,
  Send,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  FileX,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Input, Select, Label } from '@/components/jeralpos/input'
import { Badge } from '@/components/jeralpos/badge'
import { IndicatorCard } from '@/components/dashboard/indicator-card'
import type { Indicator } from '@/components/dashboard/mock-data'
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
  receivables as seedReceivables,
  computeAging,
  getSummary,
  formatCurrency,
  balance,
  paidAmount,
  statusOf,
  statusLabel,
  statusVariant,
  daysOverdue,
  customerCartera,
  type Receivable,
  type ReceivableStatus,
} from './mock-data'
import { AgingChart } from './aging-chart'
import { PaymentModal, type PaymentDraft } from './payment-modal'
import { CarteraProfile } from './cartera-profile'

type SortKey = 'customer' | 'invoice' | 'dueDate' | 'balance' | 'overdue'
type SortDir = 'asc' | 'desc'
type ToastKind = 'success' | 'error'
const PAGE_SIZE = 8

function SortButton({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string
  active: boolean
  dir: SortDir
  onClick: () => void
  className?: string
}) {
  const Icon = !active ? ChevronsUpDown : dir === 'asc' ? ChevronUp : ChevronDown
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-colors hover:text-foreground',
        active ? 'text-foreground' : 'text-muted-foreground',
        className,
      )}
    >
      {label}
      <Icon className="size-3.5" aria-hidden />
    </button>
  )
}

function RowActions({
  receivable,
  onPay,
  onProfile,
  onReminder,
  onReceipt,
}: {
  receivable: Receivable
  onPay: () => void
  onProfile: () => void
  onReminder: () => void
  onReceipt: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const onClick = (ev: MouseEvent) => {
      if (ref.current && !ref.current.contains(ev.target as Node)) setOpen(false)
    }
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const item =
    'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-accent [&_svg]:size-4 [&_svg]:text-muted-foreground'

  const act = (fn: () => void) => () => {
    setOpen(false)
    fn()
  }

  const st = statusOf(receivable)
  const canPay = st !== 'pagada' && st !== 'anulada'

  return (
    <div className="relative flex justify-end" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Acciones para ${receivable.invoice}`}
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-4"
      >
        <MoreHorizontal />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 z-20 w-48 rounded-lg border border-border bg-card p-1 shadow-lg animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            role="menuitem"
            className={cn(item, !canPay && 'pointer-events-none opacity-40')}
            onClick={act(onPay)}
          >
            <CircleDollarSign />
            Registrar pago
          </button>
          <button role="menuitem" className={item} onClick={act(onProfile)}>
            <FileText />
            Ver factura
          </button>
          <button role="menuitem" className={item} onClick={act(onProfile)}>
            <History />
            Historial
          </button>
          <button role="menuitem" className={item} onClick={act(onReceipt)}>
            <Printer />
            Imprimir recibo
          </button>
          <div className="my-1 h-px bg-border" />
          <button role="menuitem" className={item} onClick={act(onReminder)}>
            <Send />
            Enviar recordatorio
          </button>
        </div>
      )}
    </div>
  )
}

function TableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({ length: 8 }).map((_, i) => (
            <TableHead key={i}>
              <span className="sr-only">Cargando</span>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 8 }).map((_, r) => (
          <TableRow key={r}>
            {Array.from({ length: 8 }).map((_, c) => (
              <TableCell key={c}>
                <div className="h-4 w-full max-w-[110px] animate-pulse rounded bg-muted" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function Cobros() {
  const [items, setItems] = React.useState<Receivable[]>(seedReceivables)
  const [loading, setLoading] = React.useState(true)

  const [customerQuery, setCustomerQuery] = React.useState('')
  const [invoiceQuery, setInvoiceQuery] = React.useState('')
  const [documentQuery, setDocumentQuery] = React.useState('')
  const [status, setStatus] = React.useState<ReceivableStatus | 'all'>('all')
  const [dueFrom, setDueFrom] = React.useState('')
  const [dueTo, setDueTo] = React.useState('')
  const [onlyOverdue, setOnlyOverdue] = React.useState(false)

  const [sortKey, setSortKey] = React.useState<SortKey>('overdue')
  const [sortDir, setSortDir] = React.useState<SortDir>('desc')
  const [page, setPage] = React.useState(1)

  const [payTarget, setPayTarget] = React.useState<Receivable | null>(null)
  const [profileCustomerId, setProfileCustomerId] = React.useState<string | null>(null)
  const [toast, setToast] = React.useState<{ msg: string; kind: ToastKind } | null>(null)

  React.useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 700)
    return () => window.clearTimeout(t)
  }, [])

  const showToast = React.useCallback((msg: string, kind: ToastKind = 'success') => {
    setToast({ msg, kind })
    window.setTimeout(() => setToast(null), 2800)
  }, [])

  const summary = React.useMemo(() => getSummary(items), [items])
  const aging = React.useMemo(() => computeAging(items), [items])

  const indicators: Indicator[] = React.useMemo(
    () => [
      {
        id: 'total',
        icon: Wallet,
        label: 'Cartera total',
        value: formatCurrency(summary.total),
        description: 'Saldo pendiente total',
        tone: 'primary',
        trend: 'flat',
        comparison: 'Por cobrar',
      },
      {
        id: 'porvencer',
        icon: CalendarClock,
        label: 'Por vencer',
        value: formatCurrency(summary.porVencer),
        description: 'Dentro del plazo',
        tone: 'success',
        trend: 'flat',
        comparison: 'Al día',
      },
      {
        id: 'vencida',
        icon: AlertTriangle,
        label: 'Vencida',
        value: formatCurrency(summary.vencida),
        description: 'Requiere gestión',
        tone: 'danger',
        trend: 'up',
        comparison: 'Priorizar',
      },
      {
        id: 'hoy',
        icon: CircleDollarSign,
        label: 'Cobrado hoy',
        value: formatCurrency(summary.cobradoHoy),
        description: '22 de septiembre',
        tone: 'success',
        trend: 'up',
        comparison: 'Hoy',
      },
      {
        id: 'mes',
        icon: TrendingUp,
        label: 'Cobrado este mes',
        value: formatCurrency(summary.cobradoMes),
        description: 'Septiembre 2026',
        tone: 'success',
        trend: 'up',
        comparison: '+6.2%',
      },
    ],
    [summary],
  )

  const filtered = React.useMemo(() => {
    const cq = customerQuery.trim().toLowerCase()
    const iq = invoiceQuery.trim().toLowerCase()
    const dq = documentQuery.replace(/[.\s-]/g, '').toLowerCase()
    const result = items.filter((r) => {
      if (cq && !r.customerName.toLowerCase().includes(cq)) return false
      if (iq && !r.invoice.toLowerCase().includes(iq)) return false
      if (dq && !r.document.replace(/[.\s-]/g, '').toLowerCase().includes(dq)) return false
      if (status !== 'all' && statusOf(r) !== status) return false
      if (dueFrom && r.dueDate < dueFrom) return false
      if (dueTo && r.dueDate > dueTo) return false
      if (onlyOverdue && !(balance(r) > 0 && daysOverdue(r) > 0 && !r.voided)) return false
      return true
    })

    const sorted = [...result].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'customer') cmp = a.customerName.localeCompare(b.customerName)
      else if (sortKey === 'invoice') cmp = a.invoice.localeCompare(b.invoice)
      else if (sortKey === 'dueDate') cmp = a.dueDate.localeCompare(b.dueDate)
      else if (sortKey === 'balance') cmp = balance(a) - balance(b)
      else if (sortKey === 'overdue') cmp = daysOverdue(a) - daysOverdue(b)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [
    items,
    customerQuery,
    invoiceQuery,
    documentQuery,
    status,
    dueFrom,
    dueTo,
    onlyOverdue,
    sortKey,
    sortDir,
  ])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  React.useEffect(() => {
    setPage(1)
  }, [customerQuery, invoiceQuery, documentQuery, status, dueFrom, dueTo, onlyOverdue])

  const hasFilters =
    customerQuery !== '' ||
    invoiceQuery !== '' ||
    documentQuery !== '' ||
    status !== 'all' ||
    dueFrom !== '' ||
    dueTo !== '' ||
    onlyOverdue

  const clearFilters = () => {
    setCustomerQuery('')
    setInvoiceQuery('')
    setDocumentQuery('')
    setStatus('all')
    setDueFrom('')
    setDueTo('')
    setOnlyOverdue(false)
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'dueDate' || key === 'customer' || key === 'invoice' ? 'asc' : 'desc')
    }
  }

  const handleRegisterPayment = (draft: PaymentDraft) => {
    if (!payTarget) return
    const invoice = payTarget.invoice
    setItems((prev) =>
      prev.map((r) =>
        r.id === payTarget.id
          ? {
              ...r,
              payments: [
                ...r.payments,
                {
                  id: `p-${Date.now()}`,
                  date: draft.date,
                  method: draft.method,
                  amount: draft.amount,
                  reference: draft.reference,
                  notes: draft.notes,
                  receivedBy: draft.receivedBy,
                },
              ],
            }
          : r,
      ),
    )
    setPayTarget(null)
    showToast(`Cobro de ${formatCurrency(draft.amount)} registrado en ${invoice}`)
  }

  const cartera = React.useMemo(
    () => (profileCustomerId ? customerCartera(items, profileCustomerId) : null),
    [items, profileCustomerId],
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Cobros y Cartera
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Controla los saldos pendientes y gestiona tus cobros.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="md" onClick={() => showToast('Exportando cartera...')}>
            <Download />
            Exportar
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setLoading(true)
              window.setTimeout(() => {
                setLoading(false)
                showToast('Datos actualizados')
              }, 650)
            }}
          >
            <RefreshCw />
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {indicators.map((ind) => (
          <IndicatorCard key={ind.id} indicator={ind} />
        ))}
      </div>

      {/* Aging chart */}
      <AgingChart buckets={aging} />

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <Label htmlFor="f-customer">Cliente</Label>
            <Input
              id="f-customer"
              leadingIcon={<Search />}
              placeholder="Nombre o razón social"
              value={customerQuery}
              onChange={(e) => setCustomerQuery(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="f-invoice">Factura</Label>
            <Input
              id="f-invoice"
              leadingIcon={<Search />}
              placeholder="FE-1042"
              value={invoiceQuery}
              onChange={(e) => setInvoiceQuery(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="f-document">Documento</Label>
            <Input
              id="f-document"
              leadingIcon={<Search />}
              placeholder="NIT o cédula"
              value={documentQuery}
              onChange={(e) => setDocumentQuery(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="f-status">Estado</Label>
            <Select
              id="f-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ReceivableStatus | 'all')}
            >
              <option value="all">Todos los estados</option>
              {(Object.keys(statusLabel) as ReceivableStatus[]).map((s) => (
                <option key={s} value={s}>
                  {statusLabel[s]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="f-from">Vence desde</Label>
            <Input
              id="f-from"
              type="date"
              value={dueFrom}
              onChange={(e) => setDueFrom(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="f-to">Vence hasta</Label>
            <Input
              id="f-to"
              type="date"
              value={dueTo}
              onChange={(e) => setDueTo(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={onlyOverdue}
              onChange={(e) => setOnlyOverdue(e.target.checked)}
              className="size-4 rounded border-border text-primary accent-primary"
            />
            Solo vencidas
          </label>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <XCircle />
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filtered.length} {filtered.length === 1 ? 'cuenta por cobrar' : 'cuentas por cobrar'}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <FileX className="size-6 text-muted-foreground" aria-hidden />
          </div>
          <div>
            <p className="font-medium text-foreground">Sin cuentas por cobrar</p>
            <p className="text-sm text-muted-foreground">
              Ajusta los filtros para ver otros resultados.
            </p>
          </div>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton
                  label="Cliente"
                  active={sortKey === 'customer'}
                  dir={sortDir}
                  onClick={() => toggleSort('customer')}
                />
              </TableHead>
              <TableHead className="hidden lg:table-cell">Documento</TableHead>
              <TableHead>
                <SortButton
                  label="Factura"
                  active={sortKey === 'invoice'}
                  dir={sortDir}
                  onClick={() => toggleSort('invoice')}
                />
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <SortButton
                  label="Vence"
                  active={sortKey === 'dueDate'}
                  dir={sortDir}
                  onClick={() => toggleSort('dueDate')}
                />
              </TableHead>
              <TableHead className="hidden text-right xl:table-cell">Total</TableHead>
              <TableHead className="hidden text-right xl:table-cell">Pagado</TableHead>
              <TableHead className="text-right">
                <SortButton
                  label="Saldo"
                  active={sortKey === 'balance'}
                  dir={sortDir}
                  onClick={() => toggleSort('balance')}
                  className="justify-end"
                />
              </TableHead>
              <TableHead className="hidden text-center md:table-cell">
                <SortButton
                  label="Días"
                  active={sortKey === 'overdue'}
                  dir={sortDir}
                  onClick={() => toggleSort('overdue')}
                  className="justify-center"
                />
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden text-right md:table-cell">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((r) => {
              const st = statusOf(r)
              const bal = balance(r)
              const od = daysOverdue(r)
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setProfileCustomerId(r.customerId)}
                      className="text-left font-medium text-foreground underline-offset-2 hover:text-primary hover:underline"
                    >
                      {r.customerName}
                    </button>
                    <p className="text-xs text-muted-foreground md:hidden">Vence {r.dueDate}</p>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground lg:table-cell">
                    {r.documentType} {r.document}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-foreground">{r.invoice}</TableCell>
                  <TableCell className="hidden whitespace-nowrap tabular-nums text-muted-foreground md:table-cell">
                    {r.dueDate}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums text-muted-foreground xl:table-cell">
                    {formatCurrency(r.total)}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums text-muted-foreground xl:table-cell">
                    {formatCurrency(paidAmount(r))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold text-foreground">
                    {formatCurrency(bal)}
                  </TableCell>
                  <TableCell className="hidden text-center tabular-nums md:table-cell">
                    {st === 'pagada' || st === 'anulada' ? (
                      <span className="text-muted-foreground">—</span>
                    ) : od > 0 ? (
                      <span className="font-medium text-danger">{od}</span>
                    ) : (
                      <span className="text-muted-foreground">{od}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[st]} size="sm">
                      {statusLabel[st]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-right md:table-cell">
                    <RowActions
                      receivable={r}
                      onPay={() => setPayTarget(r)}
                      onProfile={() => setProfileCustomerId(r.customerId)}
                      onReminder={() =>
                        showToast(`Recordatorio enviado a ${r.customerName}`)
                      }
                      onReceipt={() => showToast(`Imprimiendo recibo de ${r.invoice}...`)}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}

      {/* Payment modal */}
      {payTarget && (
        <PaymentModal
          receivable={payTarget}
          onClose={() => setPayTarget(null)}
          onSubmit={handleRegisterPayment}
        />
      )}

      {/* Cartera profile */}
      {cartera && (
        <CarteraProfile
          cartera={cartera}
          onClose={() => setProfileCustomerId(null)}
          onRegisterPayment={(r) => {
            setProfileCustomerId(null)
            setPayTarget(r)
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={cn(
            'fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-200',
            toast.kind === 'success'
              ? 'border-success/30 bg-success-muted text-success'
              : 'border-danger/30 bg-danger-muted text-danger',
          )}
        >
          {toast.kind === 'success' ? (
            <CheckCircle2 className="size-4" aria-hidden />
          ) : (
            <AlertTriangle className="size-4" aria-hidden />
          )}
          {toast.msg}
        </div>
      )}
    </div>
  )
}
