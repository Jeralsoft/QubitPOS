'use client'

import * as React from 'react'
import {
  Plus,
  Download,
  Upload,
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
  FileX,
  ShieldCheck,
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
  TableSkeleton,
} from '@/components/jeralpos/table'
import { SortButton } from '@/components/jeralpos/sort-button'
import { RowActionsMenu } from '@/components/jeralpos/row-actions'
import { Pagination } from '@/components/jeralpos/pagination'
import { DataToast } from '@/components/jeralpos/data-toast'
import { posApi, type SaleRecordData } from '@/lib/api'
import { toast as sonnerToast } from 'sonner'
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
  type InvoiceItem,
  type PaymentMethod,
} from './mock-data'
import { InvoiceDetail } from './invoice-detail'
import { InvoicePdf } from './invoice-pdf'

type SortKey = 'number' | 'date' | 'customer' | 'total'
type SortDir = 'asc' | 'desc'
type ToastKind = 'success' | 'error'
const PAGE_SIZE = 8

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
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  const [detail, setDetail] = React.useState<Invoice | null>(null)
  const [pdf, setPdf] = React.useState<Invoice | null>(null)
  const [toVoid, setToVoid] = React.useState<Invoice | null>(null)
  const [toast, setToast] = React.useState<{ msg: string; kind: ToastKind } | null>(null)

  const loadSales = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await posApi.getSales()
      if (res?.data && res.data.length > 0) {
        const mapped: Invoice[] = res.data.map((s: SaleRecordData) => {
          const mappedItems: InvoiceItem[] = (s.items || []).map((it) => ({
            id: String(it.id),
            code: `PROD-${it.productId}`,
            description: it.productName || 'Producto',
            quantity: Number(it.quantity) || 1,
            unitPrice: Number(it.unitPrice) || 0,
            discount: Number(it.discount) || 0,
            taxRate: (Number(it.taxRate) || 0) * 100,
          }))

          const rawDate = s.createdAt || new Date().toISOString()
          const date = rawDate.split('T')[0]
          const time = rawDate.includes('T') ? rawDate.split('T')[1].slice(0, 5) : '00:00'

          const methodUpper: PaymentMethod =
            s.paymentMethod?.toLowerCase() === 'tarjeta'
              ? 'Tarjeta'
              : s.paymentMethod?.toLowerCase() === 'transferencia'
              ? 'Transferencia'
              : s.paymentMethod?.toLowerCase() === 'credito' || s.paymentMethod?.toLowerCase() === 'crédito'
              ? 'Crédito'
              : 'Efectivo'

          return {
            id: String(s.id),
            number: s.invoiceNumber || `FE-${s.id}`,
            date,
            time,
            customer: {
              name: s.customer?.name || 'Consumidor final',
              documentType: (s.customer?.taxId?.length === 9 || s.customer?.taxId?.includes('-')) ? 'NIT' : 'CC',
              document: s.customer?.taxId || '222222222222',
              email: '',
              phone: s.customer?.phone || '',
              address: 'Sede Principal',
              city: 'Bogotá D.C.',
            },
            seller: 'Cajero Principal',
            paymentMethod: methodUpper,
            items: mappedItems,
            notes: `Factura Electrónica generada con CUFE: ${s.cufe ? s.cufe.slice(0, 16) + '...' : 'N/A'}`,
            status: 'aceptada' as InvoiceStatus,
            electronic: {
              dianStatus: 'aceptado' as const,
              cufe: s.cufe || null,
              sentAt: rawDate,
              respondedAt: rawDate,
              message: 'Documento procesado y validado con éxito por la DIAN (UBL 2.1)',
            },
          }
        })
        setItems(mapped)
      }
    } catch {
      // Conservar seed data si falla la API
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadSales()
  }, [loadSales])

  const showToast = React.useCallback((msg: string, kind: ToastKind = 'success') => {
    setToast({ msg, kind })
    window.setTimeout(() => setToast(null), 3000)
  }, [])

  const summary = React.useMemo(() => getSummary(items), [items])

  const indicators: Indicator[] = React.useMemo(
    () => [
      {
        id: 'billed',
        icon: CircleDollarSign,
        label: 'Total facturado',
        value: formatCurrency(summary.billed),
        description: `${summary.month} facturas este mes`,
        tone: 'primary',
        trend: 'up',
        comparison: 'Ventas brutas',
      },
      {
        id: 'today',
        icon: CalendarDays,
        label: 'Facturación hoy',
        value: `${summary.today} docs`,
        description: 'Emitidas el día actual',
        tone: 'primary',
        trend: 'up',
        comparison: 'Actividad diaria',
      },
      {
        id: 'accepted',
        icon: CheckCircle2,
        label: 'Aceptadas DIAN',
        value: String(summary.accepted),
        description: 'Con CUFE válido emitido',
        tone: 'success',
        trend: 'up',
        comparison: 'Validación DIAN 100%',
      },
      {
        id: 'pending',
        icon: Clock,
        label: 'Pendientes o en cola',
        value: String(summary.pending + summary.rejected),
        description: summary.rejected > 0 ? `${summary.rejected} con rechazo` : 'En espera de envío',
        tone: summary.rejected > 0 ? 'danger' : 'warning',
        trend: 'flat',
        comparison: 'Requieren atención',
      },
    ],
    [summary]
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const cQ = customerQuery.trim().toLowerCase()
    const dQ = documentQuery.trim().toLowerCase()

    return items
      .filter((inv) => {
        if (q && !inv.number.toLowerCase().includes(q)) return false
        if (cQ && !inv.customer.name.toLowerCase().includes(cQ)) return false
        if (dQ && !inv.customer.document.toLowerCase().includes(dQ)) return false
        if (dateFrom && inv.date < dateFrom) return false
        if (dateTo && inv.date > dateTo) return false
        if (status !== 'all' && inv.status !== status) return false
        return true
      })
      .sort((a, b) => {
        let diff = 0
        if (sortKey === 'number') diff = a.number.localeCompare(b.number)
        else if (sortKey === 'date') diff = `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
        else if (sortKey === 'customer') diff = a.customer.name.localeCompare(b.customer.name, 'es')
        else if (sortKey === 'total') diff = computeTotals(a.items).total - computeTotals(b.items).total
        return sortDir === 'asc' ? diff : -diff
      })
  }, [items, query, customerQuery, documentQuery, dateFrom, dateTo, status, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = React.useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  )

  const allSelected = paged.length > 0 && paged.every((i) => selected.has(i.id))
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(paged.map((i) => i.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

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
    setPage(1)
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
          : x
      )
    )
    setDetail((d) => (d && d.id === inv.id ? { ...d, status: 'enviada' } : d))
    showToast(`Factura ${inv.number} enviada a la DIAN`)
  }

  const handleBulkSendDian = () => {
    setItems((prev) =>
      prev.map((x) =>
        selected.has(x.id) && (x.electronic.dianStatus === 'no_enviado' || x.electronic.dianStatus === 'rechazado')
          ? {
              ...x,
              status: 'enviada',
              electronic: {
                ...x.electronic,
                dianStatus: 'en_proceso',
                sentAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
                message: 'Transmitido por lote a servidores DIAN.',
              },
            }
          : x
      )
    )
    showToast(`Transmitiendo ${selected.size} facturas en lote a la DIAN`)
    setSelected(new Set())
  }

  const handleBulkExport = () => {
    showToast(`Descargando archivo comprimido ZIP con las ${selected.size} facturas seleccionadas`)
  }

  const handleVoid = () => {
    if (!toVoid) return
    setItems((prev) => prev.map((x) => (x.id === toVoid.id ? { ...x, status: 'anulada' } : x)))
    showToast(`Factura ${toVoid.number} anulada correctamente`, 'error')
    setToVoid(null)
    setDetail(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Facturación Electrónica DIAN
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulta, emisión, transmisión DIAN, validación CUFE y administración de comprobantes fiscales.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => showToast('Importación de facturas electrónicas XML/JSON')}>
            <Upload />
            Importar
          </Button>
          <Button variant="outline" size="sm" onClick={() => showToast('Exportando reporte de facturación a Excel')}>
            <Download />
            Exportar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await loadSales()
              showToast('Facturas y estados DIAN actualizados desde el servidor')
              sonnerToast.success('Historial de facturación sincronizado')
            }}
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            Actualizar
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => showToast('Abriendo punto de venta para nueva factura...')}
          >
            <Plus />
            Nueva factura
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {indicators.map((ind) => (
          <IndicatorCard key={ind.id} indicator={ind} />
        ))}
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <Label htmlFor="f-number">Número de factura</Label>
            <Input
              id="f-number"
              leadingIcon={<Search />}
              placeholder="ej. FE-1042"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div>
            <Label htmlFor="f-customer">Cliente / Razón Social</Label>
            <Input
              id="f-customer"
              leadingIcon={<Search />}
              placeholder="Nombre de cliente"
              value={customerQuery}
              onChange={(e) => {
                setCustomerQuery(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div>
            <Label htmlFor="f-document">Identificación (NIT / CC)</Label>
            <Input
              id="f-document"
              leadingIcon={<Search />}
              placeholder="Número de cédula o NIT"
              value={documentQuery}
              onChange={(e) => {
                setDocumentQuery(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div>
            <Label htmlFor="f-from">Fecha inicial</Label>
            <Input
              id="f-from"
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div>
            <Label htmlFor="f-to">Fecha final</Label>
            <Input
              id="f-to"
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div>
            <Label htmlFor="f-status">Estado de factura</Label>
            <Select
              id="f-status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as InvoiceStatus | 'all')
                setPage(1)
              }}
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
          <div className="mt-3 flex justify-end border-t border-border pt-3">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <XCircle />
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Selection Bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <span className="font-medium text-foreground">
            {selected.size} {selected.size === 1 ? 'factura seleccionada' : 'facturas seleccionadas'}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBulkSendDian}>
              <Send className="size-4" />
              Transmitir DIAN en lote
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkExport}>
              <Download className="size-4" />
              Descargar ZIP
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Result count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Mostrando {paged.length} de {filtered.length} facturas
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton columns={9} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <FileX className="size-6 text-muted-foreground" aria-hidden />
          </div>
          <div>
            <p className="font-medium text-foreground">Sin facturas encontradas</p>
            <p className="text-sm text-muted-foreground">
              Ajusta los filtros o fechas para ver otros resultados.
            </p>
          </div>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Seleccionar todos"
                    className="size-4 cursor-pointer rounded border-border accent-primary"
                  />
                </TableHead>
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
                    label="Fecha / Hora"
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
                  />
                </TableHead>
                <TableHead>Estado DIAN</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((inv) => {
                const totals = computeTotals(inv.items)
                const canSend =
                  inv.electronic.dianStatus === 'no_enviado' || inv.electronic.dianStatus === 'rechazado'
                const canVoid = inv.status !== 'anulada'

                return (
                  <TableRow key={inv.id} data-selected={selected.has(inv.id)}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.has(inv.id)}
                        onChange={() => toggleSelect(inv.id)}
                        aria-label={`Seleccionar ${inv.number}`}
                        className="size-4 cursor-pointer rounded border-border accent-primary"
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => setDetail(inv)}
                        className="font-mono text-sm font-semibold text-primary underline-offset-2 hover:underline"
                      >
                        {inv.number}
                      </button>
                      <p className="text-xs text-muted-foreground sm:hidden">{inv.date}</p>
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap tabular-nums text-muted-foreground sm:table-cell">
                      {inv.date}
                      <span className="block text-xs text-muted-foreground">{inv.time}</span>
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
                    <TableCell className="text-right tabular-nums font-bold text-foreground">
                      {formatCurrency(totals.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[inv.status]} size="sm" dot>
                        {statusLabel[inv.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActionsMenu
                        label={`Acciones para factura ${inv.number}`}
                        actions={[
                          {
                            label: 'Ver detalle',
                            icon: Eye,
                            onClick: () => setDetail(inv),
                          },
                          {
                            label: 'Ver PDF fiscal',
                            icon: Printer,
                            onClick: () => setPdf(inv),
                          },
                          ...(inv.electronic.cufe
                            ? [
                                {
                                  label: 'Descargar XML UBL 2.1',
                                  icon: Download,
                                  onClick: () => {
                                    window.open(posApi.getSaleXmlUrl(inv.id), '_blank')
                                  },
                                },
                              ]
                            : []),
                          ...(canSend
                            ? [
                                {
                                  label: 'Transmitir a la DIAN',
                                  icon: Send,
                                  onClick: () => handleSend(inv),
                                },
                              ]
                            : []),
                          ...(canVoid
                            ? [
                                {
                                  label: 'Anular factura',
                                  icon: Ban,
                                  danger: true,
                                  dividerBefore: true,
                                  onClick: () => setToVoid(inv),
                                },
                              ]
                            : []),
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      {/* Detail modal */}
      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={detail ? `Detalle de Factura ${detail.number}` : ''}
        description={detail ? `Emitida a ${detail.customer.name} · ${detail.date}` : ''}
        className="max-w-4xl"
      >
        {detail && (
          <InvoiceDetail
            invoice={detail}
            onPreview={() => {
              setPdf(detail)
              setDetail(null)
            }}
            onPrint={() => showToast(`Imprimiendo ${detail.number}...`)}
            onDownload={() => showToast(`Descargando factura electrónica ${detail.number}`)}
            onSend={() => handleSend(detail)}
            onVoid={() => setToVoid(detail)}
          />
        )}
      </Modal>

      {/* PDF modal */}
      <Modal
        open={pdf !== null}
        onClose={() => setPdf(null)}
        title={pdf ? `Vista previa de impresión · ${pdf.number}` : ''}
        description="Representación gráfica oficial para factura electrónica de venta."
        className="max-w-4xl"
      >
        {pdf && <InvoicePdf invoice={pdf} />}
      </Modal>

      {/* Void confirmation modal */}
      <Modal
        open={toVoid !== null}
        onClose={() => setToVoid(null)}
        title="Anular factura electrónica"
        description={
          toVoid
            ? `¿Confirmas la anulación de la factura ${toVoid.number} de ${toVoid.customer.name}? Se generará la respectiva nota de crédito electrónica.`
            : ''
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setToVoid(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleVoid}>
              <Ban />
              Confirmar anulación
            </Button>
          </>
        }
      />

      {/* Toast */}
      {toast && <DataToast message={toast.msg} kind={toast.kind} />}
    </div>
  )
}
