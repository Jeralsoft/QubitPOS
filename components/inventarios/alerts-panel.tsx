import { AlertTriangle, PackageX } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/jeralpos/card'
import { Badge } from '@/components/jeralpos/badge'
import { Button } from '@/components/jeralpos/button'
import { lowStockProducts, outOfStockProducts, type Product } from './mock-data'

function AlertRow({
  product,
  tone,
}: {
  product: Product
  tone: 'warning' | 'danger'
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/50 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-md text-xs font-bold text-white"
          style={{ backgroundColor: product.color }}
          aria-hidden
        >
          {product.name.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
          <p className="text-xs text-muted-foreground">{product.code}</p>
        </div>
      </div>
      <Badge variant={tone}>
        {product.stock} / {product.minStock} mín.
      </Badge>
    </li>
  )
}

function AlertCard({
  title,
  icon,
  tone,
  emptyLabel,
  products,
}: {
  title: string
  icon: React.ReactNode
  tone: 'warning' | 'danger'
  emptyLabel: string
  products: Product[]
}) {
  const wrap =
    tone === 'warning'
      ? 'bg-warning-muted text-warning-foreground'
      : 'bg-danger-muted text-danger'
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 border-b border-border">
        <CardTitle className="flex items-center gap-2">
          <span className={`grid size-8 place-items-center rounded-lg ${wrap}`} aria-hidden>
            {icon}
          </span>
          {title}
        </CardTitle>
        <Badge variant={tone}>{products.length}</Badge>
      </CardHeader>
      <CardContent className="p-4">
        {products.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {products.map((p) => (
              <AlertRow key={p.id} product={p} tone={tone} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export function AlertsPanel({ onReorder }: { onReorder?: () => void }) {
  return (
    <section aria-label="Alertas de inventario" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Alertas</h2>
        {onReorder && (
          <Button variant="outline" size="sm" onClick={onReorder}>
            Generar pedido de reposición
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AlertCard
          title="Stock bajo"
          icon={<AlertTriangle className="size-4" />}
          tone="warning"
          emptyLabel="Sin productos por debajo del mínimo."
          products={lowStockProducts}
        />
        <AlertCard
          title="Sin stock"
          icon={<PackageX className="size-4" />}
          tone="danger"
          emptyLabel="No hay productos agotados."
          products={outOfStockProducts}
        />
      </div>
    </section>
  )
}
