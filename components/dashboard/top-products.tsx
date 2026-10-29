import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/jeralpos/card'
import { topProducts } from './mock-data'

export function TopProducts() {
  const maxQty = Math.max(...topProducts.map((p) => p.quantity))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Productos más vendidos</CardTitle>
        <CardDescription>Ranking por unidades vendidas este mes</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {topProducts.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                  {p.value}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(p.quantity / maxQty) * 100}%` }}
                  />
                </div>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {p.quantity} uds
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
