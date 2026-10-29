import {
  DollarSign,
  CalendarDays,
  Package,
  Users,
  AlertTriangle,
  ReceiptText,
  type LucideIcon,
} from 'lucide-react'

export type IndicatorTone = 'primary' | 'success' | 'warning' | 'danger'
export type TrendDirection = 'up' | 'down' | 'flat'

export interface Indicator {
  id: string
  label: string
  value: string
  description: string
  comparison: string
  trend: TrendDirection
  tone: IndicatorTone
  icon: LucideIcon
}

export const indicators: Indicator[] = [
  {
    id: 'sales-day',
    label: 'Ventas del día',
    value: '$18,420.00',
    description: '142 transacciones',
    comparison: '+12.4% vs. ayer',
    trend: 'up',
    tone: 'success',
    icon: DollarSign,
  },
  {
    id: 'sales-month',
    label: 'Ventas del mes',
    value: '$412,930.00',
    description: 'Meta: $500,000',
    comparison: '+8.1% vs. mes anterior',
    trend: 'up',
    tone: 'primary',
    icon: CalendarDays,
  },
  {
    id: 'products-sold',
    label: 'Productos vendidos',
    value: '3,847',
    description: 'Unidades este mes',
    comparison: '+5.3% vs. mes anterior',
    trend: 'up',
    tone: 'primary',
    icon: Package,
  },
  {
    id: 'customers',
    label: 'Clientes',
    value: '1,284',
    description: '46 nuevos este mes',
    comparison: '+3.7% vs. mes anterior',
    trend: 'up',
    tone: 'success',
    icon: Users,
  },
  {
    id: 'low-stock',
    label: 'Stock bajo',
    value: '7',
    description: 'Productos por reponer',
    comparison: '+2 vs. semana anterior',
    trend: 'down',
    tone: 'warning',
    icon: AlertTriangle,
  },
  {
    id: 'receivables',
    label: 'Cuentas por cobrar',
    value: '$34,750.00',
    description: '18 facturas pendientes',
    comparison: '-4.2% vs. mes anterior',
    trend: 'up',
    tone: 'danger',
    icon: ReceiptText,
  },
]

export interface DailySales {
  day: string
  fullDate: string
  total: number
}

export const salesLast7Days: DailySales[] = [
  { day: 'Lun', fullDate: '15 sep', total: 12480 },
  { day: 'Mar', fullDate: '16 sep', total: 15230 },
  { day: 'Mié', fullDate: '17 sep', total: 11870 },
  { day: 'Jue', fullDate: '18 sep', total: 18940 },
  { day: 'Vie', fullDate: '19 sep', total: 22610 },
  { day: 'Sáb', fullDate: '20 sep', total: 26380 },
  { day: 'Dom', fullDate: '21 sep', total: 18420 },
]

export interface TopProduct {
  id: string
  name: string
  category: string
  quantity: number
  value: string
}

export const topProducts: TopProduct[] = [
  { id: 'p1', name: 'Café Molido Premium 500g', category: 'Bebidas', quantity: 342, value: '$8,550.00' },
  { id: 'p2', name: 'Pan Artesanal Integral', category: 'Panadería', quantity: 289, value: '$4,335.00' },
  { id: 'p3', name: 'Leche Entera 1L', category: 'Lácteos', quantity: 254, value: '$3,048.00' },
  { id: 'p4', name: 'Aceite de Oliva Extra 750ml', category: 'Abarrotes', quantity: 187, value: '$9,350.00' },
  { id: 'p5', name: 'Queso Manchego 250g', category: 'Lácteos', quantity: 163, value: '$7,335.00' },
]

export type SaleStatus = 'paid' | 'pending' | 'cancelled'

export interface RecentSale {
  id: string
  invoice: string
  customer: string
  date: string
  seller: string
  total: string
  status: SaleStatus
}

export const recentSales: RecentSale[] = [
  {
    id: 's1',
    invoice: 'F-002481',
    customer: 'María González',
    date: '21 sep, 14:32',
    seller: 'Carlos Ruiz',
    total: '$1,240.00',
    status: 'paid',
  },
  {
    id: 's2',
    invoice: 'F-002480',
    customer: 'Distribuidora El Sol',
    date: '21 sep, 13:15',
    seller: 'Ana Torres',
    total: '$3,890.00',
    status: 'pending',
  },
  {
    id: 's3',
    invoice: 'F-002479',
    customer: 'Jorge Martínez',
    date: '21 sep, 12:48',
    seller: 'Carlos Ruiz',
    total: '$620.00',
    status: 'paid',
  },
  {
    id: 's4',
    invoice: 'F-002478',
    customer: 'Laura Fernández',
    date: '21 sep, 11:20',
    seller: 'Miguel Ángel',
    total: '$2,150.00',
    status: 'paid',
  },
  {
    id: 's5',
    invoice: 'F-002477',
    customer: 'Comercial Andina',
    date: '21 sep, 10:05',
    seller: 'Ana Torres',
    total: '$5,430.00',
    status: 'cancelled',
  },
  {
    id: 's6',
    invoice: 'F-002476',
    customer: 'Pedro Sánchez',
    date: '21 sep, 09:41',
    seller: 'Miguel Ángel',
    total: '$980.00',
    status: 'paid',
  },
]

export const statusConfig: Record<
  SaleStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' }
> = {
  paid: { label: 'Pagada', variant: 'success' },
  pending: { label: 'Pendiente', variant: 'warning' },
  cancelled: { label: 'Anulada', variant: 'danger' },
}
