import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/jeralpos/card'
import { cn } from '@/lib/utils'
import type { Indicator } from './mock-data'

const trendStyles = {
  up: { icon: TrendingUp, badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  down: { icon: TrendingDown, badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  flat: { icon: Minus, badge: 'bg-muted text-muted-foreground border-border' },
}

export function IndicatorCard({ indicator }: { indicator: Indicator }) {
  const trend = trendStyles[indicator.trend]
  const TrendIcon = trend.icon
  const Icon = indicator.icon

  return (
    <Card interactive className="rounded-2xl border-border/70 hover:shadow-md transition-all duration-200">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
              {indicator.label}
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-foreground">
              {indicator.value}
            </p>
          </div>
          <span
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-border/60 bg-muted/40 text-foreground/80 shadow-2xs"
            aria-hidden
          >
            <Icon className="size-4.5" />
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-1">
          <p className="text-xs text-muted-foreground">{indicator.description}</p>
          <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium', trend.badge)}>
            <TrendIcon className="size-3" aria-hidden />
            {indicator.comparison}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
