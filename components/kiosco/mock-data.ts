import {
  LayoutDashboard,
  MonitorSmartphone,
  Activity,
  SlidersHorizontal,
  Eye,
  ShoppingBag,
  Coffee,
  Utensils,
  Pizza,
  Sandwich,
  IceCream,
  CupSoda,
  type LucideIcon,
} from 'lucide-react'
import {
  Wifi,
  WifiOff,
  Wrench,
  Ban,
  MonitorCheck,
  Receipt,
  DollarSign,
} from 'lucide-react'
import type { Indicator } from '@/components/dashboard/mock-data'
import type { ChartSpec } from '@/components/reportes/mock-data'
import { formatCurrency, formatNumber } from '@/components/reportes/mock-data'

export { formatCurrency, formatNumber }
export type { ChartSpec }

/* -------------------------------------------------------------------------- */
/*  Section navigation                                                        */
/* -------------------------------------------------------------------------- */

export type SectionId = 'dashboard' | 'terminales' | 'monitor' | 'configuracion' | 'preview'

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
    label: 'Panel',
    sections: [
      { id: 'dashboard', label: 'Dashboard Kiosco', icon: LayoutDashboard },
      { id: 'terminales', label: 'Terminales', icon: MonitorSmartphone },
      { id: 'monitor', label: 'Monitor', icon: Activity },
    ],
  },
  {
    label: 'Ajustes',
    sections: [{ id: 'configuracion', label: 'Configuración', icon: SlidersHorizontal }],
  },
  {
    label: 'Cliente',
    sections: [{ id: 'preview', label: 'Vista previa', icon: Eye }],
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
    id: 'registrados',
    label: 'Kioscos registrados',
    value: '8',
    description: '3 sucursales',
    comparison: '+2 este mes',
    trend: 'up',
    tone: 'primary',
    icon: MonitorSmartphone,
  },
  {
    id: 'activos',
    label: 'Kioscos activos',
    value: '6',
    description: 'En línea ahora',
    comparison: '75% disponibilidad',
    trend: 'up',
    tone: 'success',
    icon: MonitorCheck,
  },
  {
    id: 'desconectados',
    label: 'Kioscos desconectados',
    value: '2',
    description: '1 en mantenimiento',
    comparison: '-1 vs. ayer',
    trend: 'down',
    tone: 'danger',
    icon: WifiOff,
  },
  {
    id: 'pedidos',
    label: 'Pedidos del día',
    value: formatNumber(214),
    description: 'Autoservicio',
    comparison: '+18.2% vs. ayer',
    trend: 'up',
    tone: 'primary',
    icon: Receipt,
  },
  {
    id: 'ventas',
    label: 'Ventas del día',
    value: formatCurrency(6_480_000),
    description: 'Total kioscos',
    comparison: '+11.5% vs. ayer',
    trend: 'up',
    tone: 'success',
    icon: DollarSign,
  },
  {
    id: 'ticket',
    label: 'Ticket promedio',
    value: formatCurrency(30_280),
    description: 'Por pedido',
    comparison: '+3.1% vs. ayer',
    trend: 'up',
    tone: 'primary',
    icon: ShoppingBag,
  },
]

export const dashboardCharts: ChartSpec[] = [
  {
    kind: 'bar',
    title: 'Pedidos por hora',
    subtitle: 'Actividad de autoservicio de hoy',
    format: 'number',
    data: [
      { label: '8a', value: 8 },
      { label: '10a', value: 21 },
      { label: '12m', value: 46 },
      { label: '2p', value: 39 },
      { label: '4p', value: 24 },
      { label: '6p', value: 41 },
      { label: '8p', value: 35 },
    ],
  },
  {
    kind: 'pie',
    title: 'Ventas por kiosco',
    subtitle: 'Participación de hoy',
    format: 'currency',
    colorful: true,
    data: [
      { label: 'Sede Principal K1', value: 2_180_000 },
      { label: 'Sede Principal K2', value: 1_540_000 },
      { label: 'Sede Norte K1', value: 1_460_000 },
      { label: 'Sede Sur K1', value: 1_300_000 },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/*  Terminales                                                                */
/* -------------------------------------------------------------------------- */

export type TerminalStatus = 'ONLINE' | 'OFFLINE' | 'MANTENIMIENTO' | 'BLOQUEADO'

export const terminalStatusVariant: Record<
  TerminalStatus,
  'success' | 'neutral' | 'warning' | 'danger'
> = {
  ONLINE: 'success',
  OFFLINE: 'neutral',
  MANTENIMIENTO: 'warning',
  BLOQUEADO: 'danger',
}

export const terminalStatusIcon: Record<TerminalStatus, LucideIcon> = {
  ONLINE: Wifi,
  OFFLINE: WifiOff,
  MANTENIMIENTO: Wrench,
  BLOQUEADO: Ban,
}

export interface Terminal {
  id: string
  name: string
  code: string
  branch: string
  location: string
  status: TerminalStatus
  lastSeen: string
  sales: number
  orders: number
}

export const terminals: Terminal[] = [
  {
    id: 't-1',
    name: 'Kiosco Entrada 1',
    code: 'KIO-001',
    branch: 'Sede Principal',
    location: 'Entrada principal',
    status: 'ONLINE',
    lastSeen: 'Hace 12 s',
    sales: 2_180_000,
    orders: 72,
  },
  {
    id: 't-2',
    name: 'Kiosco Entrada 2',
    code: 'KIO-002',
    branch: 'Sede Principal',
    location: 'Zona de comidas',
    status: 'ONLINE',
    lastSeen: 'Hace 4 s',
    sales: 1_540_000,
    orders: 54,
  },
  {
    id: 't-3',
    name: 'Kiosco Norte 1',
    code: 'KIO-003',
    branch: 'Sede Norte',
    location: 'Pasillo central',
    status: 'ONLINE',
    lastSeen: 'Hace 31 s',
    sales: 1_460_000,
    orders: 48,
  },
  {
    id: 't-4',
    name: 'Kiosco Sur 1',
    code: 'KIO-004',
    branch: 'Sede Sur',
    location: 'Entrada norte',
    status: 'MANTENIMIENTO',
    lastSeen: 'Hace 2 h',
    sales: 1_300_000,
    orders: 40,
  },
  {
    id: 't-5',
    name: 'Kiosco Norte 2',
    code: 'KIO-005',
    branch: 'Sede Norte',
    location: 'Salida terraza',
    status: 'OFFLINE',
    lastSeen: 'Hace 1 d',
    sales: 0,
    orders: 0,
  },
  {
    id: 't-6',
    name: 'Kiosco Express',
    code: 'KIO-006',
    branch: 'Sede Principal',
    location: 'Parqueadero',
    status: 'BLOQUEADO',
    lastSeen: 'Hace 3 d',
    sales: 0,
    orders: 0,
  },
]

export const branches = ['Sede Principal', 'Sede Norte', 'Sede Sur']
export const printers = ['Impresora Cocina 1', 'Impresora Cocina 2', 'Impresora Barra', 'Sin impresora']
export const paymentMethods = ['Efectivo', 'Tarjeta débito', 'Tarjeta crédito', 'QR / Nequi', 'Datáfono']

/* -------------------------------------------------------------------------- */
/*  Monitor                                                                   */
/* -------------------------------------------------------------------------- */

export interface MonitorEvent {
  id: string
  terminal: string
  message: string
  level: 'info' | 'warning' | 'danger' | 'success'
  time: string
}

export const monitorEvents: MonitorEvent[] = [
  { id: 'm-1', terminal: 'KIO-001', message: 'Pedido #4821 enviado a cocina', level: 'success', time: '10:42:11' },
  { id: 'm-2', terminal: 'KIO-002', message: 'Pago aprobado — Tarjeta débito', level: 'success', time: '10:41:58' },
  { id: 'm-3', terminal: 'KIO-004', message: 'Entró en modo mantenimiento', level: 'warning', time: '10:40:03' },
  { id: 'm-4', terminal: 'KIO-003', message: 'Papel de impresora bajo', level: 'warning', time: '10:38:47' },
  { id: 'm-5', terminal: 'KIO-005', message: 'Pérdida de conexión', level: 'danger', time: '10:31:20' },
  { id: 'm-6', terminal: 'KIO-001', message: 'Sesión de cliente iniciada', level: 'info', time: '10:30:12' },
  { id: 'm-7', terminal: 'KIO-006', message: 'Terminal bloqueada por administrador', level: 'danger', time: '10:12:05' },
]

export const monitorLevelVariant: Record<
  MonitorEvent['level'],
  'primary' | 'success' | 'warning' | 'danger'
> = {
  info: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
}

/* -------------------------------------------------------------------------- */
/*  Configuración tabs                                                        */
/* -------------------------------------------------------------------------- */

export type ConfigTabId =
  | 'general'
  | 'pantalla'
  | 'productos'
  | 'categorias'
  | 'precios'
  | 'pagos'
  | 'impresion'
  | 'pedidos'
  | 'seguridad'
  | 'mantenimiento'

export interface ConfigTab {
  id: ConfigTabId
  label: string
}

export const configTabs: ConfigTab[] = [
  { id: 'general', label: 'General' },
  { id: 'pantalla', label: 'Pantalla' },
  { id: 'productos', label: 'Productos' },
  { id: 'categorias', label: 'Categorías' },
  { id: 'precios', label: 'Precios' },
  { id: 'pagos', label: 'Pagos' },
  { id: 'impresion', label: 'Impresión' },
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'seguridad', label: 'Seguridad' },
  { id: 'mantenimiento', label: 'Mantenimiento' },
]

export interface ConfigToggle {
  id: string
  label: string
  description: string
  enabled: boolean
}

export const configToggles: Record<ConfigTabId, ConfigToggle[]> = {
  general: [
    { id: 'g1', label: 'Kiosco habilitado', description: 'Permitir que los clientes usen el autoservicio.', enabled: true },
    { id: 'g2', label: 'Idioma español', description: 'Interfaz del cliente en español.', enabled: true },
    { id: 'g3', label: 'Modo demostración', description: 'Mostrar catálogo sin procesar cobros reales.', enabled: false },
  ],
  pantalla: [
    { id: 'p1', label: 'Protector de pantalla', description: 'Mostrar promociones tras 60 s de inactividad.', enabled: true },
    { id: 'p2', label: 'Tema oscuro automático', description: 'Ajustar según la hora del día.', enabled: false },
    { id: 'p3', label: 'Mostrar logo JERALPOS', description: 'Encabezado con la marca del negocio.', enabled: true },
  ],
  productos: [
    { id: 'pr1', label: 'Ocultar agotados', description: 'No mostrar productos sin existencias.', enabled: true },
    { id: 'pr2', label: 'Mostrar imágenes', description: 'Fotografías grandes por producto.', enabled: true },
    { id: 'pr3', label: 'Destacar recomendados', description: 'Resaltar productos sugeridos.', enabled: true },
  ],
  categorias: [
    { id: 'c1', label: 'Barra de categorías', description: 'Navegación por categorías en la parte superior.', enabled: true },
    { id: 'c2', label: 'Íconos de categoría', description: 'Mostrar íconos junto al nombre.', enabled: true },
  ],
  precios: [
    { id: 'pc1', label: 'Mostrar IVA incluido', description: 'Precios con impuestos incluidos.', enabled: true },
    { id: 'pc2', label: 'Lista de precios kiosco', description: 'Usar precios específicos de autoservicio.', enabled: false },
  ],
  pagos: [
    { id: 'pa1', label: 'Pago con tarjeta', description: 'Aceptar débito y crédito.', enabled: true },
    { id: 'pa2', label: 'Pago con QR', description: 'Nequi, Daviplata y otros.', enabled: true },
    { id: 'pa3', label: 'Pago en caja', description: 'Permitir finalizar el pago con un cajero.', enabled: true },
  ],
  impresion: [
    { id: 'im1', label: 'Imprimir comanda', description: 'Enviar comanda a cocina automáticamente.', enabled: true },
    { id: 'im2', label: 'Imprimir recibo', description: 'Ticket para el cliente al finalizar.', enabled: true },
  ],
  pedidos: [
    { id: 'pe1', label: 'Numeración de turnos', description: 'Asignar número de turno a cada pedido.', enabled: true },
    { id: 'pe2', label: 'Para llevar / comer aquí', description: 'Preguntar el tipo de consumo.', enabled: true },
    { id: 'pe3', label: 'Notas del cliente', description: 'Permitir comentarios por producto.', enabled: false },
  ],
  seguridad: [
    { id: 's1', label: 'PIN de administrador', description: 'Requerir PIN para salir del modo kiosco.', enabled: true },
    { id: 's2', label: 'Bloqueo por inactividad', description: 'Reiniciar sesión tras inactividad prolongada.', enabled: true },
  ],
  mantenimiento: [
    { id: 'mt1', label: 'Actualizaciones automáticas', description: 'Instalar actualizaciones fuera de horario.', enabled: true },
    { id: 'mt2', label: 'Reinicio programado', description: 'Reiniciar terminales cada madrugada.', enabled: false },
    { id: 'mt3', label: 'Envío de diagnósticos', description: 'Reportar estado de las terminales.', enabled: true },
  ],
}

/* -------------------------------------------------------------------------- */
/*  Kiosk customer-facing catalog (Vista previa)                              */
/* -------------------------------------------------------------------------- */

export interface KioskCategory {
  id: string
  label: string
  icon: LucideIcon
}

export const kioskCategories: KioskCategory[] = [
  { id: 'destacados', label: 'Destacados', icon: ShoppingBag },
  { id: 'hamburguesas', label: 'Hamburguesas', icon: Sandwich },
  { id: 'pizzas', label: 'Pizzas', icon: Pizza },
  { id: 'platos', label: 'Platos', icon: Utensils },
  { id: 'bebidas', label: 'Bebidas', icon: CupSoda },
  { id: 'cafe', label: 'Café', icon: Coffee },
  { id: 'postres', label: 'Postres', icon: IceCream },
]

export interface KioskProduct {
  id: string
  name: string
  description: string
  price: number
  category: string
  featured?: boolean
}

export const kioskProducts: KioskProduct[] = [
  { id: 'k-1', name: 'Hamburguesa Clásica', description: 'Carne 150g, queso, lechuga y tomate', price: 18_900, category: 'hamburguesas', featured: true },
  { id: 'k-2', name: 'Hamburguesa Doble', description: 'Doble carne, doble queso y tocineta', price: 26_500, category: 'hamburguesas', featured: true },
  { id: 'k-3', name: 'Hamburguesa BBQ', description: 'Carne, cebolla crispy y salsa BBQ', price: 23_900, category: 'hamburguesas' },
  { id: 'k-4', name: 'Pizza Margarita', description: 'Salsa napolitana, mozzarella y albahaca', price: 32_000, category: 'pizzas', featured: true },
  { id: 'k-5', name: 'Pizza Pepperoni', description: 'Mozzarella y pepperoni artesanal', price: 36_500, category: 'pizzas' },
  { id: 'k-6', name: 'Pizza Hawaiana', description: 'Jamón, piña y mozzarella', price: 34_000, category: 'pizzas' },
  { id: 'k-7', name: 'Bandeja Ejecutiva', description: 'Proteína, arroz, ensalada y jugo', price: 28_500, category: 'platos', featured: true },
  { id: 'k-8', name: 'Pollo a la Plancha', description: 'Pechuga, papas y ensalada fresca', price: 24_900, category: 'platos' },
  { id: 'k-9', name: 'Gaseosa 400ml', description: 'Bebida gaseosa fría', price: 4_500, category: 'bebidas' },
  { id: 'k-10', name: 'Jugo Natural', description: 'Jugo del día en agua o leche', price: 7_900, category: 'bebidas' },
  { id: 'k-11', name: 'Limonada de Coco', description: 'Refrescante limonada de coco', price: 9_500, category: 'bebidas', featured: true },
  { id: 'k-12', name: 'Café Americano', description: 'Café recién preparado', price: 4_900, category: 'cafe' },
  { id: 'k-13', name: 'Cappuccino', description: 'Espresso con leche espumada', price: 7_500, category: 'cafe' },
  { id: 'k-14', name: 'Brownie con Helado', description: 'Brownie tibio con helado de vainilla', price: 12_900, category: 'postres', featured: true },
  { id: 'k-15', name: 'Cheesecake', description: 'Porción de cheesecake de frutos rojos', price: 11_500, category: 'postres' },
]
