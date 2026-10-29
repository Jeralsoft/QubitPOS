import { Boxes, PackageCheck, AlertTriangle, PackageX, Wallet } from 'lucide-react'
import { IndicatorCard } from '@/components/dashboard/indicator-card'
import type { Indicator } from '@/components/dashboard/mock-data'
import { formatCurrency, type InventorySummary } from './mock-data'

export function InventoryIndicators({ summary }: { summary: InventorySummary }) {
  const indicators: Indicator[] = [
    {
      id: 'total',
      label: 'Total productos',
      value: String(summary.totalProducts),
      description: 'Referencias en catálogo',
      icon: Boxes,
      tone: 'primary',
      trend: 'flat',
      comparison: 'Sin cambios',
    },
    {
      id: 'disponible',
      label: 'Stock disponible',
      value: new Intl.NumberFormat('es-CO').format(summary.availableStock),
      description: 'Unidades en existencia',
      icon: PackageCheck,
      tone: 'success',
      trend: 'up',
      comparison: '+180 hoy',
    },
    {
      id: 'bajo',
      label: 'Stock bajo',
      value: String(summary.lowStockCount),
      description: 'Bajo el mínimo definido',
      icon: AlertTriangle,
      tone: 'warning',
      trend: 'down',
      comparison: '-1 vs. ayer',
    },
    {
      id: 'agotados',
      label: 'Productos agotados',
      value: String(summary.outOfStockCount),
      description: 'Sin existencias',
      icon: PackageX,
      tone: 'danger',
      trend: 'flat',
      comparison: 'Requiere pedido',
    },
    {
      id: 'valor',
      label: 'Valor del inventario',
      value: formatCurrency(summary.inventoryValue),
      description: 'A precio de compra',
      icon: Wallet,
      tone: 'primary',
      trend: 'up',
      comparison: '+3.2% mensual',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {indicators.map((indicator) => (
        <IndicatorCard key={indicator.label} indicator={indicator} />
      ))}
    </div>
  )
}
