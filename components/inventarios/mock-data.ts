import { products, formatCurrency, stockLevel, type Product } from '@/components/productos/mock-data'

export { products, formatCurrency, stockLevel }
export type { Product }

export type MovementType = 'entrada' | 'salida' | 'ajuste' | 'transferencia' | 'devolucion'

export interface Movement {
  id: string
  date: string
  productId: string
  productName: string
  productCode: string
  type: MovementType
  quantity: number
  user: string
  note: string
}

export const movementTypeMeta: Record<
  MovementType,
  { label: string; variant: 'success' | 'danger' | 'warning' | 'primary' | 'neutral'; sign: 1 | -1 | 0 }
> = {
  entrada: { label: 'Entrada', variant: 'success', sign: 1 },
  salida: { label: 'Salida', variant: 'danger', sign: -1 },
  ajuste: { label: 'Ajuste', variant: 'warning', sign: 0 },
  transferencia: { label: 'Transferencia', variant: 'primary', sign: 0 },
  devolucion: { label: 'Devolución', variant: 'neutral', sign: 1 },
}

export const movements: Movement[] = [
  {
    id: 'MOV-1042',
    date: '2026-09-22T09:14:00',
    productId: '1',
    productName: 'Coca-Cola 600ml',
    productCode: 'BEB-0001',
    type: 'entrada',
    quantity: 120,
    user: 'María López',
    note: 'Recepción de pedido a proveedor Coca-Cola',
  },
  {
    id: 'MOV-1041',
    date: '2026-09-22T08:47:00',
    productId: '3',
    productName: 'Leche entera 1L',
    productCode: 'LAC-0014',
    type: 'salida',
    quantity: 24,
    user: 'Carlos Ruiz',
    note: 'Venta de mostrador ticket #8841',
  },
  {
    id: 'MOV-1040',
    date: '2026-09-21T18:20:00',
    productId: '5',
    productName: 'Café soluble 170g',
    productCode: 'ABA-0033',
    type: 'ajuste',
    quantity: -3,
    user: 'Ana Torres',
    note: 'Merma por producto dañado en anaquel',
  },
  {
    id: 'MOV-1039',
    date: '2026-09-21T16:05:00',
    productId: '7',
    productName: 'Agua mineral 1.5L',
    productCode: 'BEB-0002',
    type: 'transferencia',
    quantity: 60,
    user: 'María López',
    note: 'Traslado a sucursal Centro',
  },
  {
    id: 'MOV-1038',
    date: '2026-09-21T12:38:00',
    productId: '4',
    productName: 'Galletas surtidas 300g',
    productCode: 'SNK-0021',
    type: 'devolucion',
    quantity: 6,
    user: 'Carlos Ruiz',
    note: 'Devolución de cliente por empaque abierto',
  },
  {
    id: 'MOV-1037',
    date: '2026-09-20T11:10:00',
    productId: '2',
    productName: 'Pan de caja blanco',
    productCode: 'PAN-0007',
    type: 'entrada',
    quantity: 48,
    user: 'Ana Torres',
    note: 'Recepción de pedido a proveedor Bimbo',
  },
  {
    id: 'MOV-1036',
    date: '2026-09-20T10:02:00',
    productId: '6',
    productName: 'Detergente líquido 1L',
    productCode: 'LIM-0040',
    type: 'salida',
    quantity: 15,
    user: 'María López',
    note: 'Venta a cliente mayorista',
  },
  {
    id: 'MOV-1035',
    date: '2026-09-19T17:44:00',
    productId: '8',
    productName: 'Yogur natural 500g',
    productCode: 'LAC-0015',
    type: 'ajuste',
    quantity: -2,
    user: 'Ana Torres',
    note: 'Ajuste por caducidad próxima',
  },
]

export interface InventorySummary {
  totalProducts: number
  availableStock: number
  lowStockCount: number
  outOfStockCount: number
  inventoryValue: number
}

export function getInventorySummary(list: Product[] = products): InventorySummary {
  return list.reduce<InventorySummary>(
    (acc, p) => {
      acc.totalProducts += 1
      acc.availableStock += p.stock
      acc.inventoryValue += p.stock * p.purchasePrice
      const level = stockLevel(p)
      if (level === 'out') acc.outOfStockCount += 1
      if (level === 'low') acc.lowStockCount += 1
      return acc
    },
    {
      totalProducts: 0,
      availableStock: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      inventoryValue: 0,
    },
  )
}

export const lowStockProducts = products.filter((p) => stockLevel(p) === 'low')
export const outOfStockProducts = products.filter((p) => stockLevel(p) === 'out')

export function formatMovementDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}
