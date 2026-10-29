'use client'

import * as React from 'react'
import {
  Plus,
  Upload,
  Download,
  RefreshCw,
  Search,
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Pencil,
  Copy,
  Power,
  Trash2,
  Boxes,
} from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Input, Select } from '@/components/jeralpos/input'
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
import {
  products as seedProducts,
  categories,
  brands,
  formatCurrency,
  stockLevel,
  statusLabel,
  statusVariant,
  getProductSummary,
  type Product,
  type ProductStatus,
  type StockLevel,
} from './mock-data'
import { ProductForm } from './product-form'
import { ProductProfile } from './product-profile'

type SortKey = 'name' | 'category' | 'salePrice' | 'stock'
type SortDir = 'asc' | 'desc'
type ToastKind = 'success' | 'error'
const PAGE_SIZE = 6

function ProductThumb({ product }: { product: Product }) {
  const initials = product.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  return (
    <div
      className="flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-xs"
      style={{ backgroundColor: product.color }}
      aria-hidden
    >
      {initials}
    </div>
  )
}

function StockCell({ product }: { product: Product }) {
  const level = stockLevel(product)
  const variant = level === 'out' ? 'danger' : level === 'low' ? 'warning' : 'success'
  return (
    <div className="flex items-center gap-2">
      <span className="tabular-nums font-semibold text-foreground">{product.stock}</span>
      <Badge variant={variant} size="sm" dot>
        {level === 'out' ? 'Agotado' : level === 'low' ? 'Bajo' : 'OK'}
      </Badge>
    </div>
  )
}

export function Productos() {
  const [items, setItems] = React.useState<Product[]>(seedProducts)
  const [loading, setLoading] = React.useState(true)

  const [query, setQuery] = React.useState('')
  const [category, setCategory] = React.useState('all')
  const [brand, setBrand] = React.useState('all')
  const [status, setStatus] = React.useState<ProductStatus | 'all'>('all')
  const [stock, setStock] = React.useState<StockLevel | 'all'>('all')

  const [sortKey, setSortKey] = React.useState<SortKey>('name')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Product | null>(null)
  const [profile, setProfile] = React.useState<Product | null>(null)
  const [toDelete, setToDelete] = React.useState<Product | null>(null)
  const [bulkDelete, setBulkDelete] = React.useState(false)
  const [toast, setToast] = React.useState<{ msg: string; kind: ToastKind } | null>(null)

  React.useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 700)
    return () => window.clearTimeout(t)
  }, [])

  const showToast = React.useCallback((msg: string, kind: ToastKind = 'success') => {
    setToast({ msg, kind })
    window.setTimeout(() => setToast(null), 2800)
  }, [])

  const summary = React.useMemo(() => getProductSummary(items), [items])

  const indicators: Indicator[] = React.useMemo(
    () => [
      {
        id: 'total',
        icon: Package,
        label: 'Total catálogo',
        value: String(summary.total),
        description: 'Artículos registrados',
        tone: 'primary',
        trend: 'up',
        comparison: `${formatCurrency(summary.inventoryValue)} en stock`,
      },
      {
        id: 'active',
        icon: CheckCircle2,
        label: 'Activos en POS',
        value: String(summary.active),
        description: `${Math.round((summary.active / Math.max(summary.total, 1)) * 100)}% disponible`,
        tone: 'success',
        trend: 'up',
        comparison: 'Listos para venta',
      },
      {
        id: 'lowStock',
        icon: AlertTriangle,
        label: 'Stock bajo',
        value: String(summary.lowStock),
        description: 'Por debajo del mínimo',
        tone: 'warning',
        trend: 'down',
        comparison: 'Requiere pedido',
      },
      {
        id: 'outOfStock',
        icon: XCircle,
        label: 'Agotados',
        value: String(summary.outOfStock),
        description: 'Existencias en cero',
        tone: 'danger',
        trend: 'down',
        comparison: 'No vendibles',
      },
    ],
    [summary],
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = items.filter((p) => {
      if (q) {
        const hit =
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.barcode.includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
        if (!hit) return false
      }
      if (category !== 'all' && p.category !== category) return false
      if (brand !== 'all' && p.brand !== brand) return false
      if (status !== 'all' && p.status !== status) return false
      if (stock !== 'all' && stockLevel(p) !== stock) return false
      return true
    })

    const sorted = [...result].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortKey === 'category') cmp = a.category.localeCompare(b.category)
      else if (sortKey === 'salePrice') cmp = a.salePrice - b.salePrice
      else if (sortKey === 'stock') cmp = a.stock - b.stock
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [items, query, category, brand, status, stock, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  React.useEffect(() => {
    setPage(1)
  }, [query, category, brand, status, stock])

  const hasFilters =
    query !== '' || category !== 'all' || brand !== 'all' || status !== 'all' || stock !== 'all'

  const clearFilters = () => {
    setQuery('')
    setCategory('all')
    setBrand('all')
    setStatus('all')
    setStock('all')
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const pageIds = paged.map((p) => p.id)
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id))

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allPageSelected) pageIds.forEach((id) => next.delete(id))
      else pageIds.forEach((id) => next.add(id))
      return next
    })
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleToggleStatus = (p: Product) => {
    setItems((prev) =>
      prev.map((x) =>
        x.id === p.id ? { ...x, status: x.status === 'activo' ? 'inactivo' : 'activo' } : x,
      ),
    )
    showToast(`Producto "${p.name}" ${p.status === 'activo' ? 'desactivado' : 'activado'}`)
  }

  const handleDuplicate = (p: Product) => {
    const copy: Product = {
      ...p,
      id: `${Date.now()}`,
      code: `${p.code}-COPIA`,
      barcode: `${Number(p.barcode) + 1}`,
      name: `${p.name} (copia)`,
    }
    setItems((prev) => [copy, ...prev])
    showToast(`Producto "${p.name}" duplicado`)
  }

  const handleConfirmDelete = () => {
    if (!toDelete) return
    setItems((prev) => prev.filter((p) => p.id !== toDelete.id))
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(toDelete.id)
      return next
    })
    showToast(`Producto "${toDelete.name}" eliminado`)
    setToDelete(null)
  }

  const handleBulkDelete = () => {
    setItems((prev) => prev.filter((p) => !selected.has(p.id)))
    showToast(`${selected.size} productos eliminados`)
    setSelected(new Set())
    setBulkDelete(false)
  }

  const handleCreate = (name: string) => {
    setCreateOpen(false)
    showToast(`Producto "${name}" creado exitosamente`)
  }

  const handleEditSave = (name: string) => {
    setEditing(null)
    showToast(`Producto "${name}" actualizado`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona el catálogo, precios, existencias y disponibilidad en el punto de venta.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="md" onClick={() => showToast('Importación iniciada')}>
            <Upload />
            Importar
          </Button>
          <Button variant="outline" size="md" onClick={() => showToast('Exportando catálogo...')}>
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
                showToast('Catálogo actualizado')
              }, 650)
            }}
          >
            <RefreshCw />
            Actualizar
          </Button>
          <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
            <Plus />
            Nuevo producto
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {indicators.map((ind) => (
          <IndicatorCard key={ind.id} indicator={ind} />
        ))}
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="lg:max-w-sm lg:flex-1">
          <Input
            leadingIcon={<Search />}
            placeholder="Buscar por código, nombre, categoría o marca..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar productos"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:ml-auto lg:flex lg:items-center">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filtrar por categoría"
          >
            <option value="all">Categoría</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            aria-label="Filtrar por marca"
          >
            <option value="all">Marca</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
          <Select
            value={stock}
            onChange={(e) => setStock(e.target.value as StockLevel | 'all')}
            aria-label="Filtrar por stock"
          >
            <option value="all">Stock</option>
            <option value="ok">Stock OK</option>
            <option value="low">Stock bajo</option>
            <option value="out">Agotado</option>
          </Select>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus | 'all')}
            aria-label="Filtrar por estado"
          >
            <option value="all">Estado</option>
            {(Object.keys(statusLabel) as ProductStatus[]).map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </Select>
          {hasFilters && (
            <Button
              variant="ghost"
              size="md"
              onClick={clearFilters}
              className="sm:col-span-4 lg:col-auto"
            >
              <XCircle />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Results / Bulk Bar */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {selected.size > 0 ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium text-foreground">
              {selected.size} seleccionado{selected.size === 1 ? '' : 's'}
            </span>
            <Button variant="outline" size="sm" onClick={() => showToast('Exportando selección...')}>
              <Download />
              Exportar
            </Button>
            <Button variant="danger" size="sm" onClick={() => setBulkDelete(true)}>
              <Trash2 />
              Eliminar
            </Button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <span>
            {filtered.length} producto{filtered.length === 1 ? '' : 's'} encontrado{filtered.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {/* Main Table */}
      {loading ? (
        <TableSkeleton rows={PAGE_SIZE} columns={8} />
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todos los de la página"
                    checked={allPageSelected}
                    onChange={toggleSelectAll}
                    className="size-4 rounded border-border"
                  />
                </TableHead>
                <TableHead>
                  <SortButton
                    label="Producto"
                    active={sortKey === 'name'}
                    dir={sortDir}
                    onClick={() => toggleSort('name')}
                  />
                </TableHead>
                <TableHead>
                  <SortButton
                    label="Categoría"
                    active={sortKey === 'category'}
                    dir={sortDir}
                    onClick={() => toggleSort('category')}
                  />
                </TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>
                  <SortButton
                    label="Precio venta"
                    active={sortKey === 'salePrice'}
                    dir={sortDir}
                    onClick={() => toggleSort('salePrice')}
                  />
                </TableHead>
                <TableHead>
                  <SortButton
                    label="Stock"
                    active={sortKey === 'stock'}
                    dir={sortDir}
                    onClick={() => toggleSort('stock')}
                  />
                </TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-2">
                    <Boxes className="size-10 text-muted-foreground/60" />
                    <p className="font-semibold text-foreground">No se encontraron productos</p>
                    <p className="text-xs text-muted-foreground">
                      Intenta ajustar los filtros de búsqueda o categoría.
                    </p>
                    {hasFilters && (
                      <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paged.map((product) => {
                const isSelected = selected.has(product.id)
                return (
                  <TableRow key={product.id} data-state={isSelected ? 'selected' : undefined}>
                    <TableCell>
                      <input
                        type="checkbox"
                        aria-label={`Seleccionar ${product.name}`}
                        checked={isSelected}
                        onChange={() => toggleSelect(product.id)}
                        className="size-4 rounded border-border"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ProductThumb product={product} />
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setProfile(product)}
                            className="text-left font-medium text-foreground hover:underline truncate block"
                          >
                            {product.name}
                          </button>
                          <p className="truncate text-xs text-muted-foreground font-mono">
                            {product.code} · {product.barcode}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-medium text-foreground">{product.category}</p>
                      <p className="text-[11px] text-muted-foreground">{product.brand}</p>
                    </TableCell>
                    <TableCell className="tabular-nums text-xs font-medium text-muted-foreground">
                      {formatCurrency(product.purchasePrice)}
                    </TableCell>
                    <TableCell className="tabular-nums font-semibold text-foreground">
                      {formatCurrency(product.salePrice)}
                    </TableCell>
                    <TableCell>
                      <StockCell product={product} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[product.status]}>
                        {statusLabel[product.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActionsMenu
                        label={`Acciones para ${product.name}`}
                        actions={[
                          {
                            label: 'Ver detalle',
                            icon: Eye,
                            onClick: () => setProfile(product),
                          },
                          {
                            label: 'Editar',
                            icon: Pencil,
                            onClick: () => setEditing(product),
                          },
                          {
                            label: 'Duplicar',
                            icon: Copy,
                            onClick: () => handleDuplicate(product),
                          },
                          {
                            label: product.status === 'activo' ? 'Desactivar' : 'Activar',
                            icon: Power,
                            onClick: () => handleToggleStatus(product),
                          },
                          {
                            label: 'Eliminar',
                            icon: Trash2,
                            danger: true,
                            onClick: () => setToDelete(product),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="border-t border-border px-4 py-3">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>
      )}

      {/* Modal: Create Product */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Crear nuevo producto"
        description="Registra un nuevo artículo en el catálogo con sus precios y existencias."
        className="max-w-3xl"
      >
        <ProductForm onCancel={() => setCreateOpen(false)} onSubmit={handleCreate} />
      </Modal>

      {/* Modal: Edit Product */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Editar producto"
        description="Modifica los datos generales, costos, precios de venta o stock del producto."
        className="max-w-3xl"
      >
        {editing && (
          <ProductForm
            initial={editing}
            onCancel={() => setEditing(null)}
            onSubmit={handleEditSave}
          />
        )}
      </Modal>

      {/* Modal: Product Profile */}
      <ProductProfile
        product={profile}
        onClose={() => setProfile(null)}
        onEdit={(p) => setEditing(p)}
        onDuplicate={(p) => handleDuplicate(p)}
      />

      {/* Modal: Confirm Delete */}
      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Eliminar producto"
        description={`¿Estás seguro de que deseas eliminar "${toDelete?.name}"? Esta acción removerá el producto del catálogo y no se podrá revertir.`}
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" size="md" onClick={() => setToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" size="md" onClick={handleConfirmDelete}>
              <Trash2 />
              Eliminar producto
            </Button>
          </div>
        }
      />

      {/* Modal: Bulk Delete */}
      <Modal
        open={bulkDelete}
        onClose={() => setBulkDelete(false)}
        title="Eliminar productos seleccionados"
        description={`¿Estás seguro de eliminar los ${selected.size} productos seleccionados? Esta acción es permanente.`}
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" size="md" onClick={() => setBulkDelete(false)}>
              Cancelar
            </Button>
            <Button variant="danger" size="md" onClick={handleBulkDelete}>
              <Trash2 />
              Eliminar {selected.size} productos
            </Button>
          </div>
        }
      />

      {/* Toast */}
      {toast && <DataToast message={toast.msg} kind={toast.kind} />}
    </div>
  )
}
