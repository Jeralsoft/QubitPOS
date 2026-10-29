import { IndicatorCard } from './indicator-card'
import { SalesChart } from './sales-chart'
import { TopProducts } from './top-products'
import { RecentSales } from './recent-sales'
import { indicators } from './mock-data'

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Resumen general de la operación de tu negocio en tiempo real.
        </p>
      </div>

      {/* Indicators */}
      <section aria-label="Indicadores">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {indicators.map((indicator) => (
            <IndicatorCard key={indicator.id} indicator={indicator} />
          ))}
        </div>
      </section>

      {/* Chart + Top products */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3" aria-label="Análisis de ventas">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div className="lg:col-span-1">
          <TopProducts />
        </div>
      </section>

      {/* Recent sales */}
      <section aria-label="Últimas ventas">
        <RecentSales />
      </section>
    </div>
  )
}
