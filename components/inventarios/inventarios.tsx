'use client'

import * as React from 'react'
import { ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal, ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { InventoryIndicators } from './indicators'
import { AlertsPanel } from './alerts-panel'
import { MovementsTable } from './movements-table'
import { MovementModal, type MovementAction } from './movement-modal'
import { getInventorySummary } from './mock-data'

const actions: Array<{
  action: MovementAction
  icon: React.ReactNode
  variant: 'success' | 'danger' | 'outline' | 'secondary'
}> = [
  {
    action: {
      type: 'entrada',
      title: 'Nueva entrada',
      description: 'Registra la recepción de mercancía al inventario.',
    },
    icon: <ArrowDownToLine />,
    variant: 'success',
  },
  {
    action: {
      type: 'salida',
      title: 'Nueva salida',
      description: 'Registra una salida de mercancía del inventario.',
    },
    icon: <ArrowUpFromLine />,
    variant: 'danger',
  },
  {
    action: {
      type: 'ajuste',
      title: 'Ajustar inventario',
      description: 'Corrige las existencias por merma, conteo o caducidad.',
    },
    icon: <SlidersHorizontal />,
    variant: 'secondary',
  },
  {
    action: {
      type: 'transferencia',
      title: 'Transferir',
      description: 'Traslada existencias entre sucursales o bodegas.',
    },
    icon: <ArrowLeftRight />,
    variant: 'outline',
  },
]

export function Inventarios() {
  const summary = React.useMemo(() => getInventorySummary(), [])
  const [activeAction, setActiveAction] = React.useState<MovementAction | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventarios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Control de existencias, movimientos y alertas de stock
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map(({ action, icon, variant }) => (
            <Button
              key={action.type}
              variant={variant}
              size="md"
              onClick={() => setActiveAction(action)}
            >
              {icon}
              {action.title}
            </Button>
          ))}
        </div>
      </header>

      <InventoryIndicators summary={summary} />

      <AlertsPanel onReorder={() => setActiveAction(actions[0].action)} />

      <MovementsTable />

      <MovementModal action={activeAction} onClose={() => setActiveAction(null)} />
    </div>
  )
}
