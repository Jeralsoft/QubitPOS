'use client'

import * as React from 'react'
import { Plus, Pencil, Power, Check, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Badge } from '@/components/jeralpos/badge'
import { IndicatorCard } from '@/components/dashboard/indicator-card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/jeralpos/table'
import { ChartCard } from '@/components/reportes/charts'
import { cn } from '@/lib/utils'
import {
  sectionGroups,
  sectionLabelById,
  kpis,
  dashboardCharts,
  terminals as seedTerminals,
  terminalStatusVariant,
  terminalStatusIcon,
  monitorEvents,
  monitorLevelVariant,
  configTabs,
  configToggles,
  formatCurrency,
  formatNumber,
  type SectionId,
  type Terminal,
  type ConfigTabId,
  type ConfigToggle,
} from './mock-data'
import { CreateTerminalModal, type NewTerminalDraft } from './create-terminal-modal'
import { KioskPreview } from './kiosk-preview'

type ToastKind = 'success' | 'error'

/* -------------------------------------------------------------------------- */
/*  Section navigation                                                        */
/* -------------------------------------------------------------------------- */

function SectionMenu({
  selected,
  onSelect,
}: {
  selected: SectionId
  onSelect: (id: SectionId) => void
}) {
  return (
    <nav aria-label="Secciones de kiosco" className="flex flex-col gap-5">
      {sectionGroups.map((group) => (
        <div key={group.label}>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </h3>
          <ul className="flex flex-col gap-0.5">
            {group.sections.map((s) => {
              const Icon = s.icon
              const active = s.id === selected
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(s.id)}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors [&_svg]:size-4',
                      active
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-foreground hover:bg-accent',
                    )}
                  >
                    <Icon className={active ? 'text-primary' : 'text-muted-foreground'} aria-hidden />
                    <span className="truncate">{s.label}</span>
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

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Dashboard                                                                 */
/* -------------------------------------------------------------------------- */

function DashboardSection() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Dashboard Kiosco"
        description="Estado y desempeño de las terminales de autoservicio."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((ind) => (
          <IndicatorCard key={ind.id} indicator={ind} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard spec={dashboardCharts[0]} />
        <ChartCard spec={dashboardCharts[1]} />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Terminales                                                                */
/* -------------------------------------------------------------------------- */

function TerminalesSection({ onToast }: { onToast: (msg: string, kind?: ToastKind) => void }) {
  const [items, setItems] = React.useState<Terminal[]>(seedTerminals)
  const [open, setOpen] = React.useState(false)

  const nextCode = React.useMemo(() => {
    const n = items.length + 1
    return `KIO-${String(n).padStart(3, '0')}`
  }, [items.length])

  const handleCreate = (draft: NewTerminalDraft) => {
    const terminal: Terminal = {
      id: `t-${Date.now()}`,
      name: draft.name,
      code: draft.code,
      branch: draft.branch,
      location: draft.location,
      status: draft.status,
      lastSeen: 'Recién creado',
      sales: 0,
      orders: 0,
    }
    setItems((prev) => [terminal, ...prev])
    setOpen(false)
    onToast(`Kiosco ${draft.code} registrado`)
  }

  const toggleBlock = (t: Terminal) =>
    setItems((prev) =>
      prev.map((it) =>
        it.id === t.id
          ? { ...it, status: it.status === 'BLOQUEADO' ? 'ONLINE' : 'BLOQUEADO' }
          : it,
      ),
    )

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          title="Terminales"
          description="Kioscos de autoservicio registrados en el negocio."
        />
        <Button variant="primary" size="md" onClick={() => setOpen(true)}>
          <Plus />
          Nuevo kiosco
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Código</TableHead>
            <TableHead className="hidden md:table-cell">Sucursal</TableHead>
            <TableHead className="hidden lg:table-cell">Ubicación</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="hidden xl:table-cell">Última conexión</TableHead>
            <TableHead className="text-right">Ventas</TableHead>
            <TableHead className="text-right">Pedidos</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((t) => {
            const StatusIcon = terminalStatusIcon[t.status]
            return (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">{t.code}</TableCell>
                <TableCell className="hidden md:table-cell">{t.branch}</TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {t.location}
                </TableCell>
                <TableCell>
                  <Badge variant={terminalStatusVariant[t.status]} size="sm" dot>
                    <StatusIcon aria-hidden />
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden tabular-nums text-muted-foreground xl:table-cell">
                  {t.lastSeen}
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(t.sales)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatNumber(t.orders)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onToast(`Editar ${t.code} (demo)`)}
                      aria-label={`Editar ${t.name}`}
                      className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-4"
                    >
                      <Pencil />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        toggleBlock(t)
                        onToast(
                          `${t.code} ${t.status === 'BLOQUEADO' ? 'desbloqueado' : 'bloqueado'}`,
                        )
                      }}
                      aria-label={`${t.status === 'BLOQUEADO' ? 'Desbloquear' : 'Bloquear'} ${t.name}`}
                      className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-4"
                    >
                      <Power />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <p className="text-xs text-muted-foreground">{items.length} terminales</p>

      <CreateTerminalModal
        open={open}
        onClose={() => setOpen(false)}
        nextCode={nextCode}
        onCreate={handleCreate}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Monitor                                                                   */
/* -------------------------------------------------------------------------- */

function MonitorSection({ onToast }: { onToast: (msg: string, kind?: ToastKind) => void }) {
  const online = seedTerminals.filter((t) => t.status === 'ONLINE').length
  const offline = seedTerminals.filter((t) => t.status === 'OFFLINE').length
  const maint = seedTerminals.filter((t) => t.status === 'MANTENIMIENTO').length
  const blocked = seedTerminals.filter((t) => t.status === 'BLOQUEADO').length

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          title="Monitor"
          description="Estado en tiempo real y actividad reciente de las terminales."
        />
        <Button variant="outline" size="sm" onClick={() => onToast('Estado actualizado')}>
          <RefreshCw />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'En línea', value: online, variant: 'success' as const },
          { label: 'Desconectados', value: offline, variant: 'neutral' as const },
          { label: 'Mantenimiento', value: maint, variant: 'warning' as const },
          { label: 'Bloqueados', value: blocked, variant: 'danger' as const },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <Badge variant={s.variant} size="sm" dot>
                {s.value}
              </Badge>
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">Actividad reciente</h3>
        </div>
        <ul className="divide-y divide-border">
          {monitorEvents.map((e) => (
            <li key={e.id} className="flex items-center gap-3 px-5 py-3">
              <Badge variant={monitorLevelVariant[e.level]} size="sm" dot>
                {e.terminal}
              </Badge>
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{e.message}</span>
              <span className="shrink-0 tabular-nums text-xs text-muted-foreground">{e.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Configuración (tabs)                                                      */
/* -------------------------------------------------------------------------- */

function Toggle({
  toggle,
  onChange,
}: {
  toggle: ConfigToggle
  onChange: (id: string, value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{toggle.label}</p>
        <p className="text-xs text-muted-foreground">{toggle.description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={toggle.enabled}
        aria-label={toggle.label}
        onClick={() => onChange(toggle.id, !toggle.enabled)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          toggle.enabled ? 'bg-primary' : 'bg-muted',
        )}
      >
        <span
          className={cn(
            'inline-block size-5 rounded-full bg-card shadow-sm transition-transform',
            toggle.enabled ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  )
}

function ConfiguracionSection({ onToast }: { onToast: (msg: string, kind?: ToastKind) => void }) {
  const [tab, setTab] = React.useState<ConfigTabId>('general')
  const [state, setState] = React.useState(configToggles)

  const onChange = (id: string, value: boolean) =>
    setState((prev) => ({
      ...prev,
      [tab]: prev[tab].map((t) => (t.id === id ? { ...t, enabled: value } : t)),
    }))

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          title="Configuración"
          description="Ajustes de las terminales de autoservicio."
        />
        <Button variant="primary" size="md" onClick={() => onToast('Configuración guardada')}>
          <Check />
          Guardar cambios
        </Button>
      </div>

      <div
        role="tablist"
        aria-label="Configuración del kiosco"
        className="flex flex-wrap gap-1 border-b border-border"
      >
        {configTabs.map((t) => {
          const active = t.id === tab
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={cn(
                '-mb-px border-b-2 px-3.5 py-2 text-sm font-medium transition-colors',
                active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {state[tab].map((toggle) => (
          <Toggle key={toggle.id} toggle={toggle} onChange={onChange} />
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Toast                                                                     */
/* -------------------------------------------------------------------------- */

function Toast({ message, kind }: { message: string; kind: ToastKind }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2">
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg [&_svg]:size-4',
          kind === 'success' ? 'bg-success' : 'bg-danger',
        )}
        role="status"
      >
        {kind === 'success' ? <Check aria-hidden /> : <X aria-hidden />}
        {message}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Main module                                                               */
/* -------------------------------------------------------------------------- */

export function Kiosco() {
  const [section, setSection] = React.useState<SectionId>('dashboard')
  const [toast, setToast] = React.useState<{ message: string; kind: ToastKind } | null>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = React.useCallback((message: string, kind: ToastKind = 'success') => {
    setToast({ message, kind })
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Kiosco</h1>
        <p className="text-sm text-muted-foreground">
          Administra las terminales de autoservicio · {sectionLabelById[section]}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <SectionMenu selected={section} onSelect={setSection} />
        </aside>

        <div className="min-w-0">
          {section === 'dashboard' && <DashboardSection />}
          {section === 'terminales' && <TerminalesSection onToast={showToast} />}
          {section === 'monitor' && <MonitorSection onToast={showToast} />}
          {section === 'configuracion' && <ConfiguracionSection onToast={showToast} />}
          {section === 'preview' && <KioskPreview />}
        </div>
      </div>

      {toast && <Toast message={toast.message} kind={toast.kind} />}
    </div>
  )
}
