'use client'

import * as React from 'react'
import {
  Monitor,
  Smartphone,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/jeralpos/card'
import { Badge } from '@/components/jeralpos/badge'
import { Button } from '@/components/jeralpos/button'
import { cn } from '@/lib/utils'
import {
  activeSessions as seedSessions,
  loginAttempts,
  users,
  type ActiveSession,
} from './mock-data'

function SessionIcon({ device }: { device: string }) {
  const isMobile = /móvil|android|ios/i.test(device)
  const Icon = isMobile ? Smartphone : Monitor
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground" aria-hidden>
      <Icon className="size-4" />
    </span>
  )
}

export function SecurityPanel({ onToast }: { onToast: (msg: string) => void }) {
  const [sessions, setSessions] = React.useState<ActiveSession[]>(seedSessions)

  const blockedUsers = users.filter((u) => u.status === 'bloqueado')
  const failedToday = loginAttempts.filter((a) => a.result === 'fallido').length

  const closeSession = (id: string, user: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    onToast(`Sesión de ${user} cerrada`)
  }

  const closeAll = () => {
    const kept = sessions.filter((s) => s.current)
    setSessions(kept)
    onToast('Se cerraron todas las sesiones remotas')
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Security overview cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <span className="grid size-11 place-items-center rounded-xl bg-success-muted text-success" aria-hidden>
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{sessions.length}</p>
              <p className="text-sm text-muted-foreground">Sesiones activas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <span className="grid size-11 place-items-center rounded-xl bg-danger-muted text-danger" aria-hidden>
              <ShieldAlert className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{failedToday}</p>
              <p className="text-sm text-muted-foreground">Intentos fallidos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <span className="grid size-11 place-items-center rounded-xl bg-warning-muted text-warning-foreground" aria-hidden>
              <Lock className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{blockedUsers.length}</p>
              <p className="text-sm text-muted-foreground">Usuarios bloqueados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <span className="grid size-11 place-items-center rounded-xl bg-info-muted text-primary" aria-hidden>
              <KeyRound className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">90</p>
              <p className="text-sm text-muted-foreground">Días vig. contraseña</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Active sessions */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Sesiones activas</CardTitle>
              <CardDescription>Dispositivos con sesión abierta en el sistema.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={closeAll}>
              <LogOut />
              Cerrar remotas
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {sessions.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No hay sesiones activas.</p>
            ) : (
              sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <SessionIcon device={s.device} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{s.user}</p>
                      {s.current && (
                        <Badge variant="success" size="sm" dot>
                          Actual
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {s.device} · {s.location}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      IP {s.ip} · {s.started}
                    </p>
                  </div>
                  {!s.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger hover:bg-danger-muted hover:text-danger"
                      onClick={() => closeSession(s.id, s.user)}
                    >
                      Cerrar
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Blocked users + policy */}
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Bloqueo de usuarios</CardTitle>
              <CardDescription>Cuentas suspendidas por seguridad.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {blockedUsers.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No hay usuarios bloqueados.
                </p>
              ) : (
                blockedUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger-muted/40 p-3"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-danger/15 text-danger" aria-hidden>
                      <Lock className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{u.employee}</p>
                      <p className="text-xs text-muted-foreground">
                        {u.failedAttempts} intentos fallidos
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onToast(`${u.username} desbloqueado`)}>
                      <Unlock />
                      Desbloquear
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Políticas de contraseña</CardTitle>
              <CardDescription>Reglas activas para todos los usuarios.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {[
                'Mínimo 8 caracteres con mayúscula, número y símbolo',
                'Renovación obligatoria cada 90 días',
                'Bloqueo automático tras 5 intentos fallidos',
                'No reutilizar las últimas 5 contraseñas',
              ].map((rule) => (
                <div key={rule} className="flex items-start gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  <span>{rule}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Login attempts */}
      <Card>
        <CardHeader>
          <CardTitle>Intentos de acceso</CardTitle>
          <CardDescription>Registro reciente de accesos exitosos y fallidos.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {loginAttempts.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
            >
              {a.result === 'exitoso' ? (
                <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
              ) : (
                <XCircle className="size-4 shrink-0 text-danger" aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{a.user}</p>
                {a.reason && <p className="text-xs text-muted-foreground">{a.reason}</p>}
              </div>
              <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                <Clock className="size-3.5" aria-hidden />
                {a.date}
              </div>
              <span className="hidden text-xs text-muted-foreground md:inline">IP {a.ip}</span>
              <Badge variant={a.result === 'exitoso' ? 'success' : 'danger'} size="sm">
                {a.result === 'exitoso' ? 'Exitoso' : 'Fallido'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
