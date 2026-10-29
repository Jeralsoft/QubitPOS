import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/jeralpos/card'
import { cn } from '@/lib/utils'
import type { Indicator } from './mock-data'

const toneStyles: Record<
  Indicator['tone'],
  { iconWrap: string; accent: string }
> = {
  primary: { iconWrap: 'bg-info-muted text-primary', accent: 'text-primary' },
  success: { iconWrap: 'bg-success-muted text-success', accent: 'text-success' },
  warning: { iconWrap: 'bg-warning-muted text-warning-foreground', accent: 'text-warning-foreground' },
  danger: { iconWrap: 'bg-danger-muted text-danger', accent: 'text-danger' },
}

const trendStyles = {
  up: { icon: TrendingUp, color: 'text-success' },
  down: { icon: TrendingDown, color: 'text-danger' },
  flat: { icon: Minus, color: 'text-muted-foreground' },
}

export function IndicatorCard({ indicator }: { indicator: Indicator }) {
  const tone = toneStyles[indicator.tone]
  const trend = trendStyles[indicator.trend]
  const TrendIcon = trend.icon
  const Icon = indicator.icon

  return (
    <Card interactive>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-muted-foreground">{indicator.label}</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
              {indicator.value}
            </p>
          </div>
          <span
            className={cn('grid size-11 shrink-0 place-items-center rounded-xl', tone.iconWrap)}
            aria-hidden
          >
            <Icon className="size-5" />
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="text-xs text-muted-foreground">{indicator.description}</p>
          <span className={cn('inline-flex items-center gap-1 text-xs font-semibold', trend.color)}>
            <TrendIcon className="size-3.5" aria-hidden />
            {indicator.comparison}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
