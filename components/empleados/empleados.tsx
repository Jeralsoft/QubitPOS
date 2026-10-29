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
  UserX,
  KeyRound,
  Eye,
  Pencil,
  History,
  Power,
  Trash2,
  UsersRound,
  CheckCircle2,
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
  employees as seedEmployees,
  roles,
  branches,
  employeeInitials,
  formatCurrency,
  getEmployeeSummary,
  statusLabel,
  statusVariant,
  type Employee,
  type EmployeeStatus,
} from './mock-data'
import { EmployeeForm } from './employee-form'
import { EmployeeProfile } from './employee-profile'

type SortKey = 'fullName' | 'role' | 'branch' | 'salesTotal'
type SortDir = 'asc' | 'desc'
type ToastKind = 'success' | 'error'
const PAGE_SIZE = 6

function EmployeeCell({ employee }: { employee: Employee }) {
  return (
    <div className="flex items-center gap-3">
      <EntityAvatar initials={employeeInitials(employee)} color={employee.color} />
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{employee.fullName}</p>
        <p className="truncate text-xs text-muted-foreground">{employee.email}</p>
      </div>
    </div>
  )
}

export function Empleados() {
  const [items, setItems] = React.useState<Employee[]>(seedEmployees)
  const [loading, setLoading] = React.useState(true)

  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState<EmployeeStatus | 'all'>('all')
  const [role, setRole] = React.useState('all')
  const [branch, setBranch] = React.useState('all')

  const [sortKey, setSortKey] = React.useState<SortKey>('fullName')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Employee | null>(null)
  const [profile, setProfile] = React.useState<Employee | null>(null)
  const [toDelete, setToDelete] = React.useState<Employee | null>(null)
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

  const summary = React.useMemo(() => getEmployeeSummary(items), [items])

  const indicators: Indicator[] = React.useMemo(
    () => [
      {
        id: 'total',
        icon: Users,
        label: 'Total empleados',
        value: String(summary.total),
        description: 'Registrados en el sistema',
        tone: 'primary',
        trend: 'up',
        comparison: '+1 este mes',
      },
      {
        id: 'active',
        icon: UserCheck,
        label: 'Activos',
        value: String(summary.active),
        description: `${Math.round((summary.active / Math.max(summary.total, 1)) * 100)}% del total`,
        tone: 'success',
        trend: 'up',
        comparison: 'Operando',
      },
      {
        id: 'inactive',
        icon: UserX,
        label: 'Inactivos',
        value: String(summary.inactive),
        description: 'Sin acceso al sistema',
        tone: 'warning',
        trend: 'down',
        comparison: 'Contrato finalizado',
      },
      {
        id: 'withUser',
        icon: KeyRound,
        label: 'Con usuario',
        value: String(summary.withUser),
        description: 'Credenciales asignadas',
        tone: 'primary',
        trend: 'up',
        comparison: `${summary.total - summary.withUser} sin usuario`,
      },
    ],
    [summary],
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = items.filter((e) => {
      if (q) {
        const hit =
          e.fullName.toLowerCase().includes(q) ||
          e.document.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.username.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q)
        if (!hit) return false
      }
      if (status !== 'all' && e.status !== status) return false
      if (role !== 'all' && e.role !== role) return false
      if (branch !== 'all' && e.branch !== branch) return false
      return true
    })

    const sorted = [...result].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'fullName') cmp = a.fullName.localeCompare(b.fullName)
      else if (sortKey === 'role') cmp = a.role.localeCompare(b.role)
      else if (sortKey === 'branch') cmp = a.branch.localeCompare(b.branch)
      else if (sortKey === 'salesTotal') cmp = a.salesTotal - b.salesTotal
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [items, query, status, role, branch, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  React.useEffect(() => {
    setPage(1)
  }, [query, status, role, branch])

  const hasFilters = query !== '' || status !== 'all' || role !== 'all' || branch !== 'all'

  const clearFilters = () => {
    setQuery('')
    setStatus('all')
    setRole('all')
    setBranch('all')
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const pageIds = paged.map((e) => e.id)
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

  const handleToggleStatus = (e: Employee) => {
    setItems((prev) =>
      prev.map((x) =>
        x.id === e.id ? { ...x, status: x.status === 'activo' ? 'inactivo' : 'activo' } : x,
      ),
    )
    showToast(`${e.fullName} ${e.status === 'activo' ? 'desactivado' : 'activado'}`)
  }

  const handleConfirmDelete = () => {
    if (!toDelete) return
    setItems((prev) => prev.filter((e) => e.id !== toDelete.id))
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(toDelete.id)
      return next
    })
    showToast(`Empleado "${toDelete.fullName}" eliminado`)
    setToDelete(null)
  }

  const handleBulkDelete = () => {
    setItems((prev) => prev.filter((e) => !selected.has(e.id)))
    showToast(`${selected.size} empleados eliminados`)
    setSelected(new Set())
    setBulkDelete(false)
  }

  const handleCreate = (name: string) => {
    setCreateOpen(false)
    showToast(`Empleado "${name}" creado`)
  }

  const handleEditSave = (name: string) => {
    setEditing(null)
    showToast(`Empleado "${name}" actualizado`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Empleados</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administra el personal y los responsables de las operaciones.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="md" onClick={() => showToast('Importación iniciada')}>
            <Upload />
            Importar
          </Button>
          <Button variant="outline" size="md" onClick={() => showToast('Exportando empleados...')}>
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
            Nuevo empleado
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
            placeholder="Buscar por nombre, documento, cargo o correo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar empleados"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:ml-auto lg:flex lg:items-center">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as EmployeeStatus | 'all')}
            aria-label="Filtrar por estado"
          >
            <option value="all">Estado</option>
            {(Object.keys(statusLabel) as EmployeeStatus[]).map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </Select>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            aria-label="Filtrar por cargo"
          >
            <option value="all">Cargo</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
          <Select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            aria-label="Filtrar por sucursal"
          >
            <option value="all">Sucursal</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
          {hasFilters && (
            <Button
              variant="ghost"
              size="md"
              onClick={clearFilters}
              className="sm:col-span-3 lg:col-auto"
            >
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
            {filtered.length} {filtered.length === 1 ? 'empleado' : 'empleados'}
          </span>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <UsersRound className="size-8 text-muted-foreground" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">No se encontraron empleados</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ajusta los filtros o registra un nuevo empleado.
            </p>
          </div>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
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
                    label="Empleado"
                    active={sortKey === 'fullName'}
                    dir={sortDir}
                    onClick={() => toggleSort('fullName')}
                  />
                </TableHead>
                <TableHead className="hidden md:table-cell">Documento</TableHead>
                <TableHead className="hidden lg:table-cell">
                  <SortButton
                    label="Cargo"
                    active={sortKey === 'role'}
                    dir={sortDir}
                    onClick={() => toggleSort('role')}
                  />
                </TableHead>
                <TableHead className="hidden xl:table-cell">
                  <SortButton
                    label="Sucursal"
                    active={sortKey === 'branch'}
                    dir={sortDir}
                    onClick={() => toggleSort('branch')}
                  />
                </TableHead>
                <TableHead className="hidden 2xl:table-cell">Teléfono</TableHead>
                <TableHead className="hidden 2xl:table-cell">Usuario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((e) => (
                <TableRow key={e.id} data-selected={selected.has(e.id)}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.has(e.id)}
                      onChange={() => toggleSelect(e.id)}
                      aria-label={`Seleccionar ${e.fullName}`}
                      className="size-4 cursor-pointer rounded border-border accent-primary"
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setProfile(e)}
                      className="text-left transition-opacity hover:opacity-80"
                    >
                      <EmployeeCell employee={e} />
                    </button>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                    {e.documentType} {e.document}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="neutral" size="sm">
                      {e.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground xl:table-cell">
                    {e.branch}
                  </TableCell>
                  <TableCell className="hidden tabular-nums text-muted-foreground 2xl:table-cell">
                    {e.mobile}
                  </TableCell>
                  <TableCell className="hidden 2xl:table-cell">
                    {e.hasUser ? (
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground">
                        <CheckCircle2 className="size-3.5 text-success" aria-hidden />
                        {e.username}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sin usuario</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[e.status]} size="sm" dot>
                      {statusLabel[e.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                  <RowActionsMenu
                    label={`Acciones para ${e.fullName}`}
                    actions={[
                      { label: 'Ver perfil', icon: Eye, onClick: () => setProfile(e) },
                      { label: 'Editar', icon: Pencil, onClick: () => setEditing(e) },
                      { label: 'Actividad', icon: History, onClick: () => setProfile(e) },
                      {
                        label: e.status === 'activo' ? 'Desactivar' : 'Activar',
                        icon: Power,
                        onClick: () => handleToggleStatus(e),
                      },
                      {
                        label: 'Eliminar',
                        icon: Trash2,
                        onClick: () => setToDelete(e),
                        danger: true,
                        dividerBefore: true,
                      },
                    ]}
                  />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nuevo empleado"
        description="Registra un nuevo miembro del personal."
        className="sm:max-w-2xl"
      >
        <EmployeeForm onCancel={() => setCreateOpen(false)} onSubmit={handleCreate} />
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Editar empleado"
        description="Actualiza la información del empleado."
        className="sm:max-w-2xl"
      >
        {editing && (
          <EmployeeForm initial={editing} onCancel={() => setEditing(null)} onSubmit={handleEditSave} />
        )}
      </Modal>

      {/* Profile modal */}
      <Modal
        open={!!profile}
        onClose={() => setProfile(null)}
        title="Perfil del empleado"
        className="sm:max-w-4xl"
      >
        {profile && (
          <EmployeeProfile
            employee={profile}
            onEdit={() => {
              const current = profile
              setProfile(null)
              setEditing(current)
            }}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Eliminar empleado"
        className="sm:max-w-md"
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">
            ¿Seguro que deseas eliminar a{' '}
            <span className="font-medium text-foreground">{toDelete?.fullName}</span>? Esta acción no
            se puede deshacer.
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              <Trash2 />
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk delete confirm */}
      <Modal
        open={bulkDelete}
        onClose={() => setBulkDelete(false)}
        title="Eliminar empleados"
        className="sm:max-w-md"
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">
            ¿Seguro que deseas eliminar{' '}
            <span className="font-medium text-foreground">{selected.size}</span> empleados
            seleccionados? Esta acción no se puede deshacer.
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkDelete(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleBulkDelete}>
              <Trash2 />
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && <DataToast message={toast.msg} kind={toast.kind} position="bottom-center" />}
    </div>
  )
}
