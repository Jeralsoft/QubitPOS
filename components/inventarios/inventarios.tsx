'use client'

import * as React from 'react'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  ArrowLeftRight,
  Upload,
  Download,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { InventoryIndicators } from './indicators'
import { AlertsPanel } from './alerts-panel'
import { MovementsTable } from './movements-table'
import { MovementModal, type MovementAction } from './movement-modal'
import { getInventorySummary } from './mock-data'
import { DataToast } from '@/components/jeralpos/data-toast'

const actions: Array<{
  action: MovementAction
  icon: React.ReactNode
  variant: 'success' | 'danger' | 'outline' | 'secondary'
}> = [
  {
    action: {
      type: 'entrada',
      title: 'Nueva entrada',
      description: 'Registra la recepción de mercancía y aumento de stock.',
    },
    icon: <ArrowDownToLine />,
    variant: 'success',
  },
  {
    action: {
      type: 'salida',
      title: 'Nueva salida',
      description: 'Registra una salida de mercancía por venta, baja o consumo interno.',
    },
    icon: <ArrowUpFromLine />,
    variant: 'danger',
  },
  {
    action: {
      type: 'ajuste',
      title: 'Ajustar inventario',
      description: 'Corrige las existencias por merma, conteo físico o caducidad.',
    },
    icon: <SlidersHorizontal />,
    variant: 'secondary',
  },
  {
    action: {
      type: 'transferencia',
      title: 'Transferir bodega',
      description: 'Traslada existencias entre sucursales o depósitos centrales.',
    },
    icon: <ArrowLeftRight />,
    variant: 'outline',
  },
]

export function Inventarios() {
  const [summary, setSummary] = React.useState(() => getInventorySummary())
  const [activeAction, setActiveAction] = React.useState<MovementAction | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [toast, setToast] = React.useState<{ msg: string; kind: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, kind: 'success' | 'error' = 'success') => {
    setToast({ msg, kind })
    setTimeout(() => setToast(null), 3000)
  }

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setSummary(getInventorySummary())
      setLoading(false)
      showToast('Kardex y existencias actualizados con éxito')
    }, 400)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Inventarios y Control de Stock
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Control de existencias físicas, movimientos Kardex, traslados entre bodegas y alertas de reabastecimiento.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => showToast('Importación masiva de conteo físico Kardex')}>
            <Upload />
            Importar
          </Button>
          <Button variant="outline" size="sm" onClick={() => showToast('Exportando reporte valorizado de inventario a Excel')}>
            <Download />
            Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            Actualizar
          </Button>
          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />
          {actions.map(({ action, icon, variant }) => (
            <Button
              key={action.type}
              variant={variant}
              size="sm"
              onClick={() => setActiveAction(action)}
            >
              {icon}
              {action.title}
            </Button>
          ))}
        </div>
      </header>

      {/* KPI Cards */}
      <InventoryIndicators summary={summary} />

      {/* Alerts */}
      <AlertsPanel onReorder={() => setActiveAction(actions[0].action)} />

      {/* Movements Kardex Table */}
      <MovementsTable />

      {/* Movement Modal */}
      <MovementModal action={activeAction} onClose={() => setActiveAction(null)} />

      {/* Toast */}
      {toast && <DataToast message={toast.msg} kind={toast.kind} />}
    </div>
  )
}
