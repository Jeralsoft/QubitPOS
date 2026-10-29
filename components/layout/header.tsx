'use client'

import * as React from 'react'
import {
  PanelLeft,
  Search,
  Bell,
  ChevronRight,
  ChevronDown,
  User,
  Settings,
  LogOut,
  LifeBuoy,
  Sun,
  Moon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/jeralpos/input'
import { Badge } from '@/components/jeralpos/badge'
import { useDismiss } from '@/hooks/use-dismiss'
import { ThemeToggle } from './theme-toggle'
import { useTheme } from '@/context/theme-context'

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
  name: 'José Álvarez',
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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/85 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-card/70">
      {/* Sidebar toggle */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground"
        aria-label="Alternar menú lateral"
      >
        <PanelLeft className="size-4.5" />
      </button>

      {/* Breadcrumb */}
      <nav aria-label="Ruta de navegación" className="hidden min-w-0 md:block">
        <ol className="flex items-center gap-2 text-xs">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1
            return (
              <li key={`${c.label}-${i}`} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="size-3 text-muted-foreground/40" aria-hidden />}
                <span
                  className={cn(
                    'truncate tracking-tight',
                    last ? 'font-semibold text-foreground text-sm' : 'text-muted-foreground hover:text-foreground transition-colors',
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
        <div className="relative">
          <Input
            type="search"
            placeholder="Buscar productos, ventas..."
            leadingIcon={<Search className="size-4 text-muted-foreground/70" />}
            className="h-9 rounded-full bg-muted/50 border-border/60 pl-9 pr-12 text-xs placeholder:text-muted-foreground/60 focus-visible:bg-card focus-visible:ring-1"
            aria-label="Buscar"
          />
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
            <kbd className="rounded border border-border/70 bg-card px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/80 shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Caja status pill - minimal and elegant */}
      <div
        className={cn(
          'hidden shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors lg:flex',
          cajaOpen
            ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400'
            : 'border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400',
        )}
      >
        <span className="relative flex size-2">
          {cajaOpen && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={cn(
              'relative inline-flex size-2 rounded-full',
              cajaOpen ? 'bg-emerald-500' : 'bg-rose-500',
            )}
          />
        </span>
        <span className="font-medium tracking-tight">
          {cajaOpen ? 'Caja #01 Abierta' : 'Caja Cerrada'}
        </span>
      </div>

      {/* Theme Toggle Button (Light / Dark) */}
      <ThemeToggle />

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
        className="relative grid size-9 place-items-center rounded-lg text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground"
        aria-label="Notificaciones"
        aria-expanded={open}
      >
        <Bell className="size-4.5" />
        <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-border/80 bg-popover shadow-xl animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notificaciones</p>
            <Badge variant="primary" size="sm">
              {notifications.length} nuevas
            </Badge>
          </div>
          <ul className="max-h-80 divide-y divide-border/60 overflow-y-auto">
            {notifications.map((n, i) => (
              <li key={i}>
                <button className="flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-muted/50">
                  <span className="text-xs font-medium text-foreground">{n.title}</span>
                  <span className="text-xs text-muted-foreground">{n.detail}</span>
                  <span className="text-[10px] text-muted-foreground/60">{n.time}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-border/60 p-2">
            <button className="w-full rounded-lg px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-muted">
              Ver todas las notificaciones
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
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-full border border-border/60 py-1 pl-1 pr-2.5 transition-all duration-150 hover:bg-muted"
        aria-label="Menú de usuario"
        aria-expanded={open}
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-foreground text-[11px] font-semibold text-background shadow-xs">
          {demoUser.initials}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-xs font-medium text-foreground">{demoUser.name}</span>
        </span>
        <ChevronDown className="hidden size-3.5 text-muted-foreground/70 sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-border/80 bg-popover shadow-xl animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="border-b border-border/60 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{demoUser.name}</p>
            <p className="text-xs text-muted-foreground truncate">admin@qubitpos.co</p>
          </div>
          <ul className="p-1.5">
            {[
              { label: 'Mi perfil', icon: User },
              { label: 'Configuración', icon: Settings },
              { label: 'Soporte', icon: LifeBuoy },
            ].map((it) => (
              <li key={it.label}>
                <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                  <it.icon className="size-4 text-muted-foreground" />
                  {it.label}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                <span className="flex items-center gap-2.5">
                  {resolvedTheme === 'dark' ? (
                    <Sun className="size-4 text-amber-400" />
                  ) : (
                    <Moon className="size-4 text-slate-700" />
                  )}
                  <span>{resolvedTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-mono">{resolvedTheme}</span>
              </button>
            </li>
          </ul>
          <div className="border-t border-border/60 p-1.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onLogout?.()
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-danger transition-colors hover:bg-danger-muted"
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
