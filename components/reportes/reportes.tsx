'use client'

import * as React from 'react'
import {
  FileSpreadsheet,
  FileText,
  FileDown,
  Printer,
  Play,
  XCircle,
  CheckCircle2,
  CalendarRange,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Input, Select, Label } from '@/components/jeralpos/input'
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
  summaryCards,
  reportGroups,
  reportLabelById,
  getReportView,
  formatValue,
  sucursales,
  usuarios,
  clientes,
  proveedores,
  categorias,
  productos,
  type ReportView,
  type ReportStat,
  type ColumnFormat,
} from './mock-data'
import { ChartCard } from './charts'

type ToastKind = 'success' | 'error'

const DEFAULT_REPORT = 'ventas-dia'

function formatCell(value: string | number, format?: ColumnFormat): string {
  if (typeof value === 'number' && format && format !== 'text') {
    return formatValue(value, format)
  }
  return String(value)
}

const statTone: Record<NonNullable<ReportStat['tone']>, string> = {
  default: 'text-foreground',
  primary: 'text-primary',
  success: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning-foreground',
}

/* -------------------------------------------------------------------------- */
/*  Report menu                                                               */
/* -------------------------------------------------------------------------- */

function ReportMenu({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (id: string) => void
}) {
  return (
    <nav aria-label="Catálogo de reportes" className="flex flex-col gap-5">
      {reportGroups.map((group) => {
        const Icon = group.icon
        return (
          <div key={group.category}>
            <div className="mb-2 flex items-center gap-2 px-1">
              <span className="grid size-6 place-items-center rounded-md bg-muted text-muted-foreground [&_svg]:size-3.5">
                <Icon aria-hidden />
              </span>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </h3>
            </div>
            <ul className="flex flex-col gap-0.5">
              {group.reports.map((r) => {
                const active = r.id === selected
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(r.id)}
                      aria-current={active ? 'true' : undefined}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                        active
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-foreground hover:bg-accent',
                      )}
                    >
                      <span
                        className={cn(
                          'size-1.5 shrink-0 rounded-full transition-colors',
                          active ? 'bg-primary' : 'bg-border',
                        )}
                        aria-hidden
                      />
                      <span className="truncate">{r.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}

/* -------------------------------------------------------------------------- */
/*  Loading skeleton                                                          */
/* -------------------------------------------------------------------------- */

function ReportSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-xl border border-border bg-card" />
      <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Report result                                                             */
/* -------------------------------------------------------------------------- */

function ReportResult({
  view,
  onExport,
}: {
  view: ReportView
  onExport: (kind: string) => void
}) {
  const twoCharts = view.charts.length > 1
  return (
    <div className="flex flex-col gap-5">
      {/* Result header + export toolbar */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{view.title}</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-success-muted px-2 py-0.5 text-[11px] font-medium text-success">
              <CheckCircle2 className="size-3" aria-hidden />
              Generado
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{view.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onExport('Excel')}>
            <FileSpreadsheet />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport('PDF')}>
            <FileText />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport('CSV')}>
            <FileDown />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport('impresión')}>
            <Printer />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {view.stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={cn('mt-1 text-xl font-bold tracking-tight tabular-nums', statTone[s.tone ?? 'default'])}>
              {s.value}
            </p>
            {s.hint && <p className="mt-0.5 text-xs text-muted-foreground">{s.hint}</p>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className={cn('grid gap-5', twoCharts && 'lg:grid-cols-2')}>
        {view.charts.map((spec, i) => (
          <ChartCard key={`${spec.kind}-${i}`} spec={spec} />
        ))}
      </div>

      {/* Data table */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Detalle</h3>
          <span className="text-xs text-muted-foreground">{view.table.rows.length} registros</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {view.table.columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                  )}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {view.table.rows.map((row, ri) => (
              <TableRow key={ri}>
                {view.table.columns.map((col, ci) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      col.align === 'right' && 'text-right tabular-nums',
                      col.align === 'center' && 'text-center',
                      ci === 0 && 'font-medium',
                    )}
                  >
                    {formatCell(row[col.key], col.format)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Main module                                                               */
/* -------------------------------------------------------------------------- */

export function Reportes() {
  const [selected, setSelected] = React.useState(DEFAULT_REPORT)
  const [shownId, setShownId] = React.useState(DEFAULT_REPORT)
  const [generating, setGenerating] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [toast, setToast] = React.useState<{ msg: string; kind: ToastKind } | null>(null)

  // Filters
  const [dateFrom, setDateFrom] = React.useState('2026-09-01')
  const [dateTo, setDateTo] = React.useState('2026-09-22')
  const [sucursal, setSucursal] = React.useState(sucursales[0])
  const [usuario, setUsuario] = React.useState(usuarios[0])
  const [cliente, setCliente] = React.useState(clientes[0])
  const [proveedor, setProveedor] = React.useState(proveedores[0])
  const [categoria, setCategoria] = React.useState(categorias[0])
  const [producto, setProducto] = React.useState(productos[0])

  const toastTimer = React.useRef<number | undefined>(undefined)
  const genTimer = React.useRef<number | undefined>(undefined)

  React.useEffect(
    () => () => {
      window.clearTimeout(toastTimer.current)
      window.clearTimeout(genTimer.current)
    },
    [],
  )

  const showToast = React.useCallback((msg: string, kind: ToastKind = 'success') => {
    setToast({ msg, kind })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2800)
  }, [])

  const runReport = React.useCallback(
    (id: string) => {
      setGenerating(true)
      window.clearTimeout(genTimer.current)
      genTimer.current = window.setTimeout(() => {
        setShownId(id)
        setGenerating(false)
        showToast(`Reporte "${reportLabelById[id]}" generado`)
      }, 650)
    },
    [showToast],
  )

  const handleSelect = (id: string) => {
    setSelected(id)
    setMenuOpen(false)
    runReport(id)
  }

  const handleExport = (kind: string) => {
    if (kind === 'impresión') {
      showToast('Preparando impresión...')
      window.setTimeout(() => window.print(), 300)
      return
    }
    showToast(`Exportando "${reportLabelById[shownId]}" a ${kind}...`)
  }

  const view = React.useMemo(() => getReportView(shownId), [shownId])

  const summaryIndicators: Indicator[] = React.useMemo(
    () =>
      summaryCards.map((c) => ({
        id: c.id,
        icon: c.icon,
        label: c.label,
        value: c.value,
        description: c.description,
        tone: c.tone,
        trend: c.trend,
        comparison: c.comparison,
      })),
    [],
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reportes</h1>
        <p className="text-sm text-muted-foreground">
          Analiza las operaciones y resultados de tu negocio.
        </p>
      </div>

      {/* Dashboard cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {summaryIndicators.map((ind) => (
          <IndicatorCard key={ind.id} indicator={ind} />
        ))}
      </div>

      {/* Mobile report selector */}
      <div className="xl:hidden">
        <Button
          variant="outline"
          size="md"
          className="w-full justify-between"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
        >
          <span>Reporte: {reportLabelById[selected]}</span>
          <ChevronDown className={cn('transition-transform', menuOpen && 'rotate-180')} />
        </Button>
        {menuOpen && (
          <div className="mt-2 rounded-xl border border-border bg-card p-4 shadow-sm">
            <ReportMenu selected={selected} onSelect={handleSelect} />
          </div>
        )}
      </div>

      {/* Body: menu + workspace */}
      <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
        {/* Report menu (desktop) */}
        <aside className="hidden xl:block">
          <div className="sticky top-4 rounded-xl border border-border bg-card p-4 shadow-sm">
            <ReportMenu selected={selected} onSelect={handleSelect} />
          </div>
        </aside>

        {/* Workspace */}
        <div className="flex min-w-0 flex-col gap-6">
          {/* Filters */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CalendarRange className="size-4 text-muted-foreground" aria-hidden />
              <h2 className="text-sm font-semibold text-foreground">Filtros del reporte</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div>
                <Label htmlFor="f-from">Fecha inicial</Label>
                <Input id="f-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="f-to">Fecha final</Label>
                <Input id="f-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="f-sucursal">Sucursal</Label>
                <Select id="f-sucursal" value={sucursal} onChange={(e) => setSucursal(e.target.value)}>
                  {sucursales.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="f-usuario">Usuario</Label>
                <Select id="f-usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)}>
                  {usuarios.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="f-cliente">Cliente</Label>
                <Select id="f-cliente" value={cliente} onChange={(e) => setCliente(e.target.value)}>
                  {clientes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="f-proveedor">Proveedor</Label>
                <Select id="f-proveedor" value={proveedor} onChange={(e) => setProveedor(e.target.value)}>
                  {proveedores.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="f-categoria">Categoría</Label>
                <Select id="f-categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                  {categorias.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="f-producto">Producto</Label>
                <Select id="f-producto" value={producto} onChange={(e) => setProducto(e.target.value)}>
                  {productos.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="primary" size="md" onClick={() => runReport(selected)} loading={generating}>
                {!generating && <Play />}
                Generar reporte
              </Button>
            </div>
          </div>

          {/* Result */}
          {generating ? <ReportSkeleton /> : <ReportResult view={view} onExport={handleExport} />}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2',
            toast.kind === 'success'
              ? 'border-success/30 bg-success-muted text-success'
              : 'border-danger/30 bg-danger-muted text-danger',
          )}
        >
          {toast.kind === 'success' ? (
            <CheckCircle2 className="size-4" aria-hidden />
          ) : (
            <XCircle className="size-4" aria-hidden />
          )}
          {toast.msg}
        </div>
      )}
    </div>
  )
}
