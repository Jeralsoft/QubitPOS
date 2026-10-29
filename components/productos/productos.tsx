'use client'

import * as React from 'react'
import {
  Plus,
  Upload,
  Download,
  Search,
  Eye,
  Pencil,
  Copy,
  Trash2,
  Package,
} from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Input, Select } from '@/components/jeralpos/input'
import { Badge } from '@/components/jeralpos/badge'
import { Modal } from '@/components/jeralpos/modal'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/jeralpos/table'
import {
  products as seedProducts,
  categories,
  brands,
  formatCurrency,
  stockLevel,
  type Product,
} from './mock-data'
import { ProductForm } from './product-form'

type StockFilter = 'all' | 'ok' | 'low' | 'out'
type StatusFilter = 'all' | 'activo' | 'inactivo'

function ProductThumb({ product }: { product: Product }) {
  const initials = product.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  return (
    <div
      className="flex size-10 items-center justify-center rounded-lg text-xs font-semibold text-white shadow-xs"
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
      <span className="tabular-nums font-medium text-foreground">{product.stock}</span>
      <Badge variant={variant} size="sm" dot>
        {level === 'out' ? 'Agotado' : level === 'low' ? 'Bajo' : 'OK'}
      </Badge>
    </div>
  )
}

function ActionButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={
        'inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-4 ' +
        (danger ? 'hover:bg-danger-muted hover:text-danger' : '')
      }
    >
      {children}
    </button>
  )
}

export function Productos() {
  const [items, setItems] = React.useState<Product[]>(seedProducts)
  const [query, setQuery] = React.useState('')
  const [category, setCategory] = React.useState('all')
  const [brand, setBrand] = React.useState('all')
  const [status, setStatus] = React.useState<StatusFilter>('all')
  const [stock, setStock] = React.useState<StockFilter>('all')

  const [createOpen, setCreateOpen] = React.useState(false)
  const [toDelete, setToDelete] = React.useState<Product | null>(null)
  const [toast, setToast] = React.useState<string | null>(null)

  const showToast = React.useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2600)
  }, [])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((p) => {
      if (q) {
        const hit =
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.barcode.includes(q)
        if (!hit) return false
      }
      if (category !== 'all' && p.category !== category) return false
      if (brand !== 'all' && p.brand !== brand) return false
      if (status !== 'all' && p.status !== status) return false
      if (stock !== 'all' && stockLevel(p) !== stock) return false
      return true
    })
  }, [items, query, category, brand, status, stock])

  const handleDuplicate = (p: Product) => {
    const copy: Product = {
      ...p,
      id: `${Date.now()}`,
      code: `${p.code}-COPIA`,
      name: `${p.name} (copia)`,
    }
    setItems((prev) => [copy, ...prev])
    showToast(`Producto "${p.name}" duplicado`)
  }

  const handleConfirmDelete = () => {
    if (!toDelete) return
    setItems((prev) => prev.filter((p) => p.id !== toDelete.id))
    showToast(`Producto "${toDelete.name}" eliminado`)
    setToDelete(null)
  }

  const handleCreate = (name: string) => {
    setCreateOpen(false)
    showToast(`Producto "${name}" creado`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona el catálogo, precios e inventario de tu negocio.
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
          <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
            <Plus />
            Nuevo producto
          </Button>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="lg:max-w-sm lg:flex-1">
          <Input
            leadingIcon={<Search />}
            placeholder="Buscar por código, código de barras o nombre..."
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
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            aria-label="Filtrar por estado"
          >
            <option value="all">Estado</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </Select>
          <Select
            value={stock}
            onChange={(e) => setStock(e.target.value as StockFilter)}
            aria-label="Filtrar por stock"
          >
            <option value="all">Stock</option>
            <option value="ok">Disponible</option>
            <option value="low">Bajo</option>
            <option value="out">Agotado</option>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Imagen</TableHead>
            <TableHead>Código</TableHead>
            <TableHead className="hidden lg:table-cell">Código de barras</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead className="hidden md:table-cell">Categoría</TableHead>
            <TableHead className="hidden xl:table-cell">Marca</TableHead>
            <TableHead className="text-right">P. Compra</TableHead>
            <TableHead className="text-right">P. Venta</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <ProductThumb product={p} />
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{p.code}</TableCell>
              <TableCell className="hidden font-mono text-xs text-muted-foreground lg:table-cell">
                {p.barcode}
              </TableCell>
              <TableCell className="font-medium text-foreground">{p.name}</TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="neutral" size="sm">
                  {p.category}
                </Badge>
              </TableCell>
              <TableCell className="hidden text-muted-foreground xl:table-cell">{p.brand}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {formatCurrency(p.purchasePrice)}
              </TableCell>
              <TableCell className="text-right tabular-nums font-medium text-foreground">
                {formatCurrency(p.salePrice)}
              </TableCell>
              <TableCell>
                <StockCell product={p} />
              </TableCell>
              <TableCell>
                <Badge variant={p.status === 'activo' ? 'success' : 'neutral'} size="sm" dot>
                  {p.status === 'activo' ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-0.5">
                  <ActionButton label="Ver" onClick={() => showToast(`Viendo "${p.name}"`)}>
                    <Eye />
                  </ActionButton>
                  <ActionButton label="Editar" onClick={() => showToast(`Editando "${p.name}"`)}>
                    <Pencil />
                  </ActionButton>
                  <ActionButton label="Duplicar" onClick={() => handleDuplicate(p)}>
                    <Copy />
                  </ActionButton>
                  <ActionButton label="Eliminar" danger onClick={() => setToDelete(p)}>
                    <Trash2 />
                  </ActionButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={11}>
                <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <Package className="size-6 text-muted-foreground" aria-hidden />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    No se encontraron productos
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ajusta la búsqueda o los filtros aplicados.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* New product modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nuevo producto"
        description="Completa la información para agregarlo al catálogo."
        className="max-w-3xl"
      >
        <ProductForm onCancel={() => setCreateOpen(false)} onSubmit={handleCreate} />
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Eliminar producto"
        description={
          toDelete
            ? `¿Seguro que deseas eliminar "${toDelete.name}"? Esta acción no se puede deshacer.`
            : undefined
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              <Trash2 />
              Eliminar
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
          <span className="size-1.5 rounded-full bg-success" aria-hidden />
          {toast}
        </div>
      )}
    </div>
  )
}
