import {
  LayoutDashboard,
  ClipboardList,
   ReceiptText,
  MonitorPlay,
  Utensils,
  CalendarClock,
  Flame,
  BookOpen,
  History,
  BarChart3,
  Clock,
  CheckCircle2,
  Truck,
  AlertTriangle,
  CookingPot,
  Armchair,
  type LucideIcon,
} from 'lucide-react'
import type { Indicator } from '@/components/dashboard/mock-data'
import type { ChartSpec } from '@/components/reportes/mock-data'
import { formatCurrency, formatNumber } from '@/components/reportes/mock-data'

export { formatCurrency, formatNumber }
export type { ChartSpec }

/* -------------------------------------------------------------------------- */
/*  Section navigation                                                        */
/* -------------------------------------------------------------------------- */

export type SectionId =
  | 'dashboard'
  | 'ordenes'
  | 'comandas'
  | 'kds'
  | 'mesas'
  | 'reservas'
  | 'estaciones'
  | 'recetas'
  | 'historial'
  | 'indicadores'

export interface SectionDef {
  id: SectionId
  label: string
  icon: LucideIcon
}

export interface SectionGroup {
  label: string
  sections: SectionDef[]
}

export const sectionGroups: SectionGroup[] = [
  {
    label: 'Operación',
    sections: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'ordenes', label: 'Órdenes', icon: ClipboardList },
      { id: 'comandas', label: 'Comandas', icon: ReceiptText },
      { id: 'kds', label: 'KDS', icon: MonitorPlay },
    ],
  },
  {
    label: 'Servicio',
    sections: [
      { id: 'mesas', label: 'Mesas', icon: Utensils },
      { id: 'reservas', label: 'Reservas', icon: CalendarClock },
    ],
  },
  {
    label: 'Configuración',
    sections: [
      { id: 'estaciones', label: 'Estaciones', icon: Flame },
      { id: 'recetas', label: 'Recetas', icon: BookOpen },
    ],
  },
  {
    label: 'Análisis',
    sections: [
      { id: 'historial', label: 'Historial', icon: History },
      { id: 'indicadores', label: 'Indicadores', icon: BarChart3 },
    ],
  },
]

export const sectionLabelById: Record<SectionId, string> = Object.fromEntries(
  sectionGroups.flatMap((g) => g.sections.map((s) => [s.id, s.label])),
) as Record<SectionId, string>

/* -------------------------------------------------------------------------- */
/*  Dashboard KPIs                                                            */
/* -------------------------------------------------------------------------- */

export const kpis: Indicator[] = [
  {
    id: 'pendientes',
    label: 'Órdenes pendientes',
    value: '12',
    description: 'Esperando preparación',
    comparison: '+3 vs. hace 1 h',
    trend: 'up',
    tone: 'warning',
    icon: Clock,
  },
  {
    id: 'preparacion',
    label: 'En preparación',
    value: '8',
    description: 'En cocina y estaciones',
    comparison: 'En ritmo normal',
    trend: 'flat',
    tone: 'primary',
    icon: CookingPot,
  },
  {
    id: 'listas',
    label: 'Listas',
    value: '5',
    description: 'Para entregar',
    comparison: '+2 vs. hace 1 h',
    trend: 'up',
    tone: 'success',
    icon: CheckCircle2,
  },
  {
    id: 'entregadas',
    label: 'Entregadas',
    value: '24',
    description: 'En el turno de hoy',
    comparison: '+15.4% vs. ayer',
    trend: 'up',
    tone: 'success',
    icon: Truck,
  },
  {
    id: 'retrasadas',
    label: 'Retrasadas',
    value: '2',
    description: 'Sobre tiempo estimado',
    comparison: '-1 vs. ayer',
    trend: 'down',
    tone: 'danger',
    icon: AlertTriangle,
  },
  {
    id: 'reservas',
    label: 'Reservas de hoy',
    value: '14',
    description: '6 confirmadas',
    comparison: '+4 vs. ayer',
    trend: 'up',
    tone: 'primary',
    icon: CalendarClock,
  },
  {
    id: 'mesas-ocupadas',
    label: 'Mesas ocupadas',
    value: '9',
    description: 'De 20 disponibles',
    comparison: '45% ocupación',
    trend: 'flat',
    tone: 'warning',
    icon: Utensils,
  },
  {
    id: 'mesas-disponibles',
    label: 'Mesas disponibles',
    value: '11',
    description: 'Listas para asignar',
    comparison: 'Buen flujo',
    trend: 'up',
    tone: 'success',
    icon: Armchair,
  },
]

export const dashboardCharts: ChartSpec[] = [
  {
    kind: 'bar',
    title: 'Órdenes por hora',
    subtitle: 'Actividad de preparación de hoy',
    format: 'number',
    data: [
      { label: '10a', value: 9 },
      { label: '11a', value: 14 },
      { label: '12m', value: 28 },
      { label: '1p', value: 33 },
      { label: '2p', value: 22 },
      { label: '6p', value: 31 },
      { label: '7p', value: 38 },
      { label: '8p', value: 26 },
    ],
  },
  {
    kind: 'pie',
    title: 'Órdenes por estación',
    subtitle: 'Distribución de hoy',
    format: 'number',
    colorful: true,
    data: [
      { label: 'Cocina', value: 64 },
      { label: 'Parrilla', value: 38 },
      { label: 'Barra', value: 29 },
      { label: 'Despacho', value: 18 },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/*  Orders                                                                    */
/* -------------------------------------------------------------------------- */

export type OrderStatus =
  | 'PENDIENTE'
  | 'EN_PREPARACION'
  | 'LISTA'
  | 'ENTREGADA'
  | 'PAUSADA'
  | 'CANCELADA'

export const orderStatusLabel: Record<OrderStatus, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  LISTA: 'Lista',
  ENTREGADA: 'Entregada',
  PAUSADA: 'Pausada',
  CANCELADA: 'Cancelada',
}

export const orderStatusVariant: Record<
  OrderStatus,
  'neutral' | 'primary' | 'success' | 'warning' | 'danger'
> = {
  PENDIENTE: 'warning',
  EN_PREPARACION: 'primary',
  LISTA: 'success',
  ENTREGADA: 'neutral',
  PAUSADA: 'neutral',
  CANCELADA: 'danger',
}

export type OrderSource = 'Mesa' | 'Kiosco' | 'Domicilio'
export type OrderPriority = 'normal' | 'alta'

export interface OrderItem {
  qty: number
  name: string
  modifiers?: string[]
  note?: string
}

export interface PrepOrder {
  id: string
  code: string
  comanda: string
  table: string
  customer: string
  waiter: string
  people: number
  station: string
  source: OrderSource
  priority: OrderPriority
  items: OrderItem[]
  note?: string
  time: string
  createdAt: string
  startedAt?: string
  finishedAt?: string
  estimatedMin: number
  elapsedMin: number
  status: OrderStatus
}

export const orders: PrepOrder[] = [
  {
    id: 'o-1',
    code: '#ORD-1001',
    comanda: '#C-0087',
    table: 'M-12',
    customer: 'Juan Pérez',
    waiter: 'Laura Martínez',
    people: 4,
    station: 'Cocina',
    source: 'Mesa',
    priority: 'alta',
    items: [
      { qty: 2, name: 'Hamburguesa Especial', modifiers: ['Sin cebolla'], note: 'Una hamburguesa sin cebolla' },
      { qty: 1, name: 'Pizza Familiar', modifiers: ['Extra queso'] },
      { qty: 4, name: 'Gaseosa' },
      { qty: 1, name: 'Papas Grandes' },
    ],
    note: 'Una hamburguesa sin cebolla',
    time: '7:30 PM',
    createdAt: '7:28 PM',
    startedAt: '7:32 PM',
    estimatedMin: 18,
    elapsedMin: 12,
    status: 'EN_PREPARACION',
  },
  {
    id: 'o-2',
    code: '#ORD-1002',
    comanda: '#C-0088',
    table: 'M-05',
    customer: 'María González',
    waiter: 'Andrés Gómez',
    people: 2,
    station: 'Parrilla',
    source: 'Mesa',
    priority: 'normal',
    items: [
      { qty: 1, name: 'Pollo a la Plancha' },
      { qty: 1, name: 'Limonada' },
    ],
    time: '7:34 PM',
    createdAt: '7:34 PM',
    estimatedMin: 15,
    elapsedMin: 3,
    status: 'PENDIENTE',
  },
  {
    id: 'o-3',
    code: '#ORD-1003',
    comanda: '#C-0089',
    table: 'KIO-01',
    customer: 'Carlos Rodríguez',
    waiter: 'Autoservicio',
    people: 1,
    station: 'Cocina',
    source: 'Kiosco',
    priority: 'normal',
    items: [
      { qty: 1, name: 'Hamburguesa Clásica' },
      { qty: 1, name: 'Papas Grandes' },
      { qty: 1, name: 'Gaseosa' },
    ],
    time: '7:22 PM',
    createdAt: '7:22 PM',
    startedAt: '7:24 PM',
    finishedAt: '7:38 PM',
    estimatedMin: 12,
    elapsedMin: 14,
    status: 'LISTA',
  },
  {
    id: 'o-4',
    code: '#ORD-1004',
    comanda: '#C-0090',
    table: 'M-08',
    customer: 'María González',
    waiter: 'Carolina Ruiz',
    people: 3,
    station: 'Barra',
    source: 'Mesa',
    priority: 'normal',
    items: [
      { qty: 3, name: 'Limonada' },
      { qty: 1, name: 'Brownie con Helado' },
    ],
    time: '7:05 PM',
    createdAt: '7:05 PM',
    startedAt: '7:07 PM',
    finishedAt: '7:19 PM',
    estimatedMin: 10,
    elapsedMin: 12,
    status: 'ENTREGADA',
  },
  {
    id: 'o-5',
    code: '#ORD-1005',
    comanda: '#C-0091',
    table: 'M-03',
    customer: 'Juan Pérez',
    waiter: 'Felipe Torres',
    people: 5,
    station: 'Cocina',
    source: 'Mesa',
    priority: 'alta',
    items: [
      { qty: 2, name: 'Pizza Familiar' },
      { qty: 1, name: 'Hamburguesa Especial' },
      { qty: 5, name: 'Gaseosa' },
    ],
    note: 'Pizza bien cocida',
    time: '7:12 PM',
    createdAt: '7:12 PM',
    startedAt: '7:15 PM',
    estimatedMin: 20,
    elapsedMin: 24,
    status: 'EN_PREPARACION',
  },
  {
    id: 'o-6',
    code: '#ORD-1006',
    comanda: '#C-0092',
    table: 'DOM-14',
    customer: 'Carlos Rodríguez',
    waiter: 'Domicilios',
    people: 1,
    station: 'Cocina',
    source: 'Domicilio',
    priority: 'normal',
    items: [
      { qty: 1, name: 'Hamburguesa Doble' },
      { qty: 1, name: 'Papas Grandes' },
    ],
    time: '7:40 PM',
    createdAt: '7:40 PM',
    estimatedMin: 15,
    elapsedMin: 1,
    status: 'PENDIENTE',
  },
  {
    id: 'o-7',
    code: '#ORD-1007',
    comanda: '#C-0093',
    table: 'M-15',
    customer: 'María González',
    waiter: 'Laura Martínez',
    people: 2,
    station: 'Parrilla',
    source: 'Mesa',
    priority: 'normal',
    items: [
      { qty: 2, name: 'Bandeja Ejecutiva' },
      { qty: 2, name: 'Jugo Natural' },
    ],
    time: '7:36 PM',
    createdAt: '7:36 PM',
    startedAt: '7:38 PM',
    estimatedMin: 18,
    elapsedMin: 5,
    status: 'EN_PREPARACION',
  },
  {
    id: 'o-8',
    code: '#ORD-1008',
    comanda: '#C-0094',
    table: 'KIO-02',
    customer: 'Juan Pérez',
    waiter: 'Autoservicio',
    people: 1,
    station: 'Barra',
    source: 'Kiosco',
    priority: 'normal',
    items: [
      { qty: 1, name: 'Café Americano' },
      { qty: 1, name: 'Cheesecake' },
    ],
    time: '7:41 PM',
    createdAt: '7:41 PM',
    estimatedMin: 8,
    elapsedMin: 2,
    status: 'PENDIENTE',
  },
]

/** Ordered lifecycle used by the "advance" action on order cards. */
export const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDIENTE: 'EN_PREPARACION',
  EN_PREPARACION: 'LISTA',
  LISTA: 'ENTREGADA',
  PAUSADA: 'EN_PREPARACION',
}

/* -------------------------------------------------------------------------- */
/*  Stations                                                                  */
/* -------------------------------------------------------------------------- */

export type StationStatus = 'ACTIVA' | 'PAUSADA' | 'FUERA'

export const stationStatusLabel: Record<StationStatus, string> = {
  ACTIVA: 'Activa',
  PAUSADA: 'Pausada',
  FUERA: 'Fuera de servicio',
}

export const stationStatusVariant: Record<StationStatus, 'success' | 'warning' | 'danger'> = {
  ACTIVA: 'success',
  PAUSADA: 'warning',
  FUERA: 'danger',
}

export interface Station {
  id: string
  name: string
  status: StationStatus
  pending: number
  preparing: number
  ready: number
  avgMin: number
  user: string
}

export const stations: Station[] = [
  { id: 's-1', name: 'Cocina', status: 'ACTIVA', pending: 5, preparing: 4, ready: 2, avgMin: 14, user: 'Laura Martínez' },
  { id: 's-2', name: 'Barra', status: 'ACTIVA', pending: 2, preparing: 1, ready: 1, avgMin: 6, user: 'Andrés Gómez' },
  { id: 's-3', name: 'Parrilla', status: 'ACTIVA', pending: 3, preparing: 2, ready: 1, avgMin: 17, user: 'Felipe Torres' },
  { id: 's-4', name: 'Panadería', status: 'PAUSADA', pending: 1, preparing: 0, ready: 0, avgMin: 22, user: 'Carolina Ruiz' },
  { id: 's-5', name: 'Cafetería', status: 'ACTIVA', pending: 1, preparing: 1, ready: 0, avgMin: 5, user: 'Andrés Gómez' },
  { id: 's-6', name: 'Postres', status: 'ACTIVA', pending: 0, preparing: 0, ready: 1, avgMin: 9, user: 'Carolina Ruiz' },
  { id: 's-7', name: 'Despacho', status: 'FUERA', pending: 0, preparing: 0, ready: 0, avgMin: 3, user: 'Sin asignar' },
]

export const stationNames = ['Cocina', 'Barra', 'Parrilla', 'Panadería', 'Cafetería', 'Postres', 'Despacho']
export const staffNames = ['Laura Martínez', 'Andrés Gómez', 'Carolina Ruiz', 'Felipe Torres', 'Sin asignar']

/* -------------------------------------------------------------------------- */
/*  Tables (mesas)                                                            */
/* -------------------------------------------------------------------------- */

export type TableStatus = 'DISPONIBLE' | 'RESERVADA' | 'OCUPADA' | 'PAGO' | 'FUERA'

export const tableStatusLabel: Record<TableStatus, string> = {
  DISPONIBLE: 'Disponible',
  RESERVADA: 'Reservada',
  OCUPADA: 'Ocupada',
  PAGO: 'Esperando pago',
  FUERA: 'Fuera de servicio',
}

export const tableStatusVariant: Record<
  TableStatus,
  'success' | 'primary' | 'warning' | 'danger' | 'neutral'
> = {
  DISPONIBLE: 'success',
  RESERVADA: 'primary',
  OCUPADA: 'warning',
  PAGO: 'danger',
  FUERA: 'neutral',
}

export type TableZone = 'Salón' | 'Terraza' | 'VIP' | 'Barra'

export interface DiningTable {
  id: string
  code: string
  zone: TableZone
  capacity: number
  status: TableStatus
  waiter?: string
  customer?: string
  occupiedMin?: number
  total?: number
}

export const diningTables: DiningTable[] = [
  { id: 'm-1', code: 'M-01', zone: 'Salón', capacity: 4, status: 'OCUPADA', waiter: 'Laura Martínez', customer: 'Juan Pérez', occupiedMin: 42, total: 128_000 },
  { id: 'm-2', code: 'M-02', zone: 'Salón', capacity: 2, status: 'DISPONIBLE' },
  { id: 'm-3', code: 'M-03', zone: 'Salón', capacity: 6, status: 'OCUPADA', waiter: 'Felipe Torres', customer: 'Juan Pérez', occupiedMin: 18, total: 214_000 },
  { id: 'm-4', code: 'M-04', zone: 'Terraza', capacity: 4, status: 'RESERVADA', customer: 'Ana Suárez' },
  { id: 'm-5', code: 'M-05', zone: 'Terraza', capacity: 2, status: 'OCUPADA', waiter: 'Andrés Gómez', customer: 'María González', occupiedMin: 9, total: 46_000 },
  { id: 'm-6', code: 'M-06', zone: 'Terraza', capacity: 4, status: 'DISPONIBLE' },
  { id: 'm-7', code: 'M-07', zone: 'VIP', capacity: 8, status: 'PAGO', waiter: 'Carolina Ruiz', customer: 'Hotelería Caribe', occupiedMin: 86, total: 512_000 },
  { id: 'm-8', code: 'M-08', zone: 'VIP', capacity: 6, status: 'OCUPADA', waiter: 'Carolina Ruiz', customer: 'María González', occupiedMin: 33, total: 187_000 },
  { id: 'm-9', code: 'M-09', zone: 'Barra', capacity: 2, status: 'DISPONIBLE' },
  { id: 'm-10', code: 'M-10', zone: 'Barra', capacity: 2, status: 'OCUPADA', waiter: 'Andrés Gómez', customer: 'Carlos Rodríguez', occupiedMin: 12, total: 38_000 },
  { id: 'm-11', code: 'M-11', zone: 'Salón', capacity: 4, status: 'DISPONIBLE' },
  { id: 'm-12', code: 'M-12', zone: 'Salón', capacity: 4, status: 'OCUPADA', waiter: 'Laura Martínez', customer: 'Juan Pérez', occupiedMin: 24, total: 156_000 },
  { id: 'm-13', code: 'M-13', zone: 'Terraza', capacity: 4, status: 'DISPONIBLE' },
  { id: 'm-14', code: 'M-14', zone: 'Terraza', capacity: 2, status: 'FUERA' },
  { id: 'm-15', code: 'M-15', zone: 'VIP', capacity: 6, status: 'OCUPADA', waiter: 'Laura Martínez', customer: 'María González', occupiedMin: 7, total: 98_000 },
  { id: 'm-16', code: 'M-16', zone: 'Barra', capacity: 2, status: 'RESERVADA', customer: 'Diego Ramírez' },
]

export const tableZones: TableZone[] = ['Salón', 'Terraza', 'VIP', 'Barra']

/* -------------------------------------------------------------------------- */
/*  Reservations                                                              */
/* -------------------------------------------------------------------------- */

export type ReservationStatus =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'LLEGO'
  | 'EN_MESA'
  | 'FINALIZADA'
  | 'CANCELADA'
  | 'NO_ASISTIO'

export const reservationStatusLabel: Record<ReservationStatus, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  LLEGO: 'Cliente llegó',
  EN_MESA: 'En mesa',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
  NO_ASISTIO: 'No asistió',
}

export const reservationStatusVariant: Record<
  ReservationStatus,
  'neutral' | 'primary' | 'success' | 'warning' | 'danger'
> = {
  PENDIENTE: 'warning',
  CONFIRMADA: 'primary',
  LLEGO: 'success',
  EN_MESA: 'success',
  FINALIZADA: 'neutral',
  CANCELADA: 'danger',
  NO_ASISTIO: 'danger',
}

export interface Reservation {
  id: string
  customer: string
  phone: string
  date: string
  time: string
  people: number
  table: string
  zone: TableZone
  durationMin: number
  note?: string
  status: ReservationStatus
}

export const reservations: Reservation[] = [
  { id: 'r-1', customer: 'Ana Suárez', phone: '310 456 7890', date: 'Hoy', time: '12:30 PM', people: 4, table: 'M-04', zone: 'Terraza', durationMin: 90, note: 'Cumpleaños', status: 'CONFIRMADA' },
  { id: 'r-2', customer: 'Diego Ramírez', phone: '311 234 5566', date: 'Hoy', time: '1:00 PM', people: 2, table: 'M-16', zone: 'Barra', durationMin: 60, status: 'CONFIRMADA' },
  { id: 'r-3', customer: 'Hotelería Caribe', phone: '605 745 2210', date: 'Hoy', time: '1:30 PM', people: 8, table: 'M-07', zone: 'VIP', durationMin: 120, note: 'Almuerzo empresarial', status: 'LLEGO' },
  { id: 'r-4', customer: 'Laura Beltrán', phone: '300 998 7654', date: 'Hoy', time: '7:00 PM', people: 3, table: 'M-11', zone: 'Salón', durationMin: 90, status: 'PENDIENTE' },
  { id: 'r-5', customer: 'Carlos Rodríguez', phone: '312 345 6677', date: 'Hoy', time: '8:00 PM', people: 6, table: 'M-03', zone: 'Salón', durationMin: 120, note: 'Mesa cerca de ventana', status: 'PENDIENTE' },
  { id: 'r-6', customer: 'María González', phone: '315 112 3344', date: 'Mañana', time: '12:00 PM', people: 2, table: 'M-05', zone: 'Terraza', durationMin: 60, status: 'CONFIRMADA' },
  { id: 'r-7', customer: 'Felipe Torres', phone: '318 556 7788', date: 'Ayer', time: '7:30 PM', people: 4, table: 'M-12', zone: 'Salón', durationMin: 90, status: 'FINALIZADA' },
  { id: 'r-8', customer: 'Sandra Ossa', phone: '319 445 1122', date: 'Ayer', time: '8:30 PM', people: 2, table: 'M-09', zone: 'Barra', durationMin: 60, status: 'NO_ASISTIO' },
]

/* -------------------------------------------------------------------------- */
/*  Recipes                                                                   */
/* -------------------------------------------------------------------------- */

export interface RecipeIngredient {
  name: string
  qty: number
  unit: string
  merma: number
  cost: number
}

export interface Recipe {
  id: string
  product: string
  station: string
  prepMin: number
  active: boolean
  ingredients: RecipeIngredient[]
}

function recipeCost(r: Recipe): number {
  return r.ingredients.reduce((s, i) => s + i.cost, 0)
}

export const recipes: Recipe[] = [
  {
    id: 'rc-1',
    product: 'Hamburguesa Especial',
    station: 'Parrilla',
    prepMin: 12,
    active: true,
    ingredients: [
      { name: 'Pan', qty: 1, unit: 'unidad', merma: 2, cost: 1_200 },
      { name: 'Carne', qty: 150, unit: 'g', merma: 5, cost: 4_800 },
      { name: 'Queso', qty: 1, unit: 'unidad', merma: 0, cost: 1_500 },
      { name: 'Lechuga', qty: 30, unit: 'g', merma: 8, cost: 600 },
      { name: 'Tomate', qty: 40, unit: 'g', merma: 6, cost: 700 },
      { name: 'Salsa', qty: 20, unit: 'ml', merma: 3, cost: 500 },
    ],
  },
  {
    id: 'rc-2',
    product: 'Hamburguesa Clásica',
    station: 'Parrilla',
    prepMin: 10,
    active: true,
    ingredients: [
      { name: 'Pan', qty: 1, unit: 'unidad', merma: 2, cost: 1_200 },
      { name: 'Carne', qty: 120, unit: 'g', merma: 5, cost: 3_900 },
      { name: 'Queso', qty: 1, unit: 'unidad', merma: 0, cost: 1_500 },
      { name: 'Salsa', qty: 20, unit: 'ml', merma: 3, cost: 500 },
    ],
  },
  {
    id: 'rc-3',
    product: 'Pizza Familiar',
    station: 'Cocina',
    prepMin: 20,
    active: true,
    ingredients: [
      { name: 'Masa', qty: 400, unit: 'g', merma: 4, cost: 3_200 },
      { name: 'Salsa napolitana', qty: 120, unit: 'ml', merma: 3, cost: 1_800 },
      { name: 'Mozzarella', qty: 250, unit: 'g', merma: 2, cost: 6_500 },
      { name: 'Albahaca', qty: 10, unit: 'g', merma: 10, cost: 400 },
    ],
  },
  {
    id: 'rc-4',
    product: 'Papas Grandes',
    station: 'Cocina',
    prepMin: 8,
    active: true,
    ingredients: [
      { name: 'Papa', qty: 300, unit: 'g', merma: 12, cost: 1_500 },
      { name: 'Aceite', qty: 100, unit: 'ml', merma: 0, cost: 900 },
      { name: 'Sal', qty: 5, unit: 'g', merma: 0, cost: 100 },
    ],
  },
  {
    id: 'rc-5',
    product: 'Limonada',
    station: 'Barra',
    prepMin: 4,
    active: true,
    ingredients: [
      { name: 'Limón', qty: 3, unit: 'unidad', merma: 5, cost: 900 },
      { name: 'Azúcar', qty: 30, unit: 'g', merma: 0, cost: 200 },
      { name: 'Agua', qty: 300, unit: 'ml', merma: 0, cost: 100 },
    ],
  },
  {
    id: 'rc-6',
    product: 'Gaseosa',
    station: 'Barra',
    prepMin: 1,
    active: false,
    ingredients: [{ name: 'Gaseosa 400ml', qty: 1, unit: 'unidad', merma: 0, cost: 2_200 }],
  },
]

export function recipeTotalCost(r: Recipe): number {
  return recipeCost(r)
}

/* -------------------------------------------------------------------------- */
/*  History                                                                   */
/* -------------------------------------------------------------------------- */

export interface HistoryRow {
  id: string
  code: string
  comanda: string
  table: string
  customer: string
  station: string
  start: string
  end: string
  durationMin: number
  status: OrderStatus
  user: string
}

export const historyRows: HistoryRow[] = [
  { id: 'h-1', code: '#ORD-0994', comanda: '#C-0080', table: 'M-02', customer: 'Juan Pérez', station: 'Cocina', start: '6:12 PM', end: '6:27 PM', durationMin: 15, status: 'ENTREGADA', user: 'Laura Martínez' },
  { id: 'h-2', code: '#ORD-0995', comanda: '#C-0081', table: 'M-07', customer: 'Hotelería Caribe', station: 'Parrilla', start: '6:20 PM', end: '6:44 PM', durationMin: 24, status: 'ENTREGADA', user: 'Felipe Torres' },
  { id: 'h-3', code: '#ORD-0996', comanda: '#C-0082', table: 'KIO-01', customer: 'Carlos Rodríguez', station: 'Cocina', start: '6:31 PM', end: '6:43 PM', durationMin: 12, status: 'ENTREGADA', user: 'Autoservicio' },
  { id: 'h-4', code: '#ORD-0997', comanda: '#C-0083', table: 'M-05', customer: 'María González', station: 'Barra', start: '6:38 PM', end: '6:47 PM', durationMin: 9, status: 'ENTREGADA', user: 'Andrés Gómez' },
  { id: 'h-5', code: '#ORD-0998', comanda: '#C-0084', table: 'M-10', customer: 'Diego Ramírez', station: 'Parrilla', start: '6:44 PM', end: '7:15 PM', durationMin: 31, status: 'ENTREGADA', user: 'Felipe Torres' },
  { id: 'h-6', code: '#ORD-0999', comanda: '#C-0085', table: 'M-03', customer: 'Ana Suárez', station: 'Cocina', start: '6:52 PM', end: '—', durationMin: 0, status: 'CANCELADA', user: 'Laura Martínez' },
  { id: 'h-7', code: '#ORD-1000', comanda: '#C-0086', table: 'DOM-11', customer: 'Carlos Rodríguez', station: 'Cocina', start: '7:01 PM', end: '7:19 PM', durationMin: 18, status: 'ENTREGADA', user: 'Domicilios' },
]

export const historyStatusOptions: (OrderStatus | 'TODOS')[] = ['TODOS', 'ENTREGADA', 'CANCELADA']

/* -------------------------------------------------------------------------- */
/*  Indicators (analytics)                                                    */
/* -------------------------------------------------------------------------- */

export const indicatorStats: Indicator[] = [
  {
    id: 'tiempo-prom',
    label: 'Tiempo promedio',
    value: '14 min',
    description: 'Preparación por orden',
    comparison: '-2 min vs. ayer',
    trend: 'down',
    tone: 'success',
    icon: Clock,
  },
  {
    id: 'tiempo-max',
    label: 'Tiempo máximo',
    value: '31 min',
    description: 'Orden más demorada',
    comparison: 'Parrilla',
    trend: 'flat',
    tone: 'warning',
    icon: AlertTriangle,
  },
  {
    id: 'preparadas',
    label: 'Órdenes preparadas',
    value: formatNumber(186),
    description: 'En el turno de hoy',
    comparison: '+12.4% vs. ayer',
    trend: 'up',
    tone: 'primary',
    icon: CheckCircle2,
  },
  {
    id: 'retrasadas-ind',
    label: 'Órdenes retrasadas',
    value: '9',
    description: 'Sobre tiempo estimado',
    comparison: '4.8% del total',
    trend: 'down',
    tone: 'danger',
    icon: AlertTriangle,
  },
]

export const indicatorCharts: ChartSpec[] = [
  {
    kind: 'bar',
    title: 'Productividad por estación',
    subtitle: 'Órdenes preparadas hoy',
    format: 'number',
    colorful: true,
    data: [
      { label: 'Cocina', value: 78 },
      { label: 'Parrilla', value: 46 },
      { label: 'Barra', value: 34 },
      { label: 'Cafetería', value: 18 },
      { label: 'Postres', value: 10 },
    ],
  },
  {
    kind: 'bar',
    title: 'Productividad por usuario',
    subtitle: 'Órdenes atendidas hoy',
    format: 'number',
    colorful: true,
    data: [
      { label: 'Laura M.', value: 52 },
      { label: 'Felipe T.', value: 41 },
      { label: 'Andrés G.', value: 38 },
      { label: 'Carolina R.', value: 29 },
    ],
  },
  {
    kind: 'bar',
    title: 'Productos más preparados',
    subtitle: 'Unidades de hoy',
    format: 'number',
    colorful: true,
    data: [
      { label: 'Hamb. Clásica', value: 64 },
      { label: 'Pizza Familiar', value: 41 },
      { label: 'Papas Grandes', value: 58 },
      { label: 'Limonada', value: 47 },
      { label: 'Gaseosa', value: 72 },
    ],
  },
  {
    kind: 'line',
    title: 'Horas de mayor demanda',
    subtitle: 'Órdenes por franja horaria',
    format: 'number',
    data: [
      { label: '11a', value: 14 },
      { label: '12m', value: 28 },
      { label: '1p', value: 33 },
      { label: '2p', value: 22 },
      { label: '6p', value: 31 },
      { label: '7p', value: 38 },
      { label: '8p', value: 26 },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/*  Elapsed-time visual state (shared status colors, no new palette)          */
/* -------------------------------------------------------------------------- */

/** Maps an order's elapsed vs. estimated time to an existing status variant. */
export function timeVariant(elapsedMin: number, estimatedMin: number): 'success' | 'warning' | 'danger' {
  const ratio = elapsedMin / Math.max(1, estimatedMin)
  if (ratio >= 1) return 'danger'
  if (ratio >= 0.75) return 'warning'
  return 'success'
}

export function formatElapsed(min: number): string {
  return `${String(min).padStart(2, '0')} min`
}
