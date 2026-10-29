'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/jeralpos/card'
import { Badge } from '@/components/jeralpos/badge'
import { formatCOP } from '@/lib/currency'
import { salesLast7Days } from './mock-data'

const currency = (n: number) => formatCOP(n)

export function SalesChart() {
  const [active, setActive] = useState<number | null>(null)
  const max = Math.max(...salesLast7Days.map((d) => d.total))
  const total = salesLast7Days.reduce((sum, d) => sum + d.total, 0)
  const gridLines = [0, 25, 50, 75, 100]

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle>Ventas de los últimos 7 días</CardTitle>
          <CardDescription>Ingresos diarios de la semana en curso</CardDescription>
        </div>
        <Badge variant="primary" size="md" dot>
          Total {currency(total)}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Grid lines */}
          <div className="absolute inset-0 bottom-8 flex flex-col-reverse justify-between">
            {gridLines.map((g) => (
              <div key={g} className="flex items-center gap-2">
                <span className="w-10 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
                  {currency((max * g) / 100)}
                </span>
                <span className="h-px flex-1 bg-border/70" />
              </div>
            ))}
          </div>

          {/* Bars */}
          <div className="relative flex h-56 items-end gap-2 pl-12 sm:gap-3">
            {salesLast7Days.map((d, i) => {
              const heightPct = (d.total / max) * 100
              const isActive = active === i
              return (
                <div
                  key={d.day}
                  className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  tabIndex={0}
                  role="img"
                  aria-label={`${d.fullDate}: ${currency(d.total)}`}
                >
                  <span
                    className={`text-xs font-semibold tabular-nums transition-opacity ${
                      isActive ? 'opacity-100 text-foreground' : 'opacity-0'
                    }`}
                  >
                    {currency(d.total)}
                  </span>
                  <div
                    className={`w-full max-w-12 rounded-t-md transition-all duration-200 ${
                      isActive ? 'bg-primary' : 'bg-primary/70 group-hover:bg-primary'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              )
            })}
          </div>

          {/* X-axis labels */}
          <div className="flex gap-2 pl-12 sm:gap-3">
            {salesLast7Days.map((d) => (
              <div
                key={d.day}
                className="flex flex-1 flex-col items-center gap-0.5 pt-2 text-center"
              >
                <span className="text-xs font-medium text-foreground">{d.day}</span>
                <span className="text-[10px] text-muted-foreground">{d.fullDate}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
