'use client'

import * as React from 'react'
import { Save, RotateCcw, Users } from 'lucide-react'
import { Card } from '@/components/jeralpos/card'
import { Badge } from '@/components/jeralpos/badge'
import { Button } from '@/components/jeralpos/button'
import { cn } from '@/lib/utils'
import {
  roles as seedRoles,
  modules,
  actions,
  actionLabel,
  roleToneVariant,
  users,
  type Role,
  type RoleId,
  type ModuleKey,
  type PermissionAction,
  type PermissionMatrix,
} from './mock-data'

function clonePermissions(p: PermissionMatrix): PermissionMatrix {
  return modules.reduce((acc, m) => {
    acc[m.key] = { ...p[m.key] }
    return acc
  }, {} as PermissionMatrix)
}

function countGrants(p: PermissionMatrix): number {
  return modules.reduce(
    (sum, m) => sum + actions.filter((a) => p[m.key][a]).length,
    0,
  )
}

export function PermissionsMatrix({
  onToast,
}: {
  onToast: (msg: string) => void
}) {
  const [activeRole, setActiveRole] = React.useState<RoleId>('administrador')
  const [matrices, setMatrices] = React.useState<Record<RoleId, PermissionMatrix>>(() =>
    seedRoles.reduce(
      (acc, r) => {
        acc[r.id] = clonePermissions(r.permissions)
        return acc
      },
      {} as Record<RoleId, PermissionMatrix>,
    ),
  )
  const [dirty, setDirty] = React.useState(false)

  const role = seedRoles.find((r) => r.id === activeRole) as Role
  const matrix = matrices[activeRole]

  const usersInRole = React.useMemo(
    () => users.filter((u) => u.roleId === activeRole).length,
    [activeRole],
  )

  const toggle = (mod: ModuleKey, action: PermissionAction) => {
    setMatrices((prev) => {
      const next = { ...prev, [activeRole]: clonePermissions(prev[activeRole]) }
      next[activeRole][mod][action] = !next[activeRole][mod][action]
      return next
    })
    setDirty(true)
  }

  const toggleModuleAll = (mod: ModuleKey, value: boolean) => {
    setMatrices((prev) => {
      const next = { ...prev, [activeRole]: clonePermissions(prev[activeRole]) }
      actions.forEach((a) => {
        next[activeRole][mod][a] = value
      })
      return next
    })
    setDirty(true)
  }

  const reset = () => {
    setMatrices((prev) => ({
      ...prev,
      [activeRole]: clonePermissions(role.permissions),
    }))
    setDirty(false)
    onToast(`Permisos de ${role.name} restablecidos`)
  }

  const save = () => {
    setDirty(false)
    onToast(`Permisos de ${role.name} guardados`)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      {/* Roles list */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Roles del sistema
          </h3>
          <Badge variant="neutral" size="sm">
            {seedRoles.length}
          </Badge>
        </div>
        <div className="flex flex-col gap-2">
          {seedRoles.map((r) => {
            const RoleIcon = r.icon
            const isActive = r.id === activeRole
            const grants = countGrants(matrices[r.id])
            const count = users.filter((u) => u.roleId === r.id).length
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveRole(r.id)}
                className={cn(
                  'group flex items-start gap-3 rounded-xl border p-3 text-left transition-all',
                  isActive
                    ? 'border-primary bg-info-muted shadow-sm'
                    : 'border-border bg-card hover:border-primary/40 hover:bg-accent/50',
                )}
              >
                <span
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-lg [&_svg]:size-4.5',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                  aria-hidden
                >
                  <RoleIcon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        'truncate text-sm font-semibold',
                        isActive ? 'text-primary' : 'text-foreground',
                      )}
                    >
                      {r.name}
                    </p>
                    {r.system && (
                      <Badge variant="neutral" size="sm">
                        Sistema
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {r.description}
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users className="size-3" aria-hidden />
                      {count} {count === 1 ? 'usuario' : 'usuarios'}
                    </span>
                    <span>{grants} permisos</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Matrix */}
      <Card className="flex flex-col overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className={cn('grid size-10 place-items-center rounded-xl', 'bg-info-muted text-primary')}
              aria-hidden
            >
              <role.icon className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  {role.name}
                </h3>
                <Badge variant={roleToneVariant[role.tone]} size="sm">
                  {usersInRole} {usersInRole === 1 ? 'usuario' : 'usuarios'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Matriz de permisos por módulo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={reset} disabled={!dirty}>
              <RotateCcw />
              Restablecer
            </Button>
            <Button variant="primary" size="sm" onClick={save} disabled={!dirty}>
              <Save />
              Guardar cambios
            </Button>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/60">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Módulo
                </th>
                {actions.map((a) => (
                  <th
                    key={a}
                    className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {actionLabel[a]}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Todo
                </th>
              </tr>
            </thead>
            <tbody>
              {modules.map((m) => {
                const row = matrix[m.key]
                const allOn = actions.every((a) => row[a])
                return (
                  <tr
                    key={m.key}
                    className="border-b border-border last:border-0 transition-colors hover:bg-accent/40"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{m.label}</td>
                    {actions.map((a) => (
                      <td key={a} className="px-3 py-3 text-center">
                        <label className="inline-flex cursor-pointer items-center justify-center">
                          <input
                            type="checkbox"
                            checked={row[a]}
                            onChange={() => toggle(m.key, a)}
                            className="size-4.5 rounded border-border text-primary accent-primary"
                            aria-label={`${actionLabel[a]} ${m.label}`}
                          />
                        </label>
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleModuleAll(m.key, !allOn)}
                        className={cn(
                          'text-xs font-medium transition-colors',
                          allOn
                            ? 'text-danger hover:text-danger/80'
                            : 'text-primary hover:text-primary/80',
                        )}
                      >
                        {allOn ? 'Quitar' : 'Todo'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
