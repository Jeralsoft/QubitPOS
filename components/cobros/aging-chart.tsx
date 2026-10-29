'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/jeralpos/card'
import { cn } from '@/lib/utils'
import { type AgingBucket, formatCurrency } from './mock-data'

const BAR_TONE: Record<AgingBucket['key'], { bar: string; dot: string; text: string }> = {
  b0_30: { bar: 'bg-success', dot: 'bg-success', text: 'text-success' },
  b31_60: { bar: 'bg-primary', dot: 'bg-primary', text: 'text-primary' },
  b61_90: { bar: 'bg-warning', dot: 'bg-warning', text: 'text-warning' },
  b90_plus: { bar: 'bg-danger', dot: 'bg-danger', text: 'text-danger' },
}

export function AgingChart({ buckets }: { buckets: AgingBucket[] }) {
  const total = buckets.reduce((s, b) => s + b.amount, 0)
  const max = Math.max(1, ...buckets.map((b) => b.amount))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Cartera por antigüedad</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Distribución del saldo pendiente por días de vencimiento
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total vencido</p>
            <p className="text-lg font-semibold tabular-nums text-foreground">
              {formatCurrency(total)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {buckets.map((b) => {
            const tone = BAR_TONE[b.key]
            const pct = total > 0 ? Math.round((b.amount / total) * 100) : 0
            const width = `${(b.amount / max) * 100}%`
            return (
              <div key={b.key} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={cn('size-2.5 rounded-full', tone.dot)} aria-hidden />
                    <span className="font-medium text-foreground">{b.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums text-muted-foreground">{pct}%</span>
                    <span className="min-w-[110px] text-right font-semibold tabular-nums text-foreground">
                      {formatCurrency(b.amount)}
                    </span>
                  </div>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', tone.bar)}
                    style={{ width }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
