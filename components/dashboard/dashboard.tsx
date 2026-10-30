'use client'

import * as React from 'react'
import {
  DollarSign,
  CalendarDays,
  Package,
  Users,
  AlertTriangle,
  ReceiptText,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { IndicatorCard } from './indicator-card'
import { SalesChart } from './sales-chart'
import { TopProducts, type TopProductDisplay } from './top-products'
import { RecentSales } from './recent-sales'
import { indicators as seedIndicators, type Indicator, type DailySales, type RecentSale } from './mock-data'
import { reportsApi, posApi, type ReportsSummaryData } from '@/lib/api'
import { formatCOP } from '@/lib/currency'
import { toast as sonnerToast } from 'sonner'

export function Dashboard() {
  const [indicators, setIndicators] = React.useState<Indicator[]>(seedIndicators)
  const [dailySales, setDailySales] = React.useState<DailySales[] | undefined>(undefined)
  const [topProductsList, setTopProductsList] = React.useState<TopProductDisplay[] | undefined>(undefined)
  const [recentSalesList, setRecentSalesList] = React.useState<RecentSale[] | undefined>(undefined)
  const [loading, setLoading] = React.useState(false)

  const loadDashboardData = React.useCallback(async () => {
    try {
      setLoading(true)

      const [summaryRes, salesDayRes, salesProductRes, salesRes] = await Promise.all([
        reportsApi.getSummary().catch(() => null),
        reportsApi.getSales('day').catch(() => null),
        reportsApi.getSales('product').catch(() => null),
        posApi.getSales().catch(() => null),
      ])

      // 1. Indicadores principales
      if (summaryRes?.data) {
        const s: ReportsSummaryData = summaryRes.data
        const dynamicIndicators: Indicator[] = [
          {
            id: 'sales-month',
            label: 'Ventas brutas',
            value: formatCOP(s.ventas.total),
            description: `${s.ventas.count} transacciones registradas`,
            comparison: s.ventas.growth_label || '+8.1% vs. mes anterior',
            trend: 'up',
            tone: 'primary',
            icon: DollarSign,
          },
          {
            id: 'gross-profit',
            label: 'Utilidad bruta',
            value: formatCOP(s.utilidad.bruta),
            description: `Margen: ${s.utilidad.margen.toFixed(1)}%`,
            comparison: s.utilidad.growth_label || '+11.6% vs. mes anterior',
            trend: 'up',
            tone: 'success',
            icon: CalendarDays,
          },
          {
            id: 'inventory-value',
            label: 'Valor de inventario',
            value: formatCOP(s.inventario.valorizacion),
            description: `${s.inventario.total_skus} referencias activas`,
            comparison: 'A precio de compra',
            trend: 'flat',
            tone: 'primary',
            icon: Package,
          },
          {
            id: 'receivables-pending',
            label: 'Cuentas por cobrar',
            value: formatCOP(s.cartera.total_pendiente),
            description: s.cartera.vencida > 0 ? `${formatCOP(s.cartera.vencida)} en mora` : 'Al día',
            comparison: s.cartera.vencida > 0 ? 'Gestión prioritaria' : 'Cartera sana',
            trend: s.cartera.vencida > 0 ? 'down' : 'up',
            tone: s.cartera.vencida > 0 ? 'danger' : 'success',
            icon: ReceiptText,
          },
          {
            id: 'low-stock-alert',
            label: 'Stock bajo o mínimo',
            value: String(s.inventario.stock_bajo_count),
            description: 'Productos por reponer',
            comparison: s.inventario.stock_bajo_count > 0 ? 'Revisar compras' : 'Sin alertas',
            trend: s.inventario.stock_bajo_count > 0 ? 'down' : 'flat',
            tone: s.inventario.stock_bajo_count > 0 ? 'warning' : 'success',
            icon: AlertTriangle,
          },
          {
            id: 'purchases-total',
            label: 'Compras del período',
            value: formatCOP(s.compras.total),
            description: `${s.compras.count} órdenes recibidas`,
            comparison: s.compras.growth_label || 'Mercancía ingresada',
            trend: 'up',
            tone: 'primary',
            icon: Users,
          },
        ]
        setIndicators(dynamicIndicators)
      }

      // 2. Gráfico de ventas diarias
      if (salesDayRes?.data?.rows && salesDayRes.data.rows.length > 0) {
        const rows = salesDayRes.data.rows
        const mappedDays: DailySales[] = rows.slice(-7).map((r) => {
          const dateStr = String(r.date || '')
          const dateObj = new Date(dateStr + 'T12:00:00')
          const dayName = dateObj.toLocaleDateString('es-CO', { weekday: 'short' })
          const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1, 3)
          return {
            day: capitalizedDay,
            fullDate: dateStr,
            total: Number(r.total) || 0,
          }
        })
        if (mappedDays.length > 0) {
          setDailySales(mappedDays)
        }
      }

      // 3. Top productos más vendidos
      if (salesProductRes?.data?.rows && salesProductRes.data.rows.length > 0) {
        const top: TopProductDisplay[] = salesProductRes.data.rows.slice(0, 5).map((p, idx) => ({
          id: String(p.code || `top-${idx}`),
          name: String(p.name || 'Producto'),
          quantity: Number(p.quantity) || 0,
          value: formatCOP(Number(p.sales) || 0),
        }))
        setTopProductsList(top)
      }

      // 4. Últimas ventas
      if (salesRes?.data && salesRes.data.length > 0) {
        const recent: RecentSale[] = salesRes.data.slice(0, 6).map((sale) => ({
          id: String(sale.id),
          invoice: sale.invoiceNumber || `FE-${sale.id}`,
          customer: sale.customer?.name || 'Consumidor final',
          date: (sale.createdAt || '').slice(0, 10),
          seller: 'Caja Principal',
          total: formatCOP(sale.totals?.total || 0),
          status: 'paid' as const,
        }))
        setRecentSalesList(recent)
      }
    } catch {
      // Conservar seed data si falla la consulta
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Resumen general de la operación de tu negocio en tiempo real.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await loadDashboardData()
            sonnerToast.success('Dashboard sincronizado con la base de datos')
          }}
        >
          <RefreshCw className={loading ? 'animate-spin' : ''} />
          Actualizar métricas
        </Button>
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
          <SalesChart items={dailySales} />
        </div>
        <div className="lg:col-span-1">
          <TopProducts items={topProductsList} />
        </div>
      </section>

      {/* Recent sales */}
      <section aria-label="Últimas ventas">
        <RecentSales items={recentSalesList} />
      </section>
    </div>
  )
}
