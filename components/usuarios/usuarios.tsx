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
  MoreHorizontal,
  Pencil,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  FileX,
  ShieldCheck,
  History,
  CheckCircle2,
  AlertCircle,
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
} from '@/components/jeralpos/table'
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

const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'roles', label: 'Roles y permisos', icon: ShieldCheck },
  { id: 'seguridad', label: 'Seguridad', icon: Lock },
  { id: 'auditoria', label: 'Auditoría', icon: History },
]

function RowActions({
  user,
  onEdit,
  onToggleBlock,
  onResetPassword,
  onToggleStatus,
  onDelete,
}: {
  user: AppUser
  onEdit: () => void
  onToggleBlock: () => void
  onResetPassword: () => void
  onToggleStatus: () => void
  onDelete: () => void
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
  const blocked = user.status === 'bloqueado'

  return (
    <div className="relative flex justify-end" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Acciones para ${user.username}`}
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-4"
      >
        <MoreHorizontal />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 z-20 w-52 rounded-lg border border-border bg-card p-1 shadow-lg animate-in fade-in zoom-in-95 duration-100"
        >
          <button role="menuitem" className={item} onClick={act(onEdit)}>
            <Pencil />
            Editar usuario
          </button>
          <button role="menuitem" className={item} onClick={act(onResetPassword)}>
            <KeyRound />
            Restablecer contraseña
          </button>
          <button role="menuitem" className={item} onClick={act(onToggleStatus)}>
            {user.status === 'activo' ? <UserX /> : <UserCheck />}
            {user.status === 'activo' ? 'Desactivar' : 'Activar'}
          </button>
          <button role="menuitem" className={item} onClick={act(onToggleBlock)}>
            {blocked ? <Unlock /> : <Lock />}
            {blocked ? 'Desbloquear' : 'Bloquear'}
          </button>
          <div className="my-1 h-px bg-border" />
          <button
            role="menuitem"
            className={cn(item, 'text-danger [&_svg]:text-danger hover:bg-danger-muted')}
            onClick={act(onDelete)}
          >
            <Trash2 />
            Eliminar
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
          {Array.from({ length: 8 }).map((_, i) => (
            <TableHead key={i}>
              <span className="sr-only">Cargando</span>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 8 }).map((_, r) => (
          <TableRow key={r}>
            {Array.from({ length: 8 }).map((_, c) => (
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

export function Usuarios() {
  const [tab, setTab] = React.useState<Tab>('usuarios')
  const [items, setItems] = React.useState<AppUser[]>(seedUsers)
  const [loading, setLoading] = React.useState(true)

  const [query, setQuery] = React.useState('')
  const [roleFilter, setRoleFilter] = React.useState<RoleId | 'all'>('all')
  const [branchFilter, setBranchFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<UserStatus | 'all'>('all')

  const [createOpen, setCreateOpen] = React.useState(false)
  const [toast, setToast] = React.useState<{ msg: string; kind: ToastKind } | null>(null)

  React.useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 650)
    return () => window.clearTimeout(t)
  }, [])

  const showToast = React.useCallback((msg: string, kind: ToastKind = 'success') => {
    setToast({ msg, kind })
    window.setTimeout(() => setToast(null), 2800)
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
        description: 'Conectados ahora',
        tone: 'primary',
        trend: 'up',
        comparison: 'En línea',
      },
    ],
    [summary],
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((u) => {
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
  }, [items, query, roleFilter, branchFilter, statusFilter])

  const hasFilters =
    query !== '' || roleFilter !== 'all' || branchFilter !== 'all' || statusFilter !== 'all'
  const clearFilters = () => {
    setQuery('')
    setRoleFilter('all')
    setBranchFilter('all')
    setStatusFilter('all')
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

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Usuarios y Seguridad
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administra usuarios, roles, permisos y la seguridad del sistema.
          </p>
        </div>
        {tab === 'usuarios' && (
          <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
            <UserPlus />
            Crear usuario
          </Button>
        )}
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
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
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
          {/* Filters */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <Label htmlFor="u-search">Buscar</Label>
                <Input
                  id="u-search"
                  leadingIcon={<Search />}
                  placeholder="Usuario, empleado o correo"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="u-role">Rol</Label>
                <Select
                  id="u-role"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as RoleId | 'all')}
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
                  onChange={(e) => setBranchFilter(e.target.value)}
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
                  onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'all')}
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

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filtered.length} {filtered.length === 1 ? 'usuario' : 'usuarios'}
            </span>
          </div>

          {/* Table */}
          {loading ? (
            <TableSkeleton />
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="hidden lg:table-cell">Empleado</TableHead>
                  <TableHead className="hidden xl:table-cell">Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="hidden md:table-cell">Sucursal</TableHead>
                  <TableHead className="hidden lg:table-cell">Último acceso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => {
                  const role = roles.find((r) => r.id === u.roleId)
                  const st = statusConfig[u.status]
                  return (
                    <TableRow key={u.id}>
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
                        <RowActions
                          user={u}
                          onEdit={() => showToast(`Editar ${u.username} (demo)`)}
                          onResetPassword={() =>
                            showToast(`Enlace de restablecimiento enviado a ${u.email}`)
                          }
                          onToggleStatus={() => {
                            const next = u.status === 'activo' ? 'inactivo' : 'activo'
                            updateUser(u.id, { status: next })
                            showToast(
                              `${u.username} ${next === 'activo' ? 'activado' : 'desactivado'}`,
                            )
                          }}
                          onToggleBlock={() => {
                            const next = u.status === 'bloqueado' ? 'activo' : 'bloqueado'
                            updateUser(u.id, {
                              status: next,
                              failedAttempts: next === 'activo' ? 0 : u.failedAttempts,
                            })
                            showToast(
                              `${u.username} ${next === 'bloqueado' ? 'bloqueado' : 'desbloqueado'}`,
                            )
                          }}
                          onDelete={() => {
                            setItems((prev) => prev.filter((x) => x.id !== u.id))
                            showToast(`Usuario ${u.username} eliminado`, 'error')
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
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

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 shadow-lg animate-in fade-in slide-in-from-bottom-2"
          role="status"
        >
          {toast.kind === 'success' ? (
            <CheckCircle2 className="size-5 text-success" aria-hidden />
          ) : (
            <AlertCircle className="size-5 text-danger" aria-hidden />
          )}
          <span className="text-sm font-medium text-foreground">{toast.msg}</span>
        </div>
      )}
    </div>
  )
}
