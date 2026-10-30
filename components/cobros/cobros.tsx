'use client'

import * as React from 'react'
import {
  Download,
  Upload,
  RefreshCw,
  Search,
  Wallet,
  CalendarClock,
  AlertTriangle,
  CircleDollarSign,
  TrendingUp,
  XCircle,
  Eye,
  Printer,
  Send,
  FileX,
  CreditCard,
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
  TableSkeleton,
} from '@/components/jeralpos/table'
import { SortButton } from '@/components/jeralpos/sort-button'
import { RowActionsMenu } from '@/components/jeralpos/row-actions'
import { Pagination } from '@/components/jeralpos/pagination'
import { DataToast } from '@/components/jeralpos/data-toast'
import { carteraApi, type AccountReceivableRecord } from '@/lib/api'
import { toast as sonnerToast } from 'sonner'
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
  type Payment,
  type PaymentMethod,
} from './mock-data'
import { AgingChart } from './aging-chart'
import { PaymentModal, type PaymentDraft } from './payment-modal'
import { CarteraProfile } from './cartera-profile'

type SortKey = 'customer' | 'invoice' | 'dueDate' | 'balance' | 'overdue'
type SortDir = 'asc' | 'desc'
type ToastKind = 'success' | 'error'
const PAGE_SIZE = 8

export function Cobros() {
  const [items, setItems] = React.useState<Receivable[]>(seedReceivables)
  const [loading, setLoading] = React.useState(true)

  const [customerQuery, setCustomerQuery] = React.useState('')
  const [invoiceQuery, setInvoiceQuery] = React.useState('')
  const [documentQuery, setDocumentQuery] = React.useState('')
  const [dueFrom, setDueFrom] = React.useState('')
  const [dueTo, setDueTo] = React.useState('')
  const [status, setStatus] = React.useState<ReceivableStatus | 'all'>('all')
  const [onlyOverdue, setOnlyOverdue] = React.useState(false)

  const [sortKey, setSortKey] = React.useState<SortKey>('dueDate')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  const [payTarget, setPayTarget] = React.useState<Receivable | null>(null)
  const [profileCustomerId, setProfileCustomerId] = React.useState<string | null>(null)
  const [toast, setToast] = React.useState<{ msg: string; kind: ToastKind } | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await carteraApi.getRecords()
      if (res && res.data && res.data.length > 0) {
        const mapped: Receivable[] = res.data.map((r: AccountReceivableRecord) => {
          const payments: Payment[] = (r.payments || []).map((p) => {
            const m = (p.payment_method || '').toLowerCase()
            const methodLabel: PaymentMethod =
              m === 'tarjeta'
                ? 'Tarjeta'
                : m === 'transferencia'
                ? 'Transferencia'
                : m === 'cheque'
                ? 'Cheque'
                : m === 'otro'
                ? 'Otro'
                : 'Efectivo'

            return {
              id: `pay-${p.id}`,
              date: (p.payment_date || '').split('T')[0] || new Date().toISOString().split('T')[0],
              method: methodLabel,
              amount: Number(p.amount) || 0,
              reference: p.reference_code || '',
              notes: '',
              receivedBy: 'Cajero Principal',
            }
          })

          const total = Number(r.initial_amount) || 0
          return {
            id: String(r.id),
            invoice: r.sale_id ? `FE-${r.sale_id}` : `CR-${r.id.toString().padStart(4, '0')}`,
            customerId: r.customer_tax_id || `cust-${r.id}`,
            customerName: r.customer_name || 'Cliente Mostrador',
            documentType: (r.customer_tax_id?.length === 9 || r.customer_tax_id?.includes('-')) ? 'NIT' : 'CC',
            document: r.customer_tax_id || '',
            email: '',
            phone: r.customer_phone || '',
            city: 'Bogotá D.C.',
            issueDate: ((r as { created_at?: string }).created_at || new Date().toISOString()).split('T')[0],
            dueDate: (r.due_date || new Date().toISOString()).split('T')[0],
            total,
            payments,
            voided: (r.status as string) === 'CANCELLED',
          }
        })
        setItems(mapped)
      }
    } catch {
      // Conservar seed data si la API falla
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const showToast = React.useCallback((msg: string, kind: ToastKind = 'success') => {
    setToast({ msg, kind })
    window.setTimeout(() => setToast(null), 3000)
  }, [])

  const summary = React.useMemo(() => getSummary(items), [items])
  const aging = React.useMemo(() => computeAging(items), [items])

  const indicators: Indicator[] = React.useMemo(
    () => [
      {
        id: 'total-receivable',
        icon: Wallet,
        label: 'Cartera total',
        value: formatCurrency(summary.total),
        description: `${items.length} facturas a crédito`,
        tone: 'primary',
        trend: 'up',
        comparison: 'Saldo por recaudar',
      },
      {
        id: 'current-balance',
        icon: CalendarClock,
        label: 'Por vencer',
        value: formatCurrency(summary.porVencer),
        description: 'Vigentes al día de hoy',
        tone: 'primary',
        trend: 'flat',
        comparison: 'En plazo',
      },
      {
        id: 'overdue-balance',
        icon: AlertTriangle,
        label: 'Cartera vencida',
        value: formatCurrency(summary.vencida),
        description: 'Cuentas en mora',
        tone: summary.vencida > 0 ? 'danger' : 'success',
        trend: summary.vencida > 0 ? 'up' : 'down',
        comparison: 'Gestión prioritaria',
      },
      {
        id: 'collected-month',
        icon: CircleDollarSign,
        label: 'Recaudado este mes',
        value: formatCurrency(summary.cobradoMes),
        description: 'Ingresos por cartera',
        tone: 'success',
        trend: 'up',
        comparison: 'Recaudo efectivo',
      },
    ],
    [summary, items.length]
  )

  const filtered = React.useMemo(() => {
    const cQ = customerQuery.trim().toLowerCase()
    const iQ = invoiceQuery.trim().toLowerCase()
    const dQ = documentQuery.trim().toLowerCase()

    return items
      .filter((r) => {
        if (cQ && !r.customerName.toLowerCase().includes(cQ)) return false
        if (iQ && !r.invoice.toLowerCase().includes(iQ)) return false
        if (dQ && !r.document.toLowerCase().includes(dQ)) return false
        if (status !== 'all' && statusOf(r) !== status) return false
        if (dueFrom && r.dueDate < dueFrom) return false
        if (dueTo && r.dueDate > dueTo) return false
        if (onlyOverdue && daysOverdue(r) <= 0) return false
        return true
      })
      .sort((a, b) => {
        let diff = 0
        if (sortKey === 'customer') diff = a.customerName.localeCompare(b.customerName, 'es')
        else if (sortKey === 'invoice') diff = a.invoice.localeCompare(b.invoice)
        else if (sortKey === 'dueDate') diff = a.dueDate.localeCompare(b.dueDate)
        else if (sortKey === 'balance') diff = balance(a) - balance(b)
        else if (sortKey === 'overdue') diff = daysOverdue(a) - daysOverdue(b)
        return sortDir === 'asc' ? diff : -diff
      })
  }, [items, customerQuery, invoiceQuery, documentQuery, status, dueFrom, dueTo, onlyOverdue, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = React.useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  )

  const allSelected = paged.length > 0 && paged.every((r) => selected.has(r.id))
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(paged.map((r) => r.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const hasFilters =
    customerQuery !== '' ||
    invoiceQuery !== '' ||
    documentQuery !== '' ||
    dueFrom !== '' ||
    dueTo !== '' ||
    status !== 'all' ||
    onlyOverdue

  const clearFilters = () => {
    setCustomerQuery('')
    setInvoiceQuery('')
    setDocumentQuery('')
    setDueFrom('')
    setDueTo('')
    setStatus('all')
    setOnlyOverdue(false)
    setPage(1)
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'dueDate' || key === 'balance' ? 'desc' : 'asc')
    }
  }

  const handleRegisterPayment = async (draft: PaymentDraft) => {
    if (!payTarget) return
    const invoice = payTarget.invoice
    const numericId = Number(payTarget.id)

    // Si el ID es numérico (registro real de BD), enviar a API de Laravel
    if (!Number.isNaN(numericId) && numericId > 0) {
      try {
        const methodLower = (
          draft.method.toLowerCase() === 'efectivo' ||
          draft.method.toLowerCase() === 'tarjeta' ||
          draft.method.toLowerCase() === 'transferencia'
            ? draft.method.toLowerCase()
            : 'otro'
        ) as 'efectivo' | 'tarjeta' | 'transferencia' | 'otro'

        await carteraApi.recordPayment({
          account_receivable_id: numericId,
          amount: draft.amount,
          payment_method: methodLower,
          reference_code: draft.reference,
          notes: draft.notes,
        })
        sonnerToast.success(`Abono de ${formatCurrency(draft.amount)} registrado a ${invoice}`)
        showToast(`Abono de ${formatCurrency(draft.amount)} guardado en el servidor`)
        await loadData()
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al registrar el cobro en el servidor'
        sonnerToast.error(msg)
        showToast(msg, 'error')
      } finally {
        setPayTarget(null)
      }
      return
    }

    // Modo local optimista para registros de respaldo
    setItems((prev) =>
      prev.map((r) => {
        if (r.id !== payTarget.id) return r
        const newPayment = {
          id: `pay-${Date.now()}`,
          date: draft.date,
          method: draft.method,
          amount: draft.amount,
          reference: draft.reference,
          notes: draft.notes,
          receivedBy: draft.receivedBy,
        }
        return {
          ...r,
          payments: [...r.payments, newPayment],
        }
      })
    )
    setPayTarget(null)
    showToast(`Cobro de ${formatCurrency(draft.amount)} registrado en ${invoice}`)
  }

  const handleBulkReminders = () => {
    showToast(`Recordatorios de cobro enviados a ${selected.size} clientes por WhatsApp / Email`)
    setSelected(new Set())
  }

  const handleBulkExport = () => {
    showToast(`Exportando ${selected.size} cuentas seleccionadas a Excel`)
  }

  const cartera = React.useMemo(
    () => (profileCustomerId ? customerCartera(items, profileCustomerId) : null),
    [items, profileCustomerId]
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
            Control integral de saldos pendientes, estados de cuenta, cartera por edades y recaudos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => showToast('Función de importación de extractos bancarios')}>
            <Upload />
            Importar
          </Button>
          <Button variant="outline" size="sm" onClick={() => showToast('Exportando reporte general de cartera...')}>
            <Download />
            Exportar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await loadData()
              showToast('Datos de cartera actualizados desde el servidor')
            }}
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {indicators.map((ind) => (
          <IndicatorCard key={ind.id} indicator={ind} />
        ))}
      </div>

      {/* Aging chart */}
      <AgingChart buckets={aging} />

      {/* Filters Toolbar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <Label htmlFor="f-customer">Cliente</Label>
            <Input
              id="f-customer"
              leadingIcon={<Search />}
              placeholder="Nombre o razón social"
              value={customerQuery}
              onChange={(e) => {
                setCustomerQuery(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div>
            <Label htmlFor="f-invoice">Factura</Label>
            <Input
              id="f-invoice"
              leadingIcon={<Search />}
              placeholder="FE-1042"
              value={invoiceQuery}
              onChange={(e) => {
                setInvoiceQuery(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div>
            <Label htmlFor="f-document">Documento</Label>
            <Input
              id="f-document"
              leadingIcon={<Search />}
              placeholder="NIT o cédula"
              value={documentQuery}
              onChange={(e) => {
                setDocumentQuery(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div>
            <Label htmlFor="f-status">Estado</Label>
            <Select
              id="f-status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ReceivableStatus | 'all')
                setPage(1)
              }}
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
              onChange={(e) => {
                setDueFrom(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div>
            <Label htmlFor="f-to">Vence hasta</Label>
            <Input
              id="f-to"
              type="date"
              value={dueTo}
              onChange={(e) => {
                setDueTo(e.target.value)
                setPage(1)
              }}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={onlyOverdue}
              onChange={(e) => {
                setOnlyOverdue(e.target.checked)
                setPage(1)
              }}
              className="size-4 rounded border-border text-primary accent-primary"
            />
            Solo vencidas en mora
          </label>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <XCircle />
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Selection Bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <span className="font-medium text-foreground">
            {selected.size} {selected.size === 1 ? 'cuenta seleccionada' : 'cuentas seleccionadas'}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBulkReminders}>
              <Send className="size-4" />
              Enviar recordatorio masivo
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkExport}>
              <Download className="size-4" />
              Exportar selección
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
          Mostrando {paged.length} de {filtered.length} cuentas por cobrar
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
                    label="Vencimiento"
                    active={sortKey === 'dueDate'}
                    dir={sortDir}
                    onClick={() => toggleSort('dueDate')}
                  />
                </TableHead>
                <TableHead className="hidden text-right xl:table-cell">Total Factura</TableHead>
                <TableHead className="hidden text-right xl:table-cell">Abonado</TableHead>
                <TableHead className="text-right">
                  <SortButton
                    label="Saldo"
                    active={sortKey === 'balance'}
                    dir={sortDir}
                    onClick={() => toggleSort('balance')}
                  />
                </TableHead>
                <TableHead className="hidden text-center md:table-cell">
                  <SortButton
                    label="Días Mora"
                    active={sortKey === 'overdue'}
                    dir={sortDir}
                    onClick={() => toggleSort('overdue')}
                  />
                </TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((r) => {
                const st = statusOf(r)
                const bal = balance(r)
                const od = daysOverdue(r)
                return (
                  <TableRow key={r.id} data-selected={selected.has(r.id)}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onChange={() => toggleSelect(r.id)}
                        aria-label={`Seleccionar ${r.customerName}`}
                        className="size-4 cursor-pointer rounded border-border accent-primary"
                      />
                    </TableCell>
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
                    <TableCell className="hidden text-right tabular-nums text-success xl:table-cell">
                      {formatCurrency(paidAmount(r))}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-semibold text-foreground">
                      {formatCurrency(bal)}
                    </TableCell>
                    <TableCell className="hidden text-center tabular-nums md:table-cell">
                      {st === 'pagada' || st === 'anulada' ? (
                        <span className="text-muted-foreground">—</span>
                      ) : od > 0 ? (
                        <span className="font-semibold text-danger">{od} d</span>
                      ) : (
                        <span className="text-muted-foreground">Al día</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[st]} size="sm" dot>
                        {statusLabel[st]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActionsMenu
                        label={`Acciones para cartera ${r.invoice}`}
                        actions={[
                          ...(st !== 'pagada' && st !== 'anulada'
                            ? [
                                {
                                  label: 'Registrar cobro',
                                  icon: CircleDollarSign,
                                  onClick: () => setPayTarget(r),
                                },
                              ]
                            : []),
                          {
                            label: 'Ver estado de cuenta',
                            icon: Eye,
                            onClick: () => setProfileCustomerId(r.customerId),
                          },
                          ...(st !== 'pagada' && st !== 'anulada'
                            ? [
                                {
                                  label: 'Enviar recordatorio',
                                  icon: Send,
                                  onClick: () => showToast(`Recordatorio enviado a ${r.customerName}`),
                                },
                              ]
                            : []),
                          {
                            label: 'Imprimir recibo',
                            icon: Printer,
                            dividerBefore: true,
                            onClick: () => showToast(`Imprimiendo comprobante de ${r.invoice}...`),
                          },
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
      {toast && <DataToast message={toast.msg} kind={toast.kind} />}
    </div>
  )
}
