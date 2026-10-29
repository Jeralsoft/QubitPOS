'use client'

import * as React from 'react'
import { Clock, Play, Check, Truck, CircleDot } from 'lucide-react'
import { Modal } from '@/components/jeralpos/modal'
import { Badge } from '@/components/jeralpos/badge'
import { cn } from '@/lib/utils'
import {
  orderStatusLabel,
  orderStatusVariant,
  timeVariant,
  formatElapsed,
  type PrepOrder,
} from './mock-data'

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  )
}

/** Timeline steps derived from the order's timestamps and status. */
function buildTimeline(order: PrepOrder) {
  const delivered = order.status === 'ENTREGADA'
  const ready = delivered || order.status === 'LISTA'
  const started = ready || order.status === 'EN_PREPARACION' || order.status === 'PAUSADA'
  return [
    { label: 'Orden creada', time: order.createdAt, done: true, icon: CircleDot },
    { label: 'Orden recibida', time: order.createdAt, done: true, icon: CircleDot },
    { label: 'Preparación iniciada', time: order.startedAt ?? '—', done: started, icon: Play },
    { label: 'Preparación finalizada', time: order.finishedAt ?? '—', done: ready, icon: Check },
    { label: 'Orden entregada', time: delivered ? order.finishedAt ?? '—' : '—', done: delivered, icon: Truck },
  ]
}

export function OrderDetailModal({
  order,
  open,
  onClose,
}: {
  order: PrepOrder | null
  open: boolean
  onClose: () => void
}) {
  if (!order) return null
  const tv = timeVariant(order.elapsedMin, order.estimatedMin)
  const timeline = buildTimeline(order)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          {order.code}
          <Badge variant={orderStatusVariant[order.status]} size="sm" dot>
            {orderStatusLabel[order.status]}
          </Badge>
        </span>
      }
      description={`Comanda ${order.comanda} · ${order.source}`}
      className="max-w-2xl"
    >
      <div className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto">
        {/* Información */}
        <section className="flex flex-col gap-1">
          <SectionTitle>Información</SectionTitle>
          <div className="grid gap-x-8 sm:grid-cols-2">
            <div className="divide-y divide-border">
              <InfoRow label="Orden" value={order.code} />
              <InfoRow label="Comanda" value={order.comanda} />
              <InfoRow label="Mesa" value={order.table} />
              <InfoRow label="Cliente" value={order.customer} />
            </div>
            <div className="divide-y divide-border">
              <InfoRow label="Mesero" value={order.waiter} />
              <InfoRow label="Personas" value={order.people} />
              <InfoRow label="Estación" value={order.station} />
              <InfoRow
                label="Prioridad"
                value={
                  <Badge variant={order.priority === 'alta' ? 'danger' : 'neutral'} size="sm">
                    {order.priority === 'alta' ? 'Alta' : 'Normal'}
                  </Badge>
                }
              />
            </div>
          </div>
        </section>

        {/* Productos */}
        <section className="flex flex-col gap-2">
          <SectionTitle>Productos</SectionTitle>
          <ul className="flex flex-col gap-2">
            {order.items.map((it, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary/10 text-sm font-bold tabular-nums text-primary">
                  {it.qty}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{it.name}</p>
                  {it.modifiers && it.modifiers.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {it.modifiers.map((m) => (
                        <Badge key={m} variant="warning" size="sm">
                          {m}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {it.note && <p className="mt-1 text-xs italic text-muted-foreground">“{it.note}”</p>}
                </div>
              </li>
            ))}
          </ul>
          {order.note && (
            <p className="rounded-lg bg-warning-muted px-3 py-2 text-sm text-warning-foreground">
              <span className="font-medium">Observación general:</span> {order.note}
            </p>
          )}
        </section>

        {/* Tiempos */}
        <section className="flex flex-col gap-2">
          <SectionTitle>Tiempos</SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Creación', value: order.createdAt },
              { label: 'Inicio', value: order.startedAt ?? '—' },
              { label: 'Estimado', value: `${order.estimatedMin} min` },
              { label: 'Finalización', value: order.finishedAt ?? '—' },
            ].map((t) => (
              <div key={t.label} className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">{t.label}</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{t.value}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" aria-hidden />
            <span className="text-sm text-muted-foreground">Tiempo transcurrido</span>
            <Badge variant={tv} size="sm" dot>
              {formatElapsed(order.elapsedMin)}
            </Badge>
          </div>
        </section>

        {/* Historial */}
        <section className="flex flex-col gap-2">
          <SectionTitle>Historial</SectionTitle>
          <ol className="relative flex flex-col gap-0 border-l border-border pl-6">
            {timeline.map((step, i) => {
              const Icon = step.icon
              return (
                <li key={i} className="relative pb-4 last:pb-0">
                  <span
                    className={cn(
                      'absolute -left-[31px] grid size-5 place-items-center rounded-full border-2 border-card [&_svg]:size-3',
                      step.done ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground',
                    )}
                    aria-hidden
                  >
                    <Icon />
                  </span>
                  <div className="flex items-center justify-between gap-3">
                    <span className={cn('text-sm', step.done ? 'text-foreground' : 'text-muted-foreground')}>
                      {step.label}
                    </span>
                    <span className="tabular-nums text-xs text-muted-foreground">{step.time}</span>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      </div>
    </Modal>
  )
}
