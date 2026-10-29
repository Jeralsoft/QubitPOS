'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/jeralpos/card'
import { formatValue, type ChartSpec, type ValueFormat } from './mock-data'

/** Theme-aware palette backed by the design-system chart tokens. */
const PALETTE = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

function color(index: number): string {
  return PALETTE[index % PALETTE.length]
}

/* -------------------------------------------------------------------------- */
/*  Bar chart (vertical)                                                      */
/* -------------------------------------------------------------------------- */

function BarChart({ data, format, colorful }: { data: ChartSpec['data']; format: ValueFormat; colorful?: boolean }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="flex h-64 items-end gap-2 sm:gap-3" role="img" aria-label="Gráfico de barras">
      {data.map((d, i) => {
        const pct = Math.max(2, Math.round((d.value / max) * 100))
        return (
          <div key={d.label} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
            <span className="text-[11px] font-semibold tabular-nums text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
              {formatValue(d.value, format)}
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-md transition-all duration-500 group-hover:opacity-80"
                style={{
                  height: `${pct}%`,
                  backgroundColor: colorful ? color(i) : 'var(--chart-1)',
                }}
                title={`${d.label}: ${formatValue(d.value, format)}`}
              />
            </div>
            <span className="w-full truncate text-center text-xs text-muted-foreground" title={d.label}>
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Line chart                                                                */
/* -------------------------------------------------------------------------- */

function LineChart({ data, format }: { data: ChartSpec['data']; format: ValueFormat }) {
  const values = data.map((d) => d.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1

  // Map to a 0..100 viewBox with vertical padding so the line never touches edges.
  const points = data.map((d, i) => {
    const x = data.length === 1 ? 50 : (i / (data.length - 1)) * 100
    const y = 90 - ((d.value - min) / range) * 78 - 6
    return { x, y }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L 100 100 L 0 100 Z`
  const gid = React.useId()

  return (
    <div className="relative h-64" role="img" aria-label="Gráfico de líneas">
      {/* horizontal gridlines */}
      <div className="absolute inset-0 flex flex-col justify-between">
        {[0, 1, 2, 3].map((n) => (
          <div key={n} className="border-t border-dashed border-border/60" />
        ))}
      </div>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gid})`} />
        <path
          d={linePath}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Data point dots + labels, positioned by percentage */}
      {points.map((p, i) => (
        <div
          key={i}
          className="group absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          <span className="block size-2.5 rounded-full border-2 border-card bg-[var(--chart-1)] shadow-sm" />
          <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-navy px-1.5 py-0.5 text-[10px] font-semibold text-navy-foreground opacity-0 transition-opacity group-hover:opacity-100">
            {formatValue(data[i].value, format)}
          </span>
        </div>
      ))}

      {/* X axis labels */}
      <div className="absolute inset-x-0 -bottom-6 flex justify-between">
        {data.map((d) => (
          <span key={d.label} className="text-xs text-muted-foreground">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Donut / pie chart                                                         */
/* -------------------------------------------------------------------------- */

function DonutChart({ data, format }: { data: ChartSpec['data']; format: ValueFormat }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const radius = 42
  const circumference = 2 * Math.PI * radius
  let offset = 0

  const segments = data.map((d, i) => {
    const fraction = d.value / total
    const dash = fraction * circumference
    const seg = { dash, gap: circumference - dash, offset: -offset, color: color(i), fraction }
    offset += dash
    return seg
  })

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
      <div className="relative size-44 shrink-0" role="img" aria-label="Gráfico circular">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--muted)" strokeWidth="12" />
          {segments.map((s, i) => (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth="12"
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={s.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Total</span>
          <span className="text-sm font-bold tabular-nums text-foreground">{formatValue(total, format)}</span>
        </div>
      </div>

      <ul className="flex min-w-0 flex-col gap-2">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: color(i) }} aria-hidden />
              <span className="truncate text-foreground">{d.label}</span>
            </span>
            <span className="flex shrink-0 items-center gap-2 tabular-nums">
              <span className="font-medium text-foreground">{formatValue(d.value, format)}</span>
              <span className="text-xs text-muted-foreground">{Math.round((d.value / total) * 100)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Chart card wrapper                                                        */
/* -------------------------------------------------------------------------- */

export function ChartCard({ spec, className }: { spec: ChartSpec; className?: string }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>{spec.title}</CardTitle>
            {spec.subtitle && <p className="mt-1 text-sm text-muted-foreground">{spec.subtitle}</p>}
          </div>
          <ChartKindBadge kind={spec.kind} />
        </div>
      </CardHeader>
      <CardContent className={cn(spec.kind === 'line' && 'pb-8')}>
        {spec.kind === 'bar' && <BarChart data={spec.data} format={spec.format} colorful={spec.colorful} />}
        {spec.kind === 'line' && <LineChart data={spec.data} format={spec.format} />}
        {spec.kind === 'pie' && <DonutChart data={spec.data} format={spec.format} />}
      </CardContent>
    </Card>
  )
}

function ChartKindBadge({ kind }: { kind: ChartSpec['kind'] }) {
  const label = kind === 'bar' ? 'Barras' : kind === 'line' ? 'Líneas' : 'Circular'
  return (
    <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      {label}
    </span>
  )
}
