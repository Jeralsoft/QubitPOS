import {
  LayoutDashboard,
  ShoppingCart,
  ChefHat,
  ArrowLeftRight,
  FileText,
  HandCoins,
  Truck,
  Boxes,
  Users,
  IdCard,
  Package,
  BarChart3,
  UserCog,
  Tags,
  Calculator,
  WalletCards,
  MonitorSmartphone,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavChild {
  label: string
  href: string
}

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
  children?: NavChild[]
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  {
    label: 'Ventas',
    href: '/ventas',
    icon: ShoppingCart,
    badge: '12',
    children: [
      { label: 'Nueva venta', href: '/ventas/nueva' },
      { label: 'Historial', href: '/ventas/historial' },
      { label: 'Devoluciones', href: '/ventas/devoluciones' },
    ],
  },
  { label: 'Preparación', href: '/preparacion', icon: ChefHat, badge: '5' },
  { label: 'Movimientos', href: '/movimientos', icon: ArrowLeftRight },
  {
    label: 'Facturación',
    href: '/facturacion',
    icon: FileText,
    children: [
      { label: 'Facturas', href: '/facturacion/facturas' },
      { label: 'Notas de crédito', href: '/facturacion/notas' },
    ],
  },
  { label: 'Cobros', href: '/cobros', icon: HandCoins },
  { label: 'Proveedores', href: '/proveedores', icon: Truck },
  { label: 'Inventarios', href: '/inventarios', icon: Boxes },
  { label: 'Clientes', href: '/clientes', icon: Users },
  { label: 'Empleados', href: '/empleados', icon: IdCard },
  {
    label: 'Productos',
    href: '/productos',
    icon: Package,
    children: [
      { label: 'Catálogo', href: '/productos/catalogo' },
      { label: 'Categorías', href: '/productos/categorias' },
    ],
  },
  { label: 'Reportes', href: '/reportes', icon: BarChart3 },
  { label: 'Usuarios', href: '/usuarios', icon: UserCog },
  { label: 'V. Precio', href: '/v-precio', icon: Tags },
  { label: 'Contabilidad', href: '/contabilidad', icon: Calculator },
  { label: 'Nómina', href: '/nomina', icon: WalletCards },
  { label: 'Kiosco', href: '/kiosco', icon: MonitorSmartphone },
  { label: 'Configuración', href: '/configuracion', icon: Settings },
]
