'use client'

import * as React from 'react'
import {
  Search,
  XCircle,
  Download,
  Eye,
  FileText,
  Copy,
  SlidersHorizontal,
  PackageCheck,
  FileX,
} from 'lucide-react'
import { Badge } from '@/components/jeralpos/badge'
import { Button } from '@/components/jeralpos/button'
import { Input, Select, Label } from '@/components/jeralpos/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton,
} from '@/components/jeralpos/table'
import { SortButton } from '@/components/jeralpos/sort-button'
import { RowActionsMenu } from '@/components/jeralpos/row-actions'
import { Pagination } from '@/components/jeralpos/pagination'
import { DataToast } from '@/components/jeralpos/data-toast'
import {
  movements as seedMovements,
  movementTypeMeta,
  formatMovementDate,
  type Movement,
  type MovementType,
} from './mock-data'
import { cn } from '@/lib/utils'

type SortKey = 'date' | 'productName' | 'type' | 'quantity' | 'user'
type SortDir = 'asc' | 'desc'
type ToastKind = 'success' | 'error'
const PAGE_SIZE = 8

const typeOptions: Array<{ value: MovementType | 'all'; label: string }> = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'entrada', label: 'Entrada' },
  { value: 'salida', label: 'Salida' },
  { value: 'ajuste', label: 'Ajuste' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'devolucion', label: 'Devolución' },
]

export function MovementsTable() {
  const [items, setItems] = React.useState<Movement[]>(seedMovements)
  const [query, setQuery] = React.useState('')
  const [type, setType] = React.useState<MovementType | 'all'>('all')
  const [dateFilter, setDateFilter] = React.useState('')

  const [sortKey, setSortKey] = React.useState<SortKey>('date')
  const [sortDir, setSortDir] = React.useState<SortDir>('desc')
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [toast, setToast] = React.useState<{ msg: string; kind: ToastKind } | null>(null)

  const showToast = React.useCallback((msg: string, kind: ToastKind = 'success') => {
    setToast({ msg, kind })
    window.setTimeout(() => setToast(null), 3000)
  }, [])

  const hasFilters = query !== '' || type !== 'all' || dateFilter !== ''

  const clearFilters = () => {
    setQuery('')
    setType('all')
    setDateFilter('')
    setPage(1)
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'date' || key === 'quantity' ? 'desc' : 'asc')
    }
  }

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return items
      .filter((m) => {
        if (type !== 'all' && m.type !== type) return false
        if (dateFilter && !m.date.startsWith(dateFilter)) return false
        if (
          q &&
          !m.productName.toLowerCase().includes(q) &&
          !m.productCode.toLowerCase().includes(q) &&
          !m.user.toLowerCase().includes(q) &&
          !m.id.toLowerCase().includes(q) &&
          !m.note.toLowerCase().includes(q)
        ) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        let diff = 0
        if (sortKey === 'date') diff = a.date.localeCompare(b.date)
        else if (sortKey === 'productName') diff = a.productName.localeCompare(b.productName, 'es')
        else if (sortKey === 'type') diff = a.type.localeCompare(b.type)
        else if (sortKey === 'quantity') diff = Math.abs(a.quantity) - Math.abs(b.quantity)
        else if (sortKey === 'user') diff = a.user.localeCompare(b.user, 'es')
        return sortDir === 'asc' ? diff : -diff
      })
  }, [items, query, type, dateFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = React.useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  )

  const allSelected = paged.length > 0 && paged.every((m) => selected.has(m.id))
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(paged.map((m) => m.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const handleBulkExport = () => {
    showToast(`Exportando ${selected.size} movimientos de Kardex a Excel`)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters Toolbar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-2">
            <Label htmlFor="inv-search">Buscar en Kardex</Label>
            <Input
              id="inv-search"
              leadingIcon={<Search />}
              placeholder="Buscar por código, producto, usuario o nota..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <div>
            <Label htmlFor="inv-type">Tipo de movimiento</Label>
            <Select
              id="inv-type"
              value={type}
              onChange={(e) => {
                setType(e.target.value as MovementType | 'all')
                setPage(1)
              }}
            >
              {typeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="inv-date">Filtrar por fecha</Label>
            <Input
              id="inv-date"
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value)
                setPage(1)
              }}
            />
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
            {selected.size} {selected.size === 1 ? 'movimiento seleccionado' : 'movimientos seleccionados'}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBulkExport}>
              <Download className="size-4" />
              Exportar movimientos
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Mostrando {paged.length} de {filtered.length} movimientos de inventario
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <FileX className="size-6 text-muted-foreground" aria-hidden />
          </div>
          <div>
            <p className="font-medium text-foreground">Sin movimientos de inventario</p>
            <p className="text-sm text-muted-foreground">
              Ajusta los filtros de búsqueda o el tipo de movimiento.
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
                    aria-label="Seleccionar todos los movimientos"
                    className="size-4 cursor-pointer rounded border-border accent-primary"
                  />
                </TableHead>
                <TableHead>
                  <SortButton
                    label="Fecha / Folio"
                    active={sortKey === 'date'}
                    dir={sortDir}
                    onClick={() => toggleSort('date')}
                  />
                </TableHead>
                <TableHead>
                  <SortButton
                    label="Producto"
                    active={sortKey === 'productName'}
                    dir={sortDir}
                    onClick={() => toggleSort('productName')}
                  />
                </TableHead>
                <TableHead>
                  <SortButton
                    label="Tipo"
                    active={sortKey === 'type'}
                    dir={sortDir}
                    onClick={() => toggleSort('type')}
                  />
                </TableHead>
                <TableHead className="text-right">
                  <SortButton
                    label="Cantidad"
                    active={sortKey === 'quantity'}
                    dir={sortDir}
                    onClick={() => toggleSort('quantity')}
                  />
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <SortButton
                    label="Responsable"
                    active={sortKey === 'user'}
                    dir={sortDir}
                    onClick={() => toggleSort('user')}
                  />
                </TableHead>
                <TableHead className="hidden lg:table-cell">Observación / Motivo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((m) => {
                const meta = movementTypeMeta[m.type]
                const signed =
                  meta.sign === 0 ? m.quantity : meta.sign * Math.abs(m.quantity)
                return (
                  <TableRow key={m.id} data-selected={selected.has(m.id)}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.has(m.id)}
                        onChange={() => toggleSelect(m.id)}
                        aria-label={`Seleccionar movimiento ${m.id}`}
                        className="size-4 cursor-pointer rounded border-border accent-primary"
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      <span className="block font-medium text-foreground text-sm">
                        {formatMovementDate(m.date)}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{m.id}</span>
                    </TableCell>
                    <TableCell>
                      <span className="block font-medium text-foreground">{m.productName}</span>
                      <span className="font-mono text-xs text-muted-foreground">{m.productCode}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={meta.variant} dot size="sm">
                        {meta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          'font-bold tabular-nums text-sm',
                          signed > 0 && 'text-success',
                          signed < 0 && 'text-danger',
                          signed === 0 && 'text-foreground'
                        )}
                      >
                        {signed > 0 ? '+' : ''}
                        {signed}
                      </span>
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-sm text-foreground md:table-cell">
                      {m.user}
                    </TableCell>
                    <TableCell className="hidden max-w-xs text-xs text-muted-foreground lg:table-cell truncate">
                      {m.note}
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActionsMenu
                        label={`Acciones para movimiento ${m.id}`}
                        actions={[
                          {
                            label: 'Ver comprobante',
                            icon: Eye,
                            onClick: () => showToast(`Visualizando comprobante de ${m.id}`),
                          },
                          {
                            label: 'Copiar código de producto',
                            icon: Copy,
                            onClick: () => {
                              navigator.clipboard?.writeText(m.productCode)
                              showToast(`Código ${m.productCode} copiado al portapapeles`)
                            },
                          },
                          {
                            label: 'Descargar reporte de movimiento',
                            icon: FileText,
                            dividerBefore: true,
                            onClick: () => showToast(`Descargando nota fiscal de ${m.id}`),
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
      {filtered.length > 0 && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      {/* Toast */}
      {toast && <DataToast message={toast.msg} kind={toast.kind} />}
    </div>
  )
}
