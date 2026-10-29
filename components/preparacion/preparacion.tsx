'use client'

import * as React from 'react'
import {
  Plus,
  Play,
  Check,
  Truck,
  Pause,
  Eye,
  X,
  Search,
  LayoutGrid,
  Table as TableIcon,
  Maximize2,
  Minimize2,
  Clock,
  Users,
  Copy,
  Pencil,
  Power,
  RefreshCw,
  CalendarDays,
} from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Badge } from '@/components/jeralpos/badge'
import { Input, Select, Label, Textarea } from '@/components/jeralpos/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/jeralpos/card'
import { Modal } from '@/components/jeralpos/modal'
import { IndicatorCard } from '@/components/dashboard/indicator-card'
import { ChartCard } from '@/components/reportes/charts'
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
  sectionGroups,
  sectionLabelById,
  kpis,
  dashboardCharts,
  orders as seedOrders,
  orderStatusLabel,
  orderStatusVariant,
  nextStatus,
  stations as seedStations,
  stationStatusLabel,
  stationStatusVariant,
  stationNames,
  staffNames,
  diningTables,
  tableStatusLabel,
  tableStatusVariant,
  tableZones,
  reservations as seedReservations,
  reservationStatusLabel,
  reservationStatusVariant,
  recipes,
  recipeTotalCost,
  historyRows,
  historyStatusOptions,
  indicatorStats,
  indicatorCharts,
  timeVariant,
  formatElapsed,
  formatCurrency,
  type SectionId,
  type PrepOrder,
  type OrderStatus,
  type Station,
  type StationStatus,
  type DiningTable,
  type TableStatus,
  type Reservation,
  type ReservationStatus,
  type Recipe,
} from './mock-data'
import { OrderDetailModal } from './order-detail-modal'

type ToastKind = 'success' | 'error'
type ToastFn = (msg: string, kind?: ToastKind) => void

/* -------------------------------------------------------------------------- */
/*  Shared bits                                                               */
/* -------------------------------------------------------------------------- */

function SectionMenu({
  selected,
  onSelect,
}: {
  selected: SectionId
  onSelect: (id: SectionId) => void
}) {
  return (
    <nav aria-label="Secciones de preparación" className="flex flex-col gap-5">
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

function SectionHeader({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actions}
    </div>
  )
}

function ElapsedBadge({ order }: { order: PrepOrder }) {
  return (
    <Badge variant={timeVariant(order.elapsedMin, order.estimatedMin)} size="sm" dot>
      {formatElapsed(order.elapsedMin)}
    </Badge>
  )
}

/* -------------------------------------------------------------------------- */
/*  Orders lifecycle hook (shared by Órdenes, Comandas, KDS)                  */
/* -------------------------------------------------------------------------- */

function useOrders(onToast: ToastFn) {
  const [items, setItems] = React.useState<PrepOrder[]>(seedOrders)

  const setStatus = React.useCallback(
    (id: string, status: OrderStatus, message?: string) => {
      setItems((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
      if (message) onToast(message)
    },
    [onToast],
  )

  const advance = React.useCallback(
    (order: PrepOrder) => {
      const next = nextStatus[order.status]
      if (!next) return
      const verb =
        next === 'EN_PREPARACION'
          ? 'en preparación'
          : next === 'LISTA'
            ? 'lista'
            : 'entregada'
      setStatus(order.id, next, `${order.code} marcada como ${verb}`)
    },
    [setStatus],
  )

  return { items, setStatus, advance }
}

/* -------------------------------------------------------------------------- */
/*  Dashboard                                                                 */
/* -------------------------------------------------------------------------- */

function DashboardSection({
  orders,
  onView,
  onToast,
}: {
  orders: PrepOrder[]
  onView: (o: PrepOrder) => void
  onToast: ToastFn
}) {
  const [query, setQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | 'TODOS'>('TODOS')

  const filtered = orders.filter((o) => {
    const matchesQuery =
      !query ||
      [o.code, o.comanda, o.table, o.customer, o.station]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase())
    const matchesStatus = statusFilter === 'TODOS' || o.status === statusFilter
    return matchesQuery && matchesStatus
  })

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Dashboard de preparación"
        description="Estado operativo de la cocina y las estaciones en tiempo real."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((ind) => (
          <IndicatorCard key={ind.id} indicator={ind} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard spec={dashboardCharts[0]} />
        <ChartCard spec={dashboardCharts[1]} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-semibold text-foreground">Órdenes recientes</h3>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar orden, mesa, cliente..."
              leadingIcon={<Search />}
              className="sm:w-64"
              aria-label="Buscar órdenes"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'TODOS')}
              aria-label="Filtrar por estado"
              className="sm:w-44"
            >
              <option value="TODOS">Todos los estados</option>
              {(Object.keys(orderStatusLabel) as OrderStatus[]).map((s) => (
                <option key={s} value={s}>
                  {orderStatusLabel[s]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Orden</TableHead>
              <TableHead>Comanda</TableHead>
              <TableHead>Mesa</TableHead>
              <TableHead className="hidden md:table-cell">Cliente</TableHead>
              <TableHead className="hidden lg:table-cell">Estación</TableHead>
              <TableHead className="hidden xl:table-cell">Hora</TableHead>
              <TableHead>Tiempo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.code}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">{o.comanda}</TableCell>
                <TableCell>{o.table}</TableCell>
                <TableCell className="hidden md:table-cell">{o.customer}</TableCell>
                <TableCell className="hidden lg:table-cell">{o.station}</TableCell>
                <TableCell className="hidden tabular-nums text-muted-foreground xl:table-cell">
                  {o.time}
                </TableCell>
                <TableCell>
                  <ElapsedBadge order={o} />
                </TableCell>
                <TableCell>
                  <Badge variant={orderStatusVariant[o.status]} size="sm" dot>
                    {orderStatusLabel[o.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <button
                    type="button"
                    onClick={() => onView(o)}
                    aria-label={`Ver detalle de ${o.code}`}
                    className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-4"
                  >
                    <Eye />
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                  No se encontraron órdenes con los filtros aplicados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground">
          {filtered.length} de {orders.length} órdenes
        </p>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Order actions (shared)                                                    */
/* -------------------------------------------------------------------------- */

function OrderActions({
  order,
  onAdvance,
  onPause,
  onView,
  onCancel,
  compact,
}: {
  order: PrepOrder
  onAdvance: (o: PrepOrder) => void
  onPause: (o: PrepOrder) => void
  onView: (o: PrepOrder) => void
  onCancel: (o: PrepOrder) => void
  compact?: boolean
}) {
  const canAdvance = order.status === 'PENDIENTE' || order.status === 'EN_PREPARACION' || order.status === 'LISTA' || order.status === 'PAUSADA'
  const advanceLabel =
    order.status === 'PENDIENTE' || order.status === 'PAUSADA'
      ? 'Iniciar'
      : order.status === 'EN_PREPARACION'
        ? 'Marcar lista'
        : 'Entregar'
  const AdvanceIcon =
    order.status === 'EN_PREPARACION' ? Check : order.status === 'LISTA' ? Truck : Play
  const done = order.status === 'ENTREGADA' || order.status === 'CANCELADA'

  return (
    <div className={cn('flex flex-wrap items-center gap-2', compact && 'gap-1.5')}>
      {canAdvance && (
        <Button
          variant={order.status === 'LISTA' ? 'success' : 'primary'}
          size={compact ? 'md' : 'sm'}
          onClick={() => onAdvance(order)}
        >
          <AdvanceIcon />
          {advanceLabel}
        </Button>
      )}
      {order.status === 'EN_PREPARACION' && (
        <Button variant="outline" size={compact ? 'md' : 'sm'} onClick={() => onPause(order)}>
          <Pause />
          Pausar
        </Button>
      )}
      {!compact && (
        <Button variant="ghost" size="sm" onClick={() => onView(order)}>
          <Eye />
          Detalle
        </Button>
      )}
      {!done && (
        <Button variant="ghost" size={compact ? 'md' : 'sm'} onClick={() => onCancel(order)}>
          <X />
          Cancelar
        </Button>
      )}
    </div>
  )
}

function OrderCard({
  order,
  onAdvance,
  onPause,
  onView,
  onCancel,
}: {
  order: PrepOrder
  onAdvance: (o: PrepOrder) => void
  onPause: (o: PrepOrder) => void
  onView: (o: PrepOrder) => void
  onCancel: (o: PrepOrder) => void
}) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-2 border-b border-border p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{order.code}</span>
            {order.priority === 'alta' && (
              <Badge variant="danger" size="sm">
                Prioridad
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {order.comanda} · {order.table} · {order.people} pers.
          </p>
        </div>
        <ElapsedBadge order={order} />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="font-medium text-foreground">{order.customer}</span>
          <Badge variant="neutral" size="sm">
            {order.station}
          </Badge>
        </div>

        <ul className="flex flex-col gap-1.5">
          {order.items.map((it, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="shrink-0 font-semibold tabular-nums text-primary">{it.qty}×</span>
              <span className="min-w-0">
                <span className="text-foreground">{it.name}</span>
                {it.modifiers && it.modifiers.length > 0 && (
                  <span className="text-xs text-muted-foreground"> · {it.modifiers.join(', ')}</span>
                )}
              </span>
            </li>
          ))}
        </ul>

        {order.note && (
          <p className="rounded-md bg-warning-muted px-2.5 py-1.5 text-xs text-warning-foreground">
            {order.note}
          </p>
        )}
      </div>

      <div className="border-t border-border p-4">
        <OrderActions
          order={order}
          onAdvance={onAdvance}
          onPause={onPause}
          onView={onView}
          onCancel={onCancel}
        />
      </div>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Órdenes (table + kanban)                                                  */
/* -------------------------------------------------------------------------- */

const KANBAN_COLUMNS: { status: OrderStatus; label: string }[] = [
  { status: 'PENDIENTE', label: 'Pendientes' },
  { status: 'EN_PREPARACION', label: 'En preparación' },
  { status: 'LISTA', label: 'Listas' },
  { status: 'ENTREGADA', label: 'Entregadas' },
]

function OrdenesSection({
  onToast,
  onView,
}: {
  onToast: ToastFn
  onView: (o: PrepOrder) => void
}) {
  const { items, setStatus, advance } = useOrders(onToast)
  const [view, setView] = React.useState<'kanban' | 'tabla'>('kanban')
  const [confirm, setConfirm] = React.useState<PrepOrder | null>(null)

  const pause = (o: PrepOrder) => setStatus(o.id, 'PAUSADA', `${o.code} pausada`)
  const cancel = (o: PrepOrder) => setConfirm(o)
  const confirmCancel = () => {
    if (confirm) setStatus(confirm.id, 'CANCELADA', `${confirm.code} cancelada`)
    setConfirm(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Órdenes de preparación"
        description="Gestiona el flujo de órdenes por estado en tablero o tabla."
        actions={
          <div className="inline-flex rounded-lg border border-border bg-card p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setView('kanban')}
              aria-pressed={view === 'kanban'}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors [&_svg]:size-4',
                view === 'kanban' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <LayoutGrid />
              Kanban
            </button>
            <button
              type="button"
              onClick={() => setView('tabla')}
              aria-pressed={view === 'tabla'}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors [&_svg]:size-4',
                view === 'tabla' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <TableIcon />
              Tabla
            </button>
          </div>
        }
      />

      {view === 'kanban' ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {KANBAN_COLUMNS.map((col) => {
            const colOrders = items.filter((o) => o.status === col.status)
            return (
              <div key={col.status} className="flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                  <span className="text-sm font-semibold text-foreground">{col.label}</span>
                  <Badge variant={orderStatusVariant[col.status]} size="sm">
                    {colOrders.length}
                  </Badge>
                </div>
                <div className="flex flex-col gap-3">
                  {colOrders.map((o) => (
                    <OrderCard
                      key={o.id}
                      order={o}
                      onAdvance={advance}
                      onPause={pause}
                      onView={onView}
                      onCancel={cancel}
                    />
                  ))}
                  {colOrders.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                      Sin órdenes
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Orden</TableHead>
              <TableHead>Mesa</TableHead>
              <TableHead className="hidden md:table-cell">Cliente</TableHead>
              <TableHead className="hidden lg:table-cell">Estación</TableHead>
              <TableHead>Tiempo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.code}</TableCell>
                <TableCell>{o.table}</TableCell>
                <TableCell className="hidden md:table-cell">{o.customer}</TableCell>
                <TableCell className="hidden lg:table-cell">{o.station}</TableCell>
                <TableCell>
                  <ElapsedBadge order={o} />
                </TableCell>
                <TableCell>
                  <Badge variant={orderStatusVariant[o.status]} size="sm" dot>
                    {orderStatusLabel[o.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <OrderActions
                      order={o}
                      onAdvance={advance}
                      onPause={pause}
                      onView={onView}
                      onCancel={cancel}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Cancelar orden"
        description={confirm ? `¿Seguro que deseas cancelar ${confirm.code}? Esta acción no se puede deshacer.` : ''}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Volver
            </Button>
            <Button variant="danger" onClick={confirmCancel}>
              Cancelar orden
            </Button>
          </>
        }
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Comandas                                                                  */
/* -------------------------------------------------------------------------- */

function ComandasSection({ onToast }: { onToast: ToastFn }) {
  const { items, advance } = useOrders(onToast)
  const active = items.filter((o) => o.status !== 'ENTREGADA' && o.status !== 'CANCELADA')

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Comandas"
        description="Comandas generadas desde ventas, kiosco y domicilios."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {active.map((o) => (
          <Card key={o.id} className="flex flex-col">
            <div className="flex items-start justify-between gap-2 border-b border-border p-4">
              <div>
                <p className="font-semibold text-foreground">Comanda {o.comanda}</p>
                <p className="text-xs text-muted-foreground">
                  {o.table} · {o.customer} · {o.people} pers.
                </p>
              </div>
              <Badge variant="neutral" size="sm">
                {o.source}
              </Badge>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <ul className="flex flex-col gap-1.5">
                {o.items.map((it, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="shrink-0 font-semibold tabular-nums text-primary">{it.qty}×</span>
                    <span className="text-foreground">{it.name}</span>
                  </li>
                ))}
              </ul>
              {o.note && (
                <p className="rounded-md bg-warning-muted px-2.5 py-1.5 text-xs text-warning-foreground">
                  {o.note}
                </p>
              )}
              <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                <Badge variant="neutral" size="sm">
                  <Clock aria-hidden />
                  {o.time}
                </Badge>
                <ElapsedBadge order={o} />
                <Badge variant={orderStatusVariant[o.status]} size="sm" dot>
                  {orderStatusLabel[o.status]}
                </Badge>
              </div>
            </div>
            <div className="border-t border-border p-4">
              <Badge variant="neutral" size="sm" className="mb-3">
                {o.station}
              </Badge>
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => advance(o)}
                disabled={o.status === 'LISTA'}
              >
                {o.status === 'PENDIENTE' ? 'Iniciar preparación' : o.status === 'LISTA' ? 'Lista' : 'Marcar lista'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  KDS                                                                       */
/* -------------------------------------------------------------------------- */

const KDS_COLUMNS: { status: OrderStatus; label: string }[] = [
  { status: 'PENDIENTE', label: 'Pendientes' },
  { status: 'EN_PREPARACION', label: 'Preparando' },
  { status: 'LISTA', label: 'Listas' },
]

function KdsSection({ onToast }: { onToast: ToastFn }) {
  const { items, advance } = useOrders(onToast)
  const [fullscreen, setFullscreen] = React.useState(false)

  const board = (
    <div className="grid flex-1 gap-4 md:grid-cols-3">
      {KDS_COLUMNS.map((col) => {
        const colOrders = items.filter((o) => o.status === col.status)
        return (
          <div key={col.status} className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
              <span className="text-sm font-bold uppercase tracking-wide text-foreground">
                {col.label}
              </span>
              <Badge variant={orderStatusVariant[col.status]} size="md">
                {colOrders.length}
              </Badge>
            </div>
            <div className="flex flex-col gap-3">
              {colOrders.map((o) => {
                const advanceLabel =
                  o.status === 'PENDIENTE' ? 'Iniciar' : o.status === 'EN_PREPARACION' ? 'Lista' : 'Entregar'
                return (
                  <Card key={o.id} className="overflow-hidden">
                    <div
                      className={cn(
                        'flex items-center justify-between gap-2 px-4 py-2.5 text-white',
                        o.priority === 'alta' ? 'bg-danger' : 'bg-navy',
                      )}
                    >
                      <span className="text-lg font-bold">{o.code}</span>
                      <span className="rounded-md bg-white/20 px-2 py-0.5 text-sm font-semibold tabular-nums">
                        {o.table}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 p-4">
                      <div className="flex items-center justify-between">
                        <ElapsedBadge order={o} />
                        <Badge variant="neutral" size="sm">
                          {o.station}
                        </Badge>
                      </div>
                      <ul className="flex flex-col gap-2 border-t border-border pt-2">
                        {o.items.map((it, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary/10 text-base font-bold tabular-nums text-primary">
                              {it.qty}
                            </span>
                            <div className="min-w-0">
                              <p className="text-base font-semibold leading-tight text-foreground">
                                {it.name}
                              </p>
                              {it.modifiers && it.modifiers.length > 0 && (
                                <p className="text-sm font-medium text-warning-foreground">
                                  {it.modifiers.join(', ')}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                      {o.note && (
                        <p className="rounded-md bg-warning-muted px-2.5 py-1.5 text-sm font-medium text-warning-foreground">
                          {o.note}
                        </p>
                      )}
                      <Button
                        variant={o.status === 'LISTA' ? 'success' : 'primary'}
                        size="lg"
                        className="mt-1 w-full text-base"
                        onClick={() => advance(o)}
                      >
                        {advanceLabel}
                      </Button>
                    </div>
                  </Card>
                )
              })}
              {colOrders.length === 0 && (
                <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
                  Sin órdenes
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col gap-4 overflow-auto bg-background p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">KDS — Cocina</h2>
            <Badge variant="success" size="sm" dot>
              En vivo
            </Badge>
          </div>
          <Button variant="outline" size="md" onClick={() => setFullscreen(false)}>
            <Minimize2 />
            Salir de pantalla completa
          </Button>
        </div>
        {board}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="KDS — Kitchen Display System"
        description="Pantalla de cocina con órdenes en curso y acciones rápidas."
        actions={
          <Button variant="navy" size="md" onClick={() => setFullscreen(true)}>
            <Maximize2 />
            Pantalla completa
          </Button>
        }
      />
      {board}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Mesas                                                                     */
/* -------------------------------------------------------------------------- */

function MesasSection({ onToast }: { onToast: ToastFn }) {
  const [items, setItems] = React.useState<DiningTable[]>(diningTables)
  const [zone, setZone] = React.useState<'Todas' | DiningTable['zone']>('Todas')
  const [selected, setSelected] = React.useState<DiningTable | null>(null)

  const filtered = items.filter((t) => zone === 'Todas' || t.zone === zone)

  const cycleOpen = (t: DiningTable) => {
    if (t.status === 'DISPONIBLE' || t.status === 'RESERVADA') {
      setItems((prev) =>
        prev.map((it) => (it.id === t.id ? { ...it, status: 'OCUPADA', occupiedMin: 0, total: 0 } : it)),
      )
      onToast(`Mesa ${t.code} abierta`)
    } else {
      setSelected(t)
    }
  }

  const closeTable = (t: DiningTable) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === t.id
          ? { ...it, status: 'DISPONIBLE', waiter: undefined, customer: undefined, occupiedMin: undefined, total: undefined }
          : it,
      ),
    )
    setSelected(null)
    onToast(`Mesa ${t.code} cerrada`)
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Mesas"
        description="Estado visual del salón por zonas."
        actions={
          <Select
            value={zone}
            onChange={(e) => setZone(e.target.value as typeof zone)}
            aria-label="Filtrar por zona"
            className="sm:w-44"
          >
            <option value="Todas">Todas las zonas</option>
            {tableZones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </Select>
        }
      />

      <div className="flex flex-wrap gap-2">
        {(Object.keys(tableStatusLabel) as TableStatus[]).map((s) => (
          <Badge key={s} variant={tableStatusVariant[s]} size="sm" dot>
            {tableStatusLabel[s]}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => cycleOpen(t)}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-foreground">{t.code}</span>
              <Badge variant={tableStatusVariant[t.status]} size="sm" dot>
                {tableStatusLabel[t.status]}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="size-3.5" aria-hidden />
              {t.capacity} personas · {t.zone}
            </div>
            {t.status === 'OCUPADA' || t.status === 'PAGO' ? (
              <div className="flex flex-col gap-0.5 border-t border-border pt-2 text-xs">
                <span className="text-foreground">{t.customer}</span>
                <span className="text-muted-foreground">{t.waiter}</span>
                <div className="mt-1 flex items-center justify-between">
                  <span className="tabular-nums text-muted-foreground">{t.occupiedMin} min</span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {formatCurrency(t.total ?? 0)}
                  </span>
                </div>
              </div>
            ) : t.status === 'RESERVADA' ? (
              <div className="border-t border-border pt-2 text-xs text-muted-foreground">
                Reservada · {t.customer}
              </div>
            ) : (
              <div className="border-t border-border pt-2 text-xs text-muted-foreground">
                {t.status === 'FUERA' ? 'No disponible' : 'Toca para abrir'}
              </div>
            )}
          </button>
        ))}
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Mesa ${selected.code}` : ''}
        description={selected ? `${selected.zone} · ${selected.capacity} personas` : ''}
        footer={
          selected && (
            <>
              <Button variant="ghost" onClick={() => onToast('Productos agregados (demo)')}>
                <Plus />
                Agregar productos
              </Button>
              <Button variant="outline" onClick={() => onToast('Mesa transferida (demo)')}>
                Transferir
              </Button>
              <Button variant="primary" onClick={() => selected && closeTable(selected)}>
                Cerrar mesa
              </Button>
            </>
          )
        }
      >
        {selected && (
          <div className="flex flex-col gap-3">
            <div className="divide-y divide-border">
              <div className="flex justify-between py-1.5 text-sm">
                <span className="text-muted-foreground">Cliente</span>
                <span className="font-medium">{selected.customer ?? '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 text-sm">
                <span className="text-muted-foreground">Mesero</span>
                <span className="font-medium">{selected.waiter ?? '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 text-sm">
                <span className="text-muted-foreground">Tiempo ocupado</span>
                <span className="font-medium tabular-nums">{selected.occupiedMin ?? 0} min</span>
              </div>
              <div className="flex justify-between py-1.5 text-sm">
                <span className="text-muted-foreground">Total consumido</span>
                <span className="font-semibold tabular-nums">{formatCurrency(selected.total ?? 0)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Reservas                                                                  */
/* -------------------------------------------------------------------------- */

interface ReservationDraft {
  customer: string
  phone: string
  date: string
  time: string
  people: string
  table: string
  zone: string
  durationMin: string
  note: string
}

const emptyReservation: ReservationDraft = {
  customer: '',
  phone: '',
  date: 'Hoy',
  time: '',
  people: '2',
  table: '',
  zone: 'Salón',
  durationMin: '90',
  note: '',
}

function ReservasSection({ onToast }: { onToast: ToastFn }) {
  const [items, setItems] = React.useState<Reservation[]>(seedReservations)
  const [dateView, setDateView] = React.useState<'Hoy' | 'Mañana' | 'Ayer'>('Hoy')
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<ReservationDraft>(emptyReservation)

  const filtered = items.filter((r) => r.date === dateView)
  const availableTables = diningTables
    .filter((t) => t.zone === draft.zone && t.status !== 'FUERA')
    .map((t) => t.code)

  const create = () => {
    if (!draft.customer || !draft.time || !draft.table) {
      onToast('Completa cliente, hora y mesa', 'error')
      return
    }
    const r: Reservation = {
      id: `r-${Date.now()}`,
      customer: draft.customer,
      phone: draft.phone,
      date: draft.date,
      time: draft.time,
      people: Number(draft.people) || 1,
      table: draft.table,
      zone: draft.zone as Reservation['zone'],
      durationMin: Number(draft.durationMin) || 60,
      note: draft.note || undefined,
      status: 'PENDIENTE',
    }
    setItems((prev) => [r, ...prev])
    setOpen(false)
    setDraft(emptyReservation)
    setDateView(r.date as typeof dateView)
    onToast(`Reserva de ${r.customer} creada`)
  }

  const setStatus = (id: string, status: ReservationStatus, msg: string) => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    onToast(msg)
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Reservas"
        description="Agenda de reservas y disponibilidad de mesas."
        actions={
          <Button variant="primary" size="md" onClick={() => setOpen(true)}>
            <Plus />
            Nueva reserva
          </Button>
        }
      />

      <div className="inline-flex rounded-lg border border-border bg-card p-0.5 shadow-xs">
        {(['Ayer', 'Hoy', 'Mañana'] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDateView(d)}
            aria-pressed={dateView === d}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              dateView === d ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => (
          <Card key={r.id} className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">{r.customer}</p>
                <p className="text-xs text-muted-foreground">{r.phone}</p>
              </div>
              <Badge variant={reservationStatusVariant[r.status]} size="sm" dot>
                {reservationStatusLabel[r.status]}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-3.5" aria-hidden />
                {r.time}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="size-3.5" aria-hidden />
                {r.people} personas
              </span>
              <span className="text-muted-foreground">Mesa {r.table}</span>
              <span className="text-muted-foreground">{r.zone}</span>
            </div>
            {r.note && <p className="text-xs italic text-muted-foreground">“{r.note}”</p>}
            <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-3">
              {r.status === 'PENDIENTE' && (
                <Button variant="primary" size="sm" onClick={() => setStatus(r.id, 'CONFIRMADA', `Reserva de ${r.customer} confirmada`)}>
                  Confirmar
                </Button>
              )}
              {r.status === 'CONFIRMADA' && (
                <Button variant="success" size="sm" onClick={() => setStatus(r.id, 'LLEGO', `${r.customer} registrado`)}>
                  Cliente llegó
                </Button>
              )}
              {r.status === 'LLEGO' && (
                <Button variant="primary" size="sm" onClick={() => setStatus(r.id, 'EN_MESA', `${r.customer} en mesa`)}>
                  Sentar en mesa
                </Button>
              )}
              {(r.status === 'PENDIENTE' || r.status === 'CONFIRMADA') && (
                <Button variant="ghost" size="sm" onClick={() => setStatus(r.id, 'CANCELADA', `Reserva de ${r.customer} cancelada`)}>
                  Cancelar
                </Button>
              )}
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            <CalendarDays className="mx-auto mb-2 size-6 opacity-60" aria-hidden />
            Sin reservas para {dateView.toLowerCase()}.
          </p>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva reserva"
        description="Registra una reserva y verifica la disponibilidad de mesas."
        className="max-w-xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={create}>
              <Check />
              Guardar reserva
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label required>Cliente</Label>
            <Input
              value={draft.customer}
              onChange={(e) => setDraft({ ...draft, customer: e.target.value })}
              placeholder="Nombre del cliente"
            />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              placeholder="300 000 0000"
            />
          </div>
          <div>
            <Label required>Personas</Label>
            <Input
              type="number"
              min={1}
              value={draft.people}
              onChange={(e) => setDraft({ ...draft, people: e.target.value })}
            />
          </div>
          <div>
            <Label required>Fecha</Label>
            <Select value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })}>
              <option>Hoy</option>
              <option>Mañana</option>
            </Select>
          </div>
          <div>
            <Label required>Hora</Label>
            <Input
              type="time"
              value={draft.time}
              onChange={(e) => setDraft({ ...draft, time: e.target.value })}
            />
          </div>
          <div>
            <Label>Zona</Label>
            <Select
              value={draft.zone}
              onChange={(e) => setDraft({ ...draft, zone: e.target.value, table: '' })}
            >
              {tableZones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label required>Mesa disponible</Label>
            <Select value={draft.table} onChange={(e) => setDraft({ ...draft, table: e.target.value })}>
              <option value="">Seleccionar...</option>
              {availableTables.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Duración (min)</Label>
            <Input
              type="number"
              min={30}
              step={15}
              value={draft.durationMin}
              onChange={(e) => setDraft({ ...draft, durationMin: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Observaciones</Label>
            <Textarea
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              placeholder="Preferencias del cliente..."
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Estaciones                                                                */
/* -------------------------------------------------------------------------- */

interface StationDraft {
  name: string
  user: string
  status: StationStatus
}

function EstacionesSection({ onToast }: { onToast: ToastFn }) {
  const [items, setItems] = React.useState<Station[]>(seedStations)
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<StationDraft>({ name: '', user: staffNames[0], status: 'ACTIVA' })

  const create = () => {
    if (!draft.name) {
      onToast('Ingresa el nombre de la estación', 'error')
      return
    }
    setItems((prev) => [
      {
        id: `s-${Date.now()}`,
        name: draft.name,
        status: draft.status,
        pending: 0,
        preparing: 0,
        ready: 0,
        avgMin: 0,
        user: draft.user,
      },
      ...prev,
    ])
    setOpen(false)
    setDraft({ name: '', user: staffNames[0], status: 'ACTIVA' })
    onToast(`Estación ${draft.name} creada`)
  }

  const toggle = (s: Station) => {
    const next: StationStatus = s.status === 'ACTIVA' ? 'PAUSADA' : 'ACTIVA'
    setItems((prev) => prev.map((it) => (it.id === s.id ? { ...it, status: next } : it)))
    onToast(`${s.name} ${next === 'ACTIVA' ? 'activada' : 'pausada'}`)
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Estaciones de preparación"
        description="Puntos de producción y su carga de trabajo."
        actions={
          <Button variant="primary" size="md" onClick={() => setOpen(true)}>
            <Plus />
            Nueva estación
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((s) => (
          <Card key={s.id} className="flex flex-col gap-4 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.user}</p>
              </div>
              <Badge variant={stationStatusVariant[s.status]} size="sm" dot>
                {stationStatusLabel[s.status]}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Pend.', value: s.pending, tone: 'text-warning-foreground' },
                { label: 'Prep.', value: s.preparing, tone: 'text-primary' },
                { label: 'Listas', value: s.ready, tone: 'text-success' },
              ].map((m) => (
                <div key={m.label} className="rounded-lg bg-muted/60 py-2">
                  <p className={cn('text-xl font-bold tabular-nums', m.tone)}>{m.value}</p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-3.5" aria-hidden />
                Prom. {s.avgMin} min
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onToast(`Editar ${s.name} (demo)`)}
                  aria-label={`Editar ${s.name}`}
                  className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-4"
                >
                  <Pencil />
                </button>
                <button
                  type="button"
                  onClick={() => toggle(s)}
                  aria-label={`${s.status === 'ACTIVA' ? 'Pausar' : 'Activar'} ${s.name}`}
                  className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-4"
                >
                  <Power />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva estación"
        description="Crea un punto de producción y asígnale un responsable."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={create}>
              <Check />
              Crear estación
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <Label required>Nombre</Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Ej. Wok, Fritos, Ensaladas"
            />
          </div>
          <div>
            <Label>Usuario asignado</Label>
            <Select value={draft.user} onChange={(e) => setDraft({ ...draft, user: e.target.value })}>
              {staffNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Estado</Label>
            <Select
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as StationStatus })}
            >
              {(Object.keys(stationStatusLabel) as StationStatus[]).map((s) => (
                <option key={s} value={s}>
                  {stationStatusLabel[s]}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Recetas                                                                   */
/* -------------------------------------------------------------------------- */

function RecetasSection({ onToast }: { onToast: ToastFn }) {
  const [selected, setSelected] = React.useState<Recipe | null>(null)

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Recetas"
        description="Fichas técnicas de productos. La estructura está lista para descontar inventario más adelante."
        actions={
          <Button variant="primary" size="md" onClick={() => onToast('Nueva receta (demo)')}>
            <Plus />
            Nueva receta
          </Button>
        }
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead className="hidden md:table-cell">Estación</TableHead>
            <TableHead className="hidden lg:table-cell">Ingredientes</TableHead>
            <TableHead className="hidden sm:table-cell">Tiempo</TableHead>
            <TableHead className="text-right">Costo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recipes.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.product}</TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="neutral" size="sm">
                  {r.station}
                </Badge>
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {r.ingredients.length} ingredientes
              </TableCell>
              <TableCell className="hidden tabular-nums text-muted-foreground sm:table-cell">
                {r.prepMin} min
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatCurrency(recipeTotalCost(r))}
              </TableCell>
              <TableCell>
                <Badge variant={r.active ? 'success' : 'neutral'} size="sm" dot>
                  {r.active ? 'Activa' : 'Inactiva'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setSelected(r)}
                    aria-label={`Ver receta de ${r.product}`}
                    className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-4"
                  >
                    <Eye />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToast(`Receta de ${r.product} duplicada`)}
                    aria-label={`Duplicar receta de ${r.product}`}
                    className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-4"
                  >
                    <Copy />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToast(`Editar receta de ${r.product} (demo)`)}
                    aria-label={`Editar receta de ${r.product}`}
                    className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-4"
                  >
                    <Pencil />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? selected.product : ''}
        description={selected ? `${selected.station} · ${selected.prepMin} min de preparación` : ''}
        className="max-w-xl"
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingrediente</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Merma</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selected.ingredients.map((ing) => (
                  <TableRow key={ing.name}>
                    <TableCell className="font-medium">{ing.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {ing.qty} {ing.unit}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {ing.merma}%
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(ing.cost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between rounded-lg bg-muted/60 px-4 py-3">
              <span className="text-sm font-medium text-foreground">Costo total</span>
              <span className="text-lg font-bold tabular-nums text-foreground">
                {formatCurrency(recipeTotalCost(selected))}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Historial                                                                 */
/* -------------------------------------------------------------------------- */

function HistorialSection() {
  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState<(typeof historyStatusOptions)[number]>('TODOS')
  const [station, setStation] = React.useState('Todas')

  const filtered = historyRows.filter((r) => {
    const matchesQuery =
      !query ||
      [r.code, r.comanda, r.table, r.customer, r.user].join(' ').toLowerCase().includes(query.toLowerCase())
    const matchesStatus = status === 'TODOS' || r.status === status
    const matchesStation = station === 'Todas' || r.station === station
    return matchesQuery && matchesStatus && matchesStation
  })

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Historial de preparación"
        description="Órdenes finalizadas y canceladas del período."
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar orden, cliente, usuario..."
          leadingIcon={<Search />}
          className="sm:w-64"
          aria-label="Buscar en historial"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          aria-label="Filtrar por estado"
          className="sm:w-44"
        >
          {historyStatusOptions.map((s) => (
            <option key={s} value={s}>
              {s === 'TODOS' ? 'Todos los estados' : orderStatusLabel[s as OrderStatus]}
            </option>
          ))}
        </Select>
        <Select
          value={station}
          onChange={(e) => setStation(e.target.value)}
          aria-label="Filtrar por estación"
          className="sm:w-44"
        >
          <option value="Todas">Todas las estaciones</option>
          {stationNames.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Orden</TableHead>
            <TableHead className="hidden sm:table-cell">Comanda</TableHead>
            <TableHead>Mesa</TableHead>
            <TableHead className="hidden md:table-cell">Cliente</TableHead>
            <TableHead className="hidden lg:table-cell">Estación</TableHead>
            <TableHead className="hidden xl:table-cell">Inicio</TableHead>
            <TableHead className="hidden xl:table-cell">Fin</TableHead>
            <TableHead className="text-right">Tiempo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="hidden lg:table-cell">Usuario</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.code}</TableCell>
              <TableCell className="hidden tabular-nums text-muted-foreground sm:table-cell">
                {r.comanda}
              </TableCell>
              <TableCell>{r.table}</TableCell>
              <TableCell className="hidden md:table-cell">{r.customer}</TableCell>
              <TableCell className="hidden lg:table-cell">{r.station}</TableCell>
              <TableCell className="hidden tabular-nums text-muted-foreground xl:table-cell">
                {r.start}
              </TableCell>
              <TableCell className="hidden tabular-nums text-muted-foreground xl:table-cell">
                {r.end}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {r.durationMin > 0 ? `${r.durationMin} min` : '—'}
              </TableCell>
              <TableCell>
                <Badge variant={orderStatusVariant[r.status]} size="sm" dot>
                  {orderStatusLabel[r.status]}
                </Badge>
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">{r.user}</TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                No se encontraron registros con los filtros aplicados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <p className="text-xs text-muted-foreground">
        {filtered.length} de {historyRows.length} registros
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Indicadores                                                               */
/* -------------------------------------------------------------------------- */

function IndicadoresSection() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Indicadores"
        description="Desempeño operativo de la preparación."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {indicatorStats.map((ind) => (
          <IndicatorCard key={ind.id} indicator={ind} />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {indicatorCharts.map((spec, i) => (
          <ChartCard key={i} spec={spec} />
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
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2">
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

export function Preparacion() {
  const [section, setSection] = React.useState<SectionId>('dashboard')
  const [toast, setToast] = React.useState<{ message: string; kind: ToastKind } | null>(null)
  const [detail, setDetail] = React.useState<PrepOrder | null>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = React.useCallback<ToastFn>((message, kind = 'success') => {
    setToast({ message, kind })
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Preparación</h1>
        <p className="text-sm text-muted-foreground">
          Cocina, comandas y servicio en mesa · {sectionLabelById[section]}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <SectionMenu selected={section} onSelect={setSection} />
        </aside>

        <div className="min-w-0">
          {section === 'dashboard' && (
            <DashboardSection orders={seedOrders} onView={setDetail} onToast={showToast} />
          )}
          {section === 'ordenes' && <OrdenesSection onToast={showToast} onView={setDetail} />}
          {section === 'comandas' && <ComandasSection onToast={showToast} />}
          {section === 'kds' && <KdsSection onToast={showToast} />}
          {section === 'mesas' && <MesasSection onToast={showToast} />}
          {section === 'reservas' && <ReservasSection onToast={showToast} />}
          {section === 'estaciones' && <EstacionesSection onToast={showToast} />}
          {section === 'recetas' && <RecetasSection onToast={showToast} />}
          {section === 'historial' && <HistorialSection />}
          {section === 'indicadores' && <IndicadoresSection />}
        </div>
      </div>

      <OrderDetailModal order={detail} open={!!detail} onClose={() => setDetail(null)} />

      {toast && <Toast message={toast.message} kind={toast.kind} />}
    </div>
  )
}
