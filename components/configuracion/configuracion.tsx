'use client'

import * as React from 'react'
import { Search, Settings2, X, ChevronRight, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/jeralpos/input'
import { SettingsNav, sectionMeta, navGroups } from './settings-nav'
import type { SectionId } from './mock-data'
import { EmpresaPanel, LogoPanel, ContactoPanel, RegionalPanel } from './panels-general'
import { SucursalesPanel, CajasPanel } from './panels-sucursales'
import {
  UnidadesPanel,
  CategoriasPanel,
  MarcasPanel,
  ImpuestosInvPanel,
  ListasPreciosPanel,
  StockPanel,
} from './panels-inventario'
import {
  MetodosPagoPanel,
  TiposVentaPanel,
  DescuentosPanel,
  ImpuestosVentasPanel,
  ConsecutivosPanel,
} from './panels-ventas'
import {
  PrefijosPanel,
  ResolucionesPanel,
  NumeracionPanel,
  ElectronicaPanel,
  DianPanel,
} from './panels-facturacion'
import { RolesPanel, PermisosPanel, SeguridadPanel } from './panels-usuarios'
import {
  NotificacionesPanel,
  CorreoPanel,
  RespaldoPanel,
  AuditoriaPanel,
  PreferenciasPanel,
  AparienciaPanel,
} from './panels-sistema'

/* Toast ------------------------------------------------------------- */

interface ToastState {
  id: number
  msg: string
  kind: 'success' | 'error'
}

function ToastStack({ toasts }: { toasts: ToastState[] }) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'pointer-events-auto flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm shadow-lg animate-in slide-in-from-bottom-2 fade-in',
            t.kind === 'success'
              ? 'border-success-muted bg-card text-foreground'
              : 'border-danger-muted bg-card text-foreground',
          )}
        >
          {t.kind === 'success' ? (
            <Check className="size-4 shrink-0 text-success" />
          ) : (
            <AlertCircle className="size-4 shrink-0 text-danger" />
          )}
          {t.msg}
        </div>
      ))}
    </div>
  )
}

/* Panel router ------------------------------------------------------ */

function ActivePanel({ id, onToast }: { id: SectionId; onToast: (m: string, k?: 'success' | 'error') => void }) {
  switch (id) {
    case 'empresa':
      return <EmpresaPanel onToast={onToast} />
    case 'logo':
      return <LogoPanel onToast={onToast} />
    case 'contacto':
      return <ContactoPanel onToast={onToast} />
    case 'regional':
      return <RegionalPanel onToast={onToast} />
    case 'sucursales':
      return <SucursalesPanel onToast={onToast} />
    case 'cajas':
      return <CajasPanel onToast={onToast} />
    case 'unidades':
      return <UnidadesPanel onToast={onToast} />
    case 'categorias':
      return <CategoriasPanel onToast={onToast} />
    case 'marcas':
      return <MarcasPanel onToast={onToast} />
    case 'impuestos-inv':
      return <ImpuestosInvPanel onToast={onToast} />
    case 'listas-precios':
      return <ListasPreciosPanel onToast={onToast} />
    case 'stock':
      return <StockPanel onToast={onToast} />
    case 'metodos-pago':
      return <MetodosPagoPanel onToast={onToast} />
    case 'tipos-venta':
      return <TiposVentaPanel onToast={onToast} />
    case 'descuentos':
      return <DescuentosPanel onToast={onToast} />
    case 'impuestos-ventas':
      return <ImpuestosVentasPanel onToast={onToast} />
    case 'consecutivos':
      return <ConsecutivosPanel onToast={onToast} />
    case 'prefijos':
      return <PrefijosPanel onToast={onToast} />
    case 'resoluciones':
      return <ResolucionesPanel onToast={onToast} />
    case 'numeracion':
      return <NumeracionPanel onToast={onToast} />
    case 'electronica':
      return <ElectronicaPanel onToast={onToast} />
    case 'dian':
      return <DianPanel onToast={onToast} />
    case 'roles':
      return <RolesPanel onToast={onToast} />
    case 'permisos':
      return <PermisosPanel onToast={onToast} />
    case 'seguridad':
      return <SeguridadPanel onToast={onToast} />
    case 'notificaciones':
      return <NotificacionesPanel onToast={onToast} />
    case 'correo':
      return <CorreoPanel onToast={onToast} />
    case 'respaldo':
      return <RespaldoPanel onToast={onToast} />
    case 'auditoria':
      return <AuditoriaPanel />
    case 'preferencias':
      return <PreferenciasPanel onToast={onToast} />
    case 'apariencia':
      return <AparienciaPanel onToast={onToast} />
    default:
      return null
  }
}

/* Main screen ------------------------------------------------------- */

export function Configuracion() {
  const [active, setActive] = React.useState<SectionId>('empresa')
  const [query, setQuery] = React.useState('')
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)
  const [toasts, setToasts] = React.useState<ToastState[]>([])

  const onToast = React.useCallback((msg: string, kind: 'success' | 'error' = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, msg, kind }])
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2600)
  }, [])

  const filteredGroups = React.useMemo(() => {
    if (!query.trim()) return navGroups
    const q = query.toLowerCase()
    return navGroups
      .map((g) => ({ ...g, items: g.items.filter((it) => it.label.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0)
  }, [query])

  const meta = sectionMeta[active]

  const select = (id: SectionId) => {
    setActive(id)
    setMobileNavOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <Settings2 className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Configuración</h1>
            <p className="text-sm text-muted-foreground">Administra los parámetros generales del sistema JERALPOS.</p>
          </div>
        </div>
      </div>

      {/* Breadcrumb + mobile nav toggle */}
      <div className="flex items-center justify-between gap-3">
        <nav aria-label="Ruta" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>Configuración</span>
          <ChevronRight className="size-3.5" />
          <span className="text-muted-foreground/80">{meta.group}</span>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-foreground">{meta.label}</span>
        </nav>
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground lg:hidden"
        >
          <Settings2 className="size-4" />
          Secciones
        </button>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-4 flex flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar ajuste…"
                className="pl-9"
                aria-label="Buscar ajuste"
              />
            </div>
            <div className="max-h-[calc(100vh-11rem)] overflow-y-auto pr-1">
              {filteredGroups.length > 0 ? (
                <FilteredNav groups={filteredGroups} active={active} onSelect={select} />
              ) : (
                <p className="px-3 py-6 text-sm text-muted-foreground">Sin resultados para “{query}”.</p>
              )}
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <ActivePanel id={active} onToast={onToast} />
          </div>
        </main>
      </div>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 animate-in fade-in"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto bg-card p-4 shadow-xl animate-in slide-in-from-left">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Secciones</p>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Cerrar"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar ajuste…"
                className="pl-9"
                aria-label="Buscar ajuste"
              />
            </div>
            {filteredGroups.length > 0 ? (
              <FilteredNav groups={filteredGroups} active={active} onSelect={select} />
            ) : (
              <p className="px-3 py-6 text-sm text-muted-foreground">Sin resultados para “{query}”.</p>
            )}
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} />
    </div>
  )
}

/* Filtered nav wrapper — reuses SettingsNav when unfiltered ---------- */

function FilteredNav({
  groups,
  active,
  onSelect,
}: {
  groups: typeof navGroups
  active: SectionId
  onSelect: (id: SectionId) => void
}) {
  if (groups === navGroups) {
    return <SettingsNav active={active} onSelect={onSelect} />
  }
  return (
    <nav aria-label="Secciones de configuración" className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive = active === item.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors [&_svg]:size-4 [&_svg]:shrink-0',
                      isActive
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <Icon className={cn(isActive ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground')} />
                    <span className="truncate">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
