'use client'

import * as React from 'react'
import {
  PanelLeft,
  Search,
  Bell,
  ChevronRight,
  ChevronDown,
  DollarSign,
  User,
  Settings,
  LogOut,
  LifeBuoy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/jeralpos/input'
import { Badge } from '@/components/jeralpos/badge'
import { useDismiss } from '@/hooks/use-dismiss'

export interface Crumb {
  label: string
  href?: string
}

interface HeaderProps {
  crumbs: Crumb[]
  onToggleSidebar: () => void
  cajaOpen?: boolean
  onLogout?: () => void
}

const demoUser = {
  name: 'José Alvarez',
  role: 'Administrador',
  initials: 'JA',
}

const notifications = [
  { title: 'Nueva venta registrada', detail: 'Factura #10482 · $1,240.00', time: 'Hace 2 min' },
  { title: 'Stock bajo', detail: 'Coca-Cola 2L · 4 unidades', time: 'Hace 18 min' },
  { title: 'Cierre de caja pendiente', detail: 'Turno matutino', time: 'Hace 1 h' },
]

export function Header({ crumbs, onToggleSidebar, cajaOpen = true, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* Sidebar toggle */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Alternar menú lateral"
      >
        <PanelLeft className="size-5" />
      </button>

      {/* Breadcrumb */}
      <nav aria-label="Ruta de navegación" className="hidden min-w-0 md:block">
        <ol className="flex items-center gap-1.5 text-sm">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1
            return (
              <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3.5 text-muted-foreground/60" aria-hidden />}
                <span
                  className={cn(
                    'truncate',
                    last ? 'font-semibold text-foreground' : 'text-muted-foreground',
                  )}
                  aria-current={last ? 'page' : undefined}
                >
                  {c.label}
                </span>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Search */}
      <div className="ml-auto hidden w-full max-w-xs sm:block">
        <Input
          type="search"
          placeholder="Buscar productos, ventas, clientes…"
          leadingIcon={<Search />}
          aria-label="Buscar"
        />
      </div>

      {/* Caja status */}
      <div
        className={cn(
          'hidden shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 lg:flex',
          cajaOpen
            ? 'border-success/30 bg-success-muted'
            : 'border-danger/30 bg-danger-muted',
        )}
      >
        <DollarSign className={cn('size-4', cajaOpen ? 'text-success' : 'text-danger')} />
        <div className="leading-tight">
          <p className="text-[11px] text-muted-foreground">Caja</p>
          <p
            className={cn(
              'text-xs font-semibold',
              cajaOpen ? 'text-success' : 'text-danger',
            )}
          >
            {cajaOpen ? 'Abierta' : 'Cerrada'}
          </p>
        </div>
      </div>

      <NotificationsMenu />
      <UserMenu onLogout={onLogout} />
    </header>
  )
}

function NotificationsMenu() {
  const [open, setOpen] = React.useState(false)
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false))

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Notificaciones"
        aria-expanded={open}
      >
        <Bell className="size-5" />
        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger ring-2 ring-card" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Notificaciones</p>
            <Badge variant="primary" size="sm">
              {notifications.length} nuevas
            </Badge>
          </div>
          <ul className="max-h-80 divide-y divide-border overflow-y-auto">
            {notifications.map((n, i) => (
              <li key={i}>
                <button className="flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-accent">
                  <span className="text-sm font-medium text-foreground">{n.title}</span>
                  <span className="text-xs text-muted-foreground">{n.detail}</span>
                  <span className="text-[11px] text-muted-foreground/70">{n.time}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-border p-2">
            <button className="w-full rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-accent">
              Ver todas
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function UserMenu({ onLogout }: { onLogout?: () => void }) {
  const [open, setOpen] = React.useState(false)
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false))

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-accent"
        aria-label="Menú de usuario"
        aria-expanded={open}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-electric to-navy text-xs font-semibold text-white">
          {demoUser.initials}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-medium text-foreground">{demoUser.name}</span>
          <span className="block text-[11px] text-muted-foreground">{demoUser.role}</span>
        </span>
        <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{demoUser.name}</p>
            <p className="text-xs text-muted-foreground">jose.alvarez@jeralpos.com</p>
          </div>
          <ul className="p-1.5">
            {[
              { label: 'Mi perfil', icon: User },
              { label: 'Configuración', icon: Settings },
              { label: 'Soporte', icon: LifeBuoy },
            ].map((it) => (
              <li key={it.label}>
                <button className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent">
                  <it.icon className="size-4 text-muted-foreground" />
                  {it.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-border p-1.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onLogout?.()
              }}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger-muted"
            >
              <LogOut className="size-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
