'use client'

import * as React from 'react'
import {
  Plus,
  Upload,
  Download,
  RefreshCw,
  Search,
  Users,
  UserCheck,
  Wallet,
  CircleDollarSign,
  Eye,
  Pencil,
  History,
  Power,
  Trash2,
  UserX,
  XCircle,
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
import { EntityAvatar } from '@/components/jeralpos/avatar'
import { SortButton } from '@/components/jeralpos/sort-button'
import { RowActionsMenu } from '@/components/jeralpos/row-actions'
import { Pagination } from '@/components/jeralpos/pagination'
import { DataToast } from '@/components/jeralpos/data-toast'
import { cn } from '@/lib/utils'
import {
  customers as seedCustomers,
  cities,
  customerInitials,
  customerTypeLabel,
  formatCurrency,
  getCustomerSummary,
  statusLabel,
  statusVariant,
  type Customer,
  type CustomerStatus,
  type CustomerType,
} from './mock-data'
import { CustomerForm } from './customer-form'
import { CustomerProfile } from './customer-profile'

type SortKey = 'displayName' | 'city' | 'purchaseCount' | 'balance'
type SortDir = 'asc' | 'desc'
type ToastKind = 'success' | 'error'
const PAGE_SIZE = 6

function CustomerCell({ customer }: { customer: Customer }) {
  return (
    <div className="flex items-center gap-3">
      <EntityAvatar initials={customerInitials(customer)} color={customer.color} />
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{customer.displayName}</p>
        <p className="truncate text-xs text-muted-foreground">
          {customerTypeLabel[customer.type]}
        </p>
      </div>
    </div>
  )
}

export function Clientes() {
  const [items, setItems] = React.useState<Customer[]>(seedCustomers)
  const [loading, setLoading] = React.useState(true)

  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState<CustomerStatus | 'all'>('all')
  const [type, setType] = React.useState<CustomerType | 'all'>('all')
  const [city, setCity] = React.useState('all')

  const [sortKey, setSortKey] = React.useState<SortKey>('displayName')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Customer | null>(null)
  const [profile, setProfile] = React.useState<Customer | null>(null)
  const [toDelete, setToDelete] = React.useState<Customer | null>(null)
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

  const summary = React.useMemo(() => getCustomerSummary(items), [items])

  const indicators: Indicator[] = React.useMemo(
    () => [
      {
        id: 'total',
        icon: Users,
        label: 'Total clientes',
        value: String(summary.total),
        description: 'Registrados en el sistema',
        tone: 'primary',
        trend: 'up',
        comparison: '+3 este mes',
      },
      {
        id: 'active',
        icon: UserCheck,
        label: 'Clientes activos',
        value: String(summary.active),
        description: `${Math.round((summary.active / Math.max(summary.total, 1)) * 100)}% del total`,
        tone: 'success',
        trend: 'up',
        comparison: '+1.4%',
      },
      {
        id: 'withBalance',
        icon: Wallet,
        label: 'Clientes con cartera',
        value: String(summary.withBalance),
        description: 'Con saldo pendiente',
        tone: 'warning',
        trend: 'flat',
        comparison: 'Estable',
      },
      {
        id: 'pending',
        icon: CircleDollarSign,
        label: 'Cartera pendiente',
        value: formatCurrency(summary.pendingBalance),
        description: 'Por cobrar en total',
        tone: 'danger',
        trend: 'down',
        comparison: '-2.1%',
      },
    ],
    [summary],
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = items.filter((c) => {
      if (q) {
        const hit =
          c.displayName.toLowerCase().includes(q) ||
          c.document.toLowerCase().includes(q) ||
          c.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
          c.mobile.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
          c.email.toLowerCase().includes(q)
        if (!hit) return false
      }
      if (status !== 'all' && c.status !== status) return false
      if (type !== 'all' && c.type !== type) return false
      if (city !== 'all' && c.city !== city) return false
      return true
    })

    const sorted = [...result].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'displayName') cmp = a.displayName.localeCompare(b.displayName)
      else if (sortKey === 'city') cmp = a.city.localeCompare(b.city)
      else if (sortKey === 'purchaseCount') cmp = a.purchaseCount - b.purchaseCount
      else if (sortKey === 'balance') cmp = a.balance - b.balance
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [items, query, status, type, city, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  React.useEffect(() => {
    setPage(1)
  }, [query, status, type, city])

  const hasFilters = query !== '' || status !== 'all' || type !== 'all' || city !== 'all'

  const clearFilters = () => {
    setQuery('')
    setStatus('all')
    setType('all')
    setCity('all')
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const pageIds = paged.map((c) => c.id)
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

  const handleToggleStatus = (c: Customer) => {
    setItems((prev) =>
      prev.map((x) =>
        x.id === c.id
          ? { ...x, status: x.status === 'activo' ? 'inactivo' : 'activo' }
          : x,
      ),
    )
    showToast(
      `${c.displayName} ${c.status === 'activo' ? 'desactivado' : 'activado'}`,
    )
  }

  const handleConfirmDelete = () => {
    if (!toDelete) return
    setItems((prev) => prev.filter((c) => c.id !== toDelete.id))
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(toDelete.id)
      return next
    })
    showToast(`Cliente "${toDelete.displayName}" eliminado`)
    setToDelete(null)
  }

  const handleBulkDelete = () => {
    setItems((prev) => prev.filter((c) => !selected.has(c.id)))
    showToast(`${selected.size} clientes eliminados`)
    setSelected(new Set())
    setBulkDelete(false)
  }

  const handleCreate = (name: string) => {
    setCreateOpen(false)
    showToast(`Cliente "${name}" creado`)
  }

  const handleEditSave = (name: string) => {
    setEditing(null)
    showToast(`Cliente "${name}" actualizado`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administra la información y el historial comercial de tus clientes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="md" onClick={() => showToast('Importación iniciada')}>
            <Upload />
            Importar
          </Button>
          <Button variant="outline" size="md" onClick={() => showToast('Exportando clientes...')}>
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
          <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
            <Plus />
            Nuevo cliente
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {indicators.map((ind) => (
          <IndicatorCard key={ind.id} indicator={ind} />
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="lg:max-w-sm lg:flex-1">
          <Input
            leadingIcon={<Search />}
            placeholder="Buscar por nombre, documento, teléfono o correo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar clientes"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:ml-auto lg:flex lg:items-center">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as CustomerStatus | 'all')}
            aria-label="Filtrar por estado"
          >
            <option value="all">Estado</option>
            {(Object.keys(statusLabel) as CustomerStatus[]).map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </Select>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as CustomerType | 'all')}
            aria-label="Filtrar por tipo de cliente"
          >
            <option value="all">Tipo</option>
            {(Object.keys(customerTypeLabel) as CustomerType[]).map((t) => (
              <option key={t} value={t}>
                {customerTypeLabel[t]}
              </option>
            ))}
          </Select>
          <Select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            aria-label="Filtrar por ciudad"
          >
            <option value="all">Ciudad</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="md" onClick={clearFilters} className="sm:col-span-3 lg:col-auto">
              <XCircle />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Results / bulk bar */}
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
            {filtered.length} {filtered.length === 1 ? 'cliente' : 'clientes'}
          </span>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={toggleSelectAll}
                  aria-label="Seleccionar todos"
                  className="size-4 cursor-pointer rounded border-border accent-primary"
                />
              </TableHead>
              <TableHead>
                <SortButton
                  label="Cliente"
                  active={sortKey === 'displayName'}
                  dir={sortDir}
                  onClick={() => toggleSort('displayName')}
                />
              </TableHead>
              <TableHead className="hidden md:table-cell">Documento</TableHead>
              <TableHead className="hidden xl:table-cell">Teléfono</TableHead>
              <TableHead className="hidden 2xl:table-cell">Correo</TableHead>
              <TableHead className="hidden lg:table-cell">
                <SortButton
                  label="Ciudad"
                  active={sortKey === 'city'}
                  dir={sortDir}
                  onClick={() => toggleSort('city')}
                />
              </TableHead>
              <TableHead className="hidden text-right sm:table-cell">
                <SortButton
                  label="Compras"
                  active={sortKey === 'purchaseCount'}
                  dir={sortDir}
                  onClick={() => toggleSort('purchaseCount')}
                  className="justify-end"
                />
              </TableHead>
              <TableHead className="text-right">
                <SortButton
                  label="Saldo"
                  active={sortKey === 'balance'}
                  dir={sortDir}
                  onClick={() => toggleSort('balance')}
                  className="justify-end"
                />
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((c) => (
              <TableRow key={c.id} data-selected={selected.has(c.id)}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggleSelect(c.id)}
                    aria-label={`Seleccionar ${c.displayName}`}
                    className="size-4 cursor-pointer rounded border-border accent-primary"
                  />
                </TableCell>
                <TableCell>
                  <CustomerCell customer={c} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="font-mono text-xs text-muted-foreground">
                    {c.documentType} {c.document}
                  </span>
                </TableCell>
                <TableCell className="hidden text-muted-foreground xl:table-cell">
                  {c.mobile}
                </TableCell>
                <TableCell className="hidden text-muted-foreground 2xl:table-cell">
                  {c.email}
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {c.city}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                  {c.purchaseCount}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right tabular-nums font-medium',
                    c.balance > 0 ? 'text-danger' : 'text-foreground',
                  )}
                >
                  {formatCurrency(c.balance)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[c.status]} size="sm" dot>
                    {statusLabel[c.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <RowActionsMenu
                    label={`Acciones para ${c.displayName}`}
                    actions={[
                      { label: 'Ver perfil', icon: Eye, onClick: () => setProfile(c) },
                      { label: 'Editar', icon: Pencil, onClick: () => setEditing(c) },
                      { label: 'Historial', icon: History, onClick: () => setProfile(c) },
                      {
                        label: c.status === 'activo' ? 'Desactivar' : 'Activar',
                        icon: Power,
                        onClick: () => handleToggleStatus(c),
                      },
                      {
                        label: 'Eliminar',
                        icon: Trash2,
                        onClick: () => setToDelete(c),
                        danger: true,
                        dividerBefore: true,
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}
            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={10}>
                  <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                      <UserX className="size-6 text-muted-foreground" aria-hidden />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      No se encontraron clientes
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {hasFilters
                        ? 'Ajusta la búsqueda o los filtros aplicados.'
                        : 'Comienza registrando tu primer cliente.'}
                    </p>
                    {hasFilters ? (
                      <Button variant="outline" size="sm" onClick={clearFilters} className="mt-1">
                        Limpiar filtros
                      </Button>
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)} className="mt-1">
                        <Plus />
                        Nuevo cliente
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
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      )}

      {/* New customer modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nuevo cliente"
        description="Completa la información para registrar al cliente."
        className="max-w-3xl"
      >
        <CustomerForm onCancel={() => setCreateOpen(false)} onSubmit={handleCreate} />
      </Modal>

      {/* Edit customer modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Editar cliente"
        description="Actualiza los datos del cliente seleccionado."
        className="max-w-3xl"
      >
        {editing && (
          <CustomerForm
            initial={editing}
            onCancel={() => setEditing(null)}
            onSubmit={handleEditSave}
          />
        )}
      </Modal>

      {/* Profile modal */}
      <Modal
        open={!!profile}
        onClose={() => setProfile(null)}
        className="max-w-4xl"
      >
        {profile && (
          <CustomerProfile
            customer={profile}
            onEdit={() => {
              setEditing(profile)
              setProfile(null)
            }}
          />
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Eliminar cliente"
        description={
          toDelete
            ? `¿Seguro que deseas eliminar a "${toDelete.displayName}"? Esta acción no se puede deshacer.`
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

      {/* Bulk delete confirmation */}
      <Modal
        open={bulkDelete}
        onClose={() => setBulkDelete(false)}
        title="Eliminar clientes"
        description={`¿Seguro que deseas eliminar ${selected.size} cliente${selected.size === 1 ? '' : 's'}? Esta acción no se puede deshacer.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setBulkDelete(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleBulkDelete}>
              <Trash2 />
              Eliminar {selected.size}
            </Button>
          </>
        }
      />

      {/* Toast */}
      {toast && <DataToast message={toast.msg} kind={toast.kind} />}
    </div>
  )
}
