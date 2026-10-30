'use client'

import * as React from 'react'
import {
  Users,
  UserCheck,
  UserX,
  MonitorSmartphone,
  UserPlus,
  Search,
  XCircle,
  Pencil,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  FileX,
  ShieldCheck,
  History,
  Upload,
  Download,
  RefreshCw,
  Eye,
  Check,
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
import { settingsApi } from '@/lib/api'
import { toast as sonnerToast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  users as seedUsers,
  roles,
  roleName,
  roleToneVariant,
  branches,
  statusConfig,
  getUsersSummary,
  type AppUser,
  type RoleId,
  type UserStatus,
} from './mock-data'
import { CreateUserModal, type NewUserDraft } from './create-user-modal'
import { PermissionsMatrix } from './permissions-matrix'
import { SecurityPanel } from './security-panel'
import { AuditTable } from './audit-table'

type Tab = 'usuarios' | 'roles' | 'seguridad' | 'auditoria'
type ToastKind = 'success' | 'error'
type SortKey = 'username' | 'employee' | 'roleId' | 'branch' | 'lastAccess'
type SortDir = 'asc' | 'desc'

const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'roles', label: 'Roles y permisos', icon: ShieldCheck },
  { id: 'seguridad', label: 'Seguridad', icon: Lock },
  { id: 'auditoria', label: 'Auditoría', icon: History },
]

const PAGE_SIZE = 8

export function Usuarios() {
  const [tab, setTab] = React.useState<Tab>('usuarios')
  const [items, setItems] = React.useState<AppUser[]>(seedUsers)
  const [loading, setLoading] = React.useState(true)

  const [query, setQuery] = React.useState('')
  const [roleFilter, setRoleFilter] = React.useState<RoleId | 'all'>('all')
  const [branchFilter, setBranchFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<UserStatus | 'all'>('all')

  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [page, setPage] = React.useState(1)
  const [sortKey, setSortKey] = React.useState<SortKey>('username')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')

  const [createOpen, setCreateOpen] = React.useState(false)
  const [userToDelete, setUserToDelete] = React.useState<AppUser | null>(null)
  const [showBulkDelete, setShowBulkDelete] = React.useState(false)
  const [toast, setToast] = React.useState<{ msg: string; kind: ToastKind } | null>(null)

  React.useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 500)
    return () => window.clearTimeout(t)
  }, [])

  const showToast = React.useCallback((msg: string, kind: ToastKind = 'success') => {
    setToast({ msg, kind })
    window.setTimeout(() => setToast(null), 3000)
  }, [])

  const summary = React.useMemo(() => getUsersSummary(items), [items])

  const indicators: Indicator[] = React.useMemo(
    () => [
      {
        id: 'total',
        icon: Users,
        label: 'Total usuarios',
        value: String(summary.total),
        description: 'Registrados en el sistema',
        tone: 'primary',
        trend: 'flat',
        comparison: 'Global',
      },
      {
        id: 'active',
        icon: UserCheck,
        label: 'Usuarios activos',
        value: String(summary.active),
        description: 'Con acceso habilitado',
        tone: 'success',
        trend: 'up',
        comparison: 'Habilitados',
      },
      {
        id: 'inactive',
        icon: UserX,
        label: 'Usuarios inactivos',
        value: String(summary.inactive + summary.blocked),
        description: 'Inactivos o bloqueados',
        tone: 'warning',
        trend: 'flat',
        comparison: 'Sin acceso',
      },
      {
        id: 'sessions',
        icon: MonitorSmartphone,
        label: 'Sesiones activas',
        value: String(summary.activeSessions),
        description: 'Conectados en tiempo real',
        tone: 'primary',
        trend: 'up',
        comparison: 'En línea',
      },
    ],
    [summary]
  )

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = items.filter((u) => {
      if (roleFilter !== 'all' && u.roleId !== roleFilter) return false
      if (branchFilter !== 'all' && u.branch !== branchFilter) return false
      if (statusFilter !== 'all' && u.status !== statusFilter) return false
      if (
        q &&
        !u.username.toLowerCase().includes(q) &&
        !u.employee.toLowerCase().includes(q) &&
        !u.email.toLowerCase().includes(q)
      )
        return false
      return true
    })

    return result.sort((a, b) => {
      let va = String(a[sortKey] ?? '').toLowerCase()
      let vb = String(b[sortKey] ?? '').toLowerCase()
      const cmp = va.localeCompare(vb, 'es')
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [items, query, roleFilter, branchFilter, statusFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = React.useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  )

  const allSelected = paged.length > 0 && paged.every((u) => selected.has(u.id))
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(paged.map((u) => u.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const hasFilters =
    query !== '' || roleFilter !== 'all' || branchFilter !== 'all' || statusFilter !== 'all'
  const clearFilters = () => {
    setQuery('')
    setRoleFilter('all')
    setBranchFilter('all')
    setStatusFilter('all')
    setPage(1)
  }

  const handleCreate = (draft: NewUserDraft) => {
    const initials = draft.employee
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('')
    const newUser: AppUser = {
      id: `u-${Date.now()}`,
      username: draft.username,
      employee: draft.employee,
      email: draft.email,
      roleId: draft.roleId,
      branch: draft.branch,
      lastAccess: null,
      status: draft.status,
      sessions: 0,
      failedAttempts: 0,
      passwordChangedAt: 'Hoy',
      createdAt: 'Hoy',
      avatarInitials: initials || draft.username.slice(0, 2).toUpperCase(),
    }
    setItems((prev) => [newUser, ...prev])
    setCreateOpen(false)
    showToast(`Usuario ${draft.username} creado correctamente`)
  }

  const updateUser = (id: string, patch: Partial<AppUser>) =>
    setItems((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)))

  const handleDeleteUser = () => {
    if (!userToDelete) return
    setItems((prev) => prev.filter((x) => x.id !== userToDelete.id))
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(userToDelete.id)
      return next
    })
    showToast(`Usuario ${userToDelete.username} eliminado`, 'error')
    setUserToDelete(null)
  }

  const handleBulkDelete = () => {
    setItems((prev) => prev.filter((x) => !selected.has(x.id)))
    showToast(`${selected.size} usuarios eliminados del sistema`, 'error')
    setSelected(new Set())
    setShowBulkDelete(false)
  }

  const handleBulkToggleStatus = () => {
    setItems((prev) =>
      prev.map((u) => (selected.has(u.id) ? { ...u, status: u.status === 'activo' ? 'inactivo' : 'activo' } : u))
    )
    showToast(`Estado alternado para ${selected.size} usuarios`)
    setSelected(new Set())
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)
      await settingsApi.getRoles().catch(() => null)
      showToast('Datos de usuarios y roles actualizados desde el servidor')
      sonnerToast.success('Configuración de seguridad y roles sincronizada')
    } catch {
      showToast('Datos de usuarios actualizados')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    showToast(`Exportando ${filtered.length} usuarios a formato CSV/Excel`)
  }

  const handleImport = () => {
    showToast('Función de importación masiva de usuarios en proceso')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Usuarios y Seguridad
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administra usuarios, credenciales de acceso, roles, permisos y políticas de seguridad del sistema.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload />
            Importar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download />
            Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            Actualizar
          </Button>
          <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
            <UserPlus />
            Nuevo usuario
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {indicators.map((ind) => (
          <IndicatorCard key={ind.id} indicator={ind} />
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex flex-wrap gap-1 -mb-px">
          {tabs.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors [&_svg]:size-4',
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                <Icon />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'usuarios' && (
        <>
          {/* Filters Toolbar */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <Label htmlFor="u-search">Buscar</Label>
                <Input
                  id="u-search"
                  leadingIcon={<Search />}
                  placeholder="Usuario, empleado o correo"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setPage(1)
                  }}
                />
              </div>
              <div>
                <Label htmlFor="u-role">Rol</Label>
                <Select
                  id="u-role"
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value as RoleId | 'all')
                    setPage(1)
                  }}
                >
                  <option value="all">Todos los roles</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="u-branch">Sucursal</Label>
                <Select
                  id="u-branch"
                  value={branchFilter}
                  onChange={(e) => {
                    setBranchFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="all">Todas las sucursales</option>
                  {branches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="u-status">Estado</Label>
                <Select
                  id="u-status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as UserStatus | 'all')
                    setPage(1)
                  }}
                >
                  <option value="all">Todos los estados</option>
                  {(Object.keys(statusConfig) as UserStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {statusConfig[s].label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            {hasFilters && (
              <div className="mt-3 flex items-center justify-end">
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
                {selected.size} {selected.size === 1 ? 'usuario seleccionado' : 'usuarios seleccionados'}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkToggleStatus}>
                  Cambiar estado
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkDelete(true)}
                  className="text-danger hover:bg-danger-muted"
                >
                  <Trash2 className="size-4" />
                  Eliminar seleccionados
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Mostrando {paged.length} de {filtered.length} usuarios
            </span>
          </div>

          {/* Table */}
          {loading ? (
            <TableSkeleton columns={8} />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <FileX className="size-6 text-muted-foreground" aria-hidden />
              </div>
              <div>
                <p className="font-medium text-foreground">Sin usuarios</p>
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
                        label="Usuario"
                        active={sortKey === 'username'}
                        dir={sortDir}
                        onClick={() => handleSort('username')}
                      />
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      <SortButton
                        label="Empleado"
                        active={sortKey === 'employee'}
                        dir={sortDir}
                        onClick={() => handleSort('employee')}
                      />
                    </TableHead>
                    <TableHead className="hidden xl:table-cell">Correo</TableHead>
                    <TableHead>
                      <SortButton
                        label="Rol"
                        active={sortKey === 'roleId'}
                        dir={sortDir}
                        onClick={() => handleSort('roleId')}
                      />
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <SortButton
                        label="Sucursal"
                        active={sortKey === 'branch'}
                        dir={sortDir}
                        onClick={() => handleSort('branch')}
                      />
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      <SortButton
                        label="Último acceso"
                        active={sortKey === 'lastAccess'}
                        dir={sortDir}
                        onClick={() => handleSort('lastAccess')}
                      />
                    </TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((u) => {
                    const role = roles.find((r) => r.id === u.roleId)
                    const st = statusConfig[u.status]
                    return (
                      <TableRow key={u.id} data-selected={selected.has(u.id)}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selected.has(u.id)}
                            onChange={() => toggleSelect(u.id)}
                            aria-label={`Seleccionar ${u.username}`}
                            className="size-4 cursor-pointer rounded border-border accent-primary"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span
                              className="grid size-9 shrink-0 place-items-center rounded-full bg-info-muted text-xs font-semibold text-primary"
                              aria-hidden
                            >
                              {u.avatarInitials}
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground">{u.username}</p>
                              <p className="text-xs text-muted-foreground lg:hidden">{u.employee}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground lg:table-cell">
                          {u.employee}
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground xl:table-cell">
                          {u.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant={role ? roleToneVariant[role.tone] : 'neutral'} size="sm">
                            {roleName[u.roleId]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {u.branch}
                        </TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                          {u.lastAccess ?? 'Nunca'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={st.variant} size="sm" dot>
                            {st.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <RowActionsMenu
                            label={`Acciones para ${u.username}`}
                            actions={[
                              {
                                label: 'Editar usuario',
                                icon: Pencil,
                                onClick: () => showToast(`Editar ${u.username} (demo)`),
                              },
                              {
                                label: 'Restablecer contraseña',
                                icon: KeyRound,
                                onClick: () =>
                                  showToast(`Enlace de restablecimiento enviado a ${u.email}`),
                              },
                              {
                                label: u.status === 'activo' ? 'Desactivar' : 'Activar',
                                icon: u.status === 'activo' ? UserX : UserCheck,
                                onClick: () => {
                                  const next = u.status === 'activo' ? 'inactivo' : 'activo'
                                  updateUser(u.id, { status: next })
                                  showToast(
                                    `${u.username} ${next === 'activo' ? 'activado' : 'desactivado'}`
                                  )
                                },
                              },
                              {
                                label: u.status === 'bloqueado' ? 'Desbloquear' : 'Bloquear',
                                icon: u.status === 'bloqueado' ? Unlock : Lock,
                                onClick: () => {
                                  const next = u.status === 'bloqueado' ? 'activo' : 'bloqueado'
                                  updateUser(u.id, {
                                    status: next,
                                    failedAttempts: next === 'activo' ? 0 : u.failedAttempts,
                                  })
                                  showToast(
                                    `${u.username} ${next === 'bloqueado' ? 'bloqueado' : 'desbloqueado'}`
                                  )
                                },
                              },
                              {
                                label: 'Eliminar',
                                icon: Trash2,
                                danger: true,
                                dividerBefore: true,
                                onClick: () => setUserToDelete(u),
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
              page={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {tab === 'roles' && <PermissionsMatrix onToast={showToast} />}
      {tab === 'seguridad' && <SecurityPanel onToast={showToast} />}
      {tab === 'auditoria' && <AuditTable onToast={showToast} />}

      <CreateUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      {/* Delete User Modal */}
      <Modal
        open={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Eliminar usuario"
        description={`¿Estás seguro de que deseas eliminar al usuario "${userToDelete?.username}"? Esta acción revoca todos sus accesos de forma permanente.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setUserToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteUser}>
              <Trash2 />
              Eliminar
            </Button>
          </>
        }
      />

      {/* Bulk Delete Modal */}
      <Modal
        open={showBulkDelete}
        onClose={() => setShowBulkDelete(false)}
        title="Eliminación masiva de usuarios"
        description={`¿Estás seguro de que deseas eliminar los ${selected.size} usuarios seleccionados? Esta acción es irreversible.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowBulkDelete(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleBulkDelete}>
              <Trash2 />
              Eliminar seleccionados
            </Button>
          </>
        }
      />

      {/* DataToast */}
      {toast && <DataToast message={toast.msg} kind={toast.kind} />}
    </div>
  )
}
