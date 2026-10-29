'use client'

import * as React from 'react'
import {
  Plus,
  Download,
  RefreshCw,
  Search,
  FileText,
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  CircleDollarSign,
  Eye,
  Printer,
  Send,
  Ban,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  FileX,
} from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Input, Select, Label } from '@/components/jeralpos/input'
import { Badge } from '@/components/jeralpos/badge'
import { Modal } from '@/components/jeralpos/modal'
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
  invoices as seedInvoices,
  computeTotals,
  formatCurrency,
  getSummary,
  statusLabel,
  statusVariant,
  dianStatusLabel,
  dianStatusVariant,
  type Invoice,
  type InvoiceStatus,
} from './mock-data'
import { InvoiceDetail } from './invoice-detail'
import { InvoicePdf } from './invoice-pdf'

type SortKey = 'number' | 'date' | 'customer' | 'total'
type SortDir = 'asc' | 'desc'
type ToastKind = 'success' | 'error'
const PAGE_SIZE = 6

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
  invoice,
  onView,
  onPreview,
  onSend,
  onVoid,
}: {
  invoice: Invoice
  onView: () => void
  onPreview: () => void
  onSend: () => void
  onVoid: () => void
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

  const canSend =
    invoice.electronic.dianStatus === 'no_enviado' || invoice.electronic.dianStatus === 'rechazado'
  const canVoid = invoice.status !== 'anulada'

  return (
    <div className="relative flex justify-end" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Acciones para ${invoice.number}`}
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-4"
      >
        <MoreHorizontal />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-border bg-card p-1 shadow-lg animate-in fade-in zoom-in-95 duration-100"
        >
          <button role="menuitem" className={item} onClick={act(onView)}>
            <Eye />
            Ver detalle
          </button>
          <button role="menuitem" className={item} onClick={act(onPreview)}>
            <Printer />
            Ver PDF
          </button>
          <button
            role="menuitem"
            className={cn(item, !canSend && 'pointer-events-none opacity-40')}
            onClick={act(onSend)}
          >
            <Send />
            Enviar
          </button>
          <div className="my-1 h-px bg-border" />
          <button
            role="menuitem"
            className={cn(
              'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-danger transition-colors hover:bg-danger-muted [&_svg]:size-4',
              !canVoid && 'pointer-events-none opacity-40',
            )}
            onClick={act(onVoid)}
          >
            <Ban />
            Anular
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
          {Array.from({ length: 9 }).map((_, i) => (
            <TableHead key={i}>
              <span className="sr-only">Cargando</span>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 6 }).map((_, r) => (
          <TableRow key={r}>
            {Array.from({ length: 9 }).map((_, c) => (
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

export function Facturacion() {
  const [items, setItems] = React.useState<Invoice[]>(seedInvoices)
  const [loading, setLoading] = React.useState(true)

  const [query, setQuery] = React.useState('')
  const [customerQuery, setCustomerQuery] = React.useState('')
  const [documentQuery, setDocumentQuery] = React.useState('')
  const [dateFrom, setDateFrom] = React.useState('')
  const [dateTo, setDateTo] = React.useState('')
  const [status, setStatus] = React.useState<InvoiceStatus | 'all'>('all')

  const [sortKey, setSortKey] = React.useState<SortKey>('date')
  const [sortDir, setSortDir] = React.useState<SortDir>('desc')
  const [page, setPage] = React.useState(1)

  const [detail, setDetail] = React.useState<Invoice | null>(null)
  const [pdf, setPdf] = React.useState<Invoice | null>(null)
  const [toVoid, setToVoid] = React.useState<Invoice | null>(null)
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

  const indicators: Indicator[] = React.useMemo(
    () => [
      {
        id: 'today',
        icon: CalendarDays,
        label: 'Facturas del día',
        value: String(summary.today),
        description: 'Emitidas hoy',
        tone: 'primary',
        trend: 'up',
        comparison: '+3',
      },
      {
        id: 'month',
        icon: FileText,
        label: 'Facturas del mes',
        value: String(summary.month),
        description: 'Septiembre 2026',
        tone: 'primary',
        trend: 'up',
        comparison: '+12%',
      },
      {
        id: 'accepted',
        icon: CheckCircle2,
        label: 'Aceptadas',
        value: String(summary.accepted),
        description: 'Validadas por la DIAN',
        tone: 'success',
        trend: 'up',
        comparison: '+5',
      },
      {
        id: 'pending',
        icon: Clock,
        label: 'Pendientes',
        value: String(summary.pending),
        description: 'Por enviar o en proceso',
        tone: 'warning',
        trend: 'flat',
        comparison: 'Sin cambios',
      },
      {
        id: 'rejected',
        icon: XCircle,
        label: 'Rechazadas',
        value: String(summary.rejected),
        description: 'Requieren corrección',
        tone: 'danger',
        trend: 'down',
        comparison: '-1',
      },
      {
        id: 'billed',
        icon: CircleDollarSign,
        label: 'Valor facturado',
        value: formatCurrency(summary.billed),
        description: 'Total del mes',
        tone: 'success',
        trend: 'up',
        comparison: '+8.4%',
      },
    ],
    [summary],
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const cq = customerQuery.trim().toLowerCase()
    const dq = documentQuery.replace(/[.\s-]/g, '').toLowerCase()
    const result = items.filter((inv) => {
      if (q && !inv.number.toLowerCase().includes(q)) return false
      if (cq && !inv.customer.name.toLowerCase().includes(cq)) return false
      if (dq && !inv.customer.document.replace(/[.\s-]/g, '').toLowerCase().includes(dq))
        return false
      if (dateFrom && inv.date < dateFrom) return false
      if (dateTo && inv.date > dateTo) return false
      if (status !== 'all' && inv.status !== status) return false
      return true
    })

    const sorted = [...result].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'number') cmp = a.number.localeCompare(b.number)
      else if (sortKey === 'date') cmp = (a.date + a.time).localeCompare(b.date + b.time)
      else if (sortKey === 'customer') cmp = a.customer.name.localeCompare(b.customer.name)
      else if (sortKey === 'total') cmp = computeTotals(a.items).total - computeTotals(b.items).total
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [items, query, customerQuery, documentQuery, dateFrom, dateTo, status, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  React.useEffect(() => {
    setPage(1)
  }, [query, customerQuery, documentQuery, dateFrom, dateTo, status])

  const hasFilters =
    query !== '' ||
    customerQuery !== '' ||
    documentQuery !== '' ||
    dateFrom !== '' ||
    dateTo !== '' ||
    status !== 'all'

  const clearFilters = () => {
    setQuery('')
    setCustomerQuery('')
    setDocumentQuery('')
    setDateFrom('')
    setDateTo('')
    setStatus('all')
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'date' || key === 'total' ? 'desc' : 'asc')
    }
  }

  const handleSend = (inv: Invoice) => {
    setItems((prev) =>
      prev.map((x) =>
        x.id === inv.id
          ? {
              ...x,
              status: 'enviada',
              electronic: {
                ...x.electronic,
                dianStatus: 'en_proceso',
                sentAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
                message: 'Documento en validación por la DIAN.',
                cufe:
                  x.electronic.cufe ??
                  Array.from({ length: 64 })
                    .map(() => Math.floor(Math.random() * 16).toString(16))
                    .join(''),
              },
            }
          : x,
      ),
    )
    setDetail((d) => (d && d.id === inv.id ? { ...d, status: 'enviada' } : d))
    showToast(`Factura ${inv.number} enviada a la DIAN`)
  }

  const handleVoid = () => {
    if (!toVoid) return
    setItems((prev) =>
      prev.map((x) => (x.id === toVoid.id ? { ...x, status: 'anulada' } : x)),
    )
    showToast(`Factura ${toVoid.number} anulada`)
    setToVoid(null)
    setDetail(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Facturación</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulta y administra tus documentos de venta.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="md" onClick={() => showToast('Exportando facturas...')}>
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
          <Button
            variant="primary"
            size="md"
            onClick={() => showToast('Abriendo generador de facturas...')}
          >
            <Plus />
            Nueva factura
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {indicators.map((ind) => (
          <IndicatorCard key={ind.id} indicator={ind} />
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <Label htmlFor="f-number">Número</Label>
            <Input
              id="f-number"
              leadingIcon={<Search />}
              placeholder="FE-1042"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
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
            <Label htmlFor="f-from">Fecha inicial</Label>
            <Input
              id="f-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="f-to">Fecha final</Label>
            <Input
              id="f-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="f-status">Estado</Label>
            <Select
              id="f-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus | 'all')}
            >
              <option value="all">Todos los estados</option>
              {(Object.keys(statusLabel) as InvoiceStatus[]).map((s) => (
                <option key={s} value={s}>
                  {statusLabel[s]}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {hasFilters && (
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <XCircle />
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filtered.length} {filtered.length === 1 ? 'factura' : 'facturas'}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton
                  label="Número"
                  active={sortKey === 'number'}
                  dir={sortDir}
                  onClick={() => toggleSort('number')}
                />
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <SortButton
                  label="Fecha"
                  active={sortKey === 'date'}
                  dir={sortDir}
                  onClick={() => toggleSort('date')}
                />
              </TableHead>
              <TableHead>
                <SortButton
                  label="Cliente"
                  active={sortKey === 'customer'}
                  dir={sortDir}
                  onClick={() => toggleSort('customer')}
                />
              </TableHead>
              <TableHead className="hidden lg:table-cell">Documento</TableHead>
              <TableHead className="hidden text-right lg:table-cell">Subtotal</TableHead>
              <TableHead className="hidden text-right xl:table-cell">Impuestos</TableHead>
              <TableHead className="text-right">
                <SortButton
                  label="Total"
                  active={sortKey === 'total'}
                  dir={sortDir}
                  onClick={() => toggleSort('total')}
                  className="justify-end"
                />
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden text-right md:table-cell">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((inv) => {
              const totals = computeTotals(inv.items)
              return (
                <TableRow key={inv.id}>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setDetail(inv)}
                      className="font-mono text-sm font-medium text-primary underline-offset-2 hover:underline"
                    >
                      {inv.number}
                    </button>
                    <p className="text-xs text-muted-foreground sm:hidden">{inv.date}</p>
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap tabular-nums text-muted-foreground sm:table-cell">
                    {inv.date}
                    <span className="block text-xs">{inv.time}</span>
                  </TableCell>
                  <TableCell>
                    <p className="truncate font-medium text-foreground">{inv.customer.name}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <Badge variant={dianStatusVariant[inv.electronic.dianStatus]} size="sm">
                        {dianStatusLabel[inv.electronic.dianStatus]}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground lg:table-cell">
                    {inv.customer.documentType} {inv.customer.document}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums text-muted-foreground lg:table-cell">
                    {formatCurrency(totals.subtotal)}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums text-muted-foreground xl:table-cell">
                    {formatCurrency(totals.tax)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold text-foreground">
                    {formatCurrency(totals.total)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[inv.status]} size="sm" dot>
                      {statusLabel[inv.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <RowActions
                      invoice={inv}
                      onView={() => setDetail(inv)}
                      onPreview={() => setPdf(inv)}
                      onSend={() => handleSend(inv)}
                      onVoid={() => setToVoid(inv)}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={9}>
                  <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                      <FileX className="size-6 text-muted-foreground" aria-hidden />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      No se encontraron facturas
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {hasFilters
                        ? 'Ajusta la búsqueda o los filtros aplicados.'
                        : 'Aún no hay documentos de venta registrados.'}
                    </p>
                    {hasFilters && (
                      <Button variant="outline" size="sm" onClick={clearFilters} className="mt-1">
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Mostrando{' '}
            <span className="font-medium text-foreground">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}
            </span>{' '}
            de <span className="font-medium text-foreground">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft />
              Anterior
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i + 1)}
                aria-current={currentPage === i + 1}
                className={cn(
                  'inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors',
                  currentPage === i + 1
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {i + 1}
              </button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} className="max-w-4xl">
        {detail && (
          <InvoiceDetail
            invoice={detail}
            onPreview={() => setPdf(detail)}
            onPrint={() => {
              setPdf(detail)
              showToast('Preparando impresión...')
            }}
            onDownload={() => showToast(`Descargando ${detail.number}.pdf`)}
            onSend={() => handleSend(detail)}
            onVoid={() => setToVoid(detail)}
          />
        )}
      </Modal>

      {/* PDF preview modal */}
      <Modal
        open={!!pdf}
        onClose={() => setPdf(null)}
        title="Previsualización de factura"
        description={pdf ? `Representación gráfica de ${pdf.number}` : undefined}
        className="max-w-4xl"
        footer={
          pdf ? (
            <>
              <Button variant="outline" onClick={() => setPdf(null)}>
                Cerrar
              </Button>
              <Button variant="outline" onClick={() => showToast('Preparando impresión...')}>
                <Printer />
                Imprimir
              </Button>
              <Button variant="primary" onClick={() => showToast(`Descargando ${pdf.number}.pdf`)}>
                <Download />
                Descargar PDF
              </Button>
            </>
          ) : undefined
        }
      >
        {pdf && <InvoicePdf invoice={pdf} />}
      </Modal>

      {/* Void confirmation */}
      <Modal
        open={!!toVoid}
        onClose={() => setToVoid(null)}
        title="Anular factura"
        description={
          toVoid
            ? `¿Seguro que deseas anular la factura "${toVoid.number}"? Esta acción generará una nota crédito y no se puede deshacer.`
            : undefined
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setToVoid(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleVoid}>
              <Ban />
              Anular factura
            </Button>
          </>
        }
      />

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-lg animate-in fade-in slide-in-from-bottom-2"
        >
          {toast.kind === 'success' ? (
            <CheckCircle2 className="size-4 text-success" aria-hidden />
          ) : (
            <XCircle className="size-4 text-danger" aria-hidden />
          )}
          {toast.msg}
        </div>
      )}
    </div>
  )
}
