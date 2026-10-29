import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Boxes,
  HandCoins,
  ReceiptText,
  BarChart3,
  LineChart,
  PieChart,
  type LucideIcon,
} from 'lucide-react'

/* -------------------------------------------------------------------------- */
/*  Formatting helpers                                                        */
/* -------------------------------------------------------------------------- */

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value)
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(value)}%`
}

export type ValueFormat = 'currency' | 'number' | 'percent'

export function formatValue(value: number, format: ValueFormat): string {
  if (format === 'currency') return formatCurrency(value)
  if (format === 'percent') return formatPercent(value)
  return formatNumber(value)
}

/* -------------------------------------------------------------------------- */
/*  Dashboard summary cards                                                   */
/* -------------------------------------------------------------------------- */

export type Tone = 'primary' | 'success' | 'warning' | 'danger'
export type Trend = 'up' | 'down' | 'flat'

export interface SummaryCard {
  id: string
  label: string
  value: string
  description: string
  comparison: string
  trend: Trend
  tone: Tone
  icon: LucideIcon
}

export const summaryCards: SummaryCard[] = [
  {
    id: 'ventas',
    label: 'Ventas',
    value: formatCurrency(47_920_000),
    description: 'Septiembre 2026',
    comparison: '+8.1% vs. mes anterior',
    trend: 'up',
    tone: 'primary',
    icon: DollarSign,
  },
  {
    id: 'compras',
    label: 'Compras',
    value: formatCurrency(28_640_000),
    description: 'Septiembre 2026',
    comparison: '+3.4% vs. mes anterior',
    trend: 'up',
    tone: 'primary',
    icon: ShoppingBag,
  },
  {
    id: 'utilidad',
    label: 'Utilidad',
    value: formatCurrency(19_280_000),
    description: 'Margen 40.2%',
    comparison: '+11.6% vs. mes anterior',
    trend: 'up',
    tone: 'success',
    icon: TrendingUp,
  },
  {
    id: 'inventario',
    label: 'Inventario',
    value: formatCurrency(84_150_000),
    description: '1,284 referencias',
    comparison: '7 en stock bajo',
    trend: 'flat',
    tone: 'warning',
    icon: Boxes,
  },
  {
    id: 'cartera',
    label: 'Cartera',
    value: formatCurrency(15_310_000),
    description: '18 facturas pendientes',
    comparison: '$6.9M vencida',
    trend: 'down',
    tone: 'danger',
    icon: HandCoins,
  },
  {
    id: 'cxp',
    label: 'Cuentas por pagar',
    value: formatCurrency(11_470_000),
    description: '9 facturas de proveedor',
    comparison: '$2.1M vence esta semana',
    trend: 'flat',
    tone: 'warning',
    icon: ReceiptText,
  },
]

/* -------------------------------------------------------------------------- */
/*  Report catalog                                                            */
/* -------------------------------------------------------------------------- */

export type ReportCategory = 'ventas' | 'inventario' | 'compras' | 'financiero'

export interface ReportDef {
  id: string
  label: string
}

export interface ReportGroup {
  category: ReportCategory
  label: string
  icon: LucideIcon
  reports: ReportDef[]
}

export const reportGroups: ReportGroup[] = [
  {
    category: 'ventas',
    label: 'Ventas',
    icon: DollarSign,
    reports: [
      { id: 'ventas-dia', label: 'Ventas por día' },
      { id: 'ventas-periodo', label: 'Ventas por período' },
      { id: 'ventas-vendedor', label: 'Ventas por vendedor' },
      { id: 'ventas-cliente', label: 'Ventas por cliente' },
      { id: 'ventas-producto', label: 'Ventas por producto' },
      { id: 'ventas-sucursal', label: 'Ventas por sucursal' },
    ],
  },
  {
    category: 'inventario',
    label: 'Inventario',
    icon: Boxes,
    reports: [
      { id: 'inv-actual', label: 'Inventario actual' },
      { id: 'inv-kardex', label: 'Kardex' },
      { id: 'inv-stock-bajo', label: 'Stock bajo' },
      { id: 'inv-agotados', label: 'Productos agotados' },
      { id: 'inv-valorizacion', label: 'Valorización' },
      { id: 'inv-rotacion', label: 'Rotación' },
    ],
  },
  {
    category: 'compras',
    label: 'Compras',
    icon: ShoppingBag,
    reports: [
      { id: 'compras-periodo', label: 'Compras por período' },
      { id: 'compras-proveedor', label: 'Compras por proveedor' },
      { id: 'compras-productos', label: 'Productos comprados' },
    ],
  },
  {
    category: 'financiero',
    label: 'Financiero',
    icon: TrendingUp,
    reports: [
      { id: 'fin-utilidad', label: 'Utilidad' },
      { id: 'fin-ingresos', label: 'Ingresos' },
      { id: 'fin-egresos', label: 'Egresos' },
      { id: 'fin-caja', label: 'Caja' },
      { id: 'fin-cartera', label: 'Cartera' },
      { id: 'fin-cxp', label: 'Cuentas por pagar' },
    ],
  },
]

export const reportLabelById: Record<string, string> = Object.fromEntries(
  reportGroups.flatMap((g) => g.reports.map((r) => [r.id, r.label])),
)

/* -------------------------------------------------------------------------- */
/*  Filter option catalogs                                                    */
/* -------------------------------------------------------------------------- */

export const sucursales = ['Todas', 'Sede Principal', 'Sucursal Norte', 'Sucursal Sur', 'Centro']
export const usuarios = ['Todos', 'Laura Martínez', 'Andrés Gómez', 'Carolina Ruiz', 'Felipe Torres']
export const clientes = [
  'Todos',
  'Distribuidora El Progreso',
  'Restaurante La Brasa Dorada',
  'Hotelería Caribe Group',
  'Supermercado La Economía',
  'Cafetería Central',
]
export const proveedores = [
  'Todos',
  'Alimentos del Valle S.A.',
  'Lácteos La Pradera',
  'Distribuidora Nacional',
  'Café de Origen Ltda.',
  'Empaques y Más',
]
export const categorias = [
  'Todas',
  'Bebidas',
  'Panadería',
  'Lácteos',
  'Abarrotes',
  'Aseo',
  'Snacks',
]
export const productos = [
  'Todos',
  'Café Molido Premium 500g',
  'Pan Artesanal Integral',
  'Leche Entera 1L',
  'Aceite de Oliva Extra 750ml',
  'Queso Manchego 250g',
]

/* -------------------------------------------------------------------------- */
/*  Report view model                                                         */
/* -------------------------------------------------------------------------- */

export interface ChartSpec {
  kind: 'bar' | 'line' | 'pie'
  title: string
  subtitle?: string
  format: ValueFormat
  colorful?: boolean
  data: { label: string; value: number }[]
}

export type ColumnFormat = ValueFormat | 'text'

export interface TableColumn {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
  format?: ColumnFormat
}

export interface ReportTable {
  columns: TableColumn[]
  rows: Record<string, string | number>[]
}

export interface ReportStat {
  label: string
  value: string
  hint?: string
  tone?: 'default' | 'success' | 'danger' | 'warning' | 'primary'
}

export interface ReportView {
  id: string
  title: string
  description: string
  stats: ReportStat[]
  charts: ChartSpec[]
  table: ReportTable
}

/* -------------------------------------------------------------------------- */
/*  Shared datasets                                                           */
/* -------------------------------------------------------------------------- */

const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep']
const monthlySales = [32_400_000, 28_900_000, 35_100_000, 33_700_000, 38_200_000, 41_500_000, 39_800_000, 44_300_000, 47_920_000]
const monthlyPurchases = [21_200_000, 19_800_000, 22_400_000, 20_900_000, 24_100_000, 25_600_000, 24_800_000, 27_100_000, 28_640_000]

/* -------------------------------------------------------------------------- */
/*  Report builders                                                           */
/* -------------------------------------------------------------------------- */

const builders: Record<string, () => ReportView> = {
  /* ----------------------------- VENTAS ---------------------------------- */
  'ventas-dia': () => ({
    id: 'ventas-dia',
    title: 'Ventas por día',
    description: 'Comportamiento diario de las ventas en el período seleccionado.',
    stats: [
      { label: 'Total del período', value: formatCurrency(18_940_000), tone: 'primary' },
      { label: 'Promedio diario', value: formatCurrency(1_894_000) },
      { label: 'Mejor día', value: 'Sáb 20', hint: formatCurrency(2_638_000), tone: 'success' },
      { label: 'Transacciones', value: formatNumber(1_284) },
    ],
    charts: [
      {
        kind: 'line',
        title: 'Ventas diarias',
        subtitle: 'Últimos 10 días',
        format: 'currency',
        data: [
          { label: '13', value: 1_248_000 },
          { label: '14', value: 1_523_000 },
          { label: '15', value: 1_187_000 },
          { label: '16', value: 1_894_000 },
          { label: '17', value: 1_642_000 },
          { label: '18', value: 2_261_000 },
          { label: '19', value: 2_034_000 },
          { label: '20', value: 2_638_000 },
          { label: '21', value: 1_842_000 },
          { label: '22', value: 1_671_000 },
        ],
      },
    ],
    table: {
      columns: [
        { key: 'fecha', label: 'Fecha' },
        { key: 'tx', label: 'Transacciones', align: 'right', format: 'number' },
        { key: 'ticket', label: 'Ticket prom.', align: 'right', format: 'currency' },
        { key: 'total', label: 'Total', align: 'right', format: 'currency' },
      ],
      rows: [
        { fecha: '18 sep', tx: 142, ticket: 15_930, total: 2_261_000 },
        { fecha: '19 sep', tx: 128, ticket: 15_890, total: 2_034_000 },
        { fecha: '20 sep', tx: 168, ticket: 15_700, total: 2_638_000 },
        { fecha: '21 sep', tx: 121, ticket: 15_220, total: 1_842_000 },
        { fecha: '22 sep', tx: 109, ticket: 15_330, total: 1_671_000 },
      ],
    },
  }),

  'ventas-periodo': () => ({
    id: 'ventas-periodo',
    title: 'Ventas por período',
    description: 'Evolución mensual de las ventas del año en curso.',
    stats: [
      { label: 'Acumulado 2026', value: formatCurrency(341_820_000), tone: 'primary' },
      { label: 'Promedio mensual', value: formatCurrency(37_980_000) },
      { label: 'Crecimiento', value: '+8.1%', tone: 'success' },
      { label: 'Meta mensual', value: formatCurrency(50_000_000) },
    ],
    charts: [
      {
        kind: 'bar',
        title: 'Ventas mensuales',
        subtitle: 'Enero – Septiembre 2026',
        format: 'currency',
        data: months.map((m, i) => ({ label: m, value: monthlySales[i] })),
      },
    ],
    table: {
      columns: [
        { key: 'mes', label: 'Mes' },
        { key: 'ventas', label: 'Ventas', align: 'right', format: 'currency' },
        { key: 'tx', label: 'Transacciones', align: 'right', format: 'number' },
        { key: 'var', label: 'Variación', align: 'right', format: 'percent' },
      ],
      rows: months.map((m, i) => ({
        mes: m,
        ventas: monthlySales[i],
        tx: 1800 + i * 120,
        var: i === 0 ? 0 : Number((((monthlySales[i] - monthlySales[i - 1]) / monthlySales[i - 1]) * 100).toFixed(1)),
      })),
    },
  }),

  'ventas-vendedor': () => ({
    id: 'ventas-vendedor',
    title: 'Ventas por vendedor',
    description: 'Aporte de cada vendedor al total facturado del período.',
    stats: [
      { label: 'Total equipo', value: formatCurrency(47_920_000), tone: 'primary' },
      { label: 'Top vendedor', value: 'Carolina Ruiz', tone: 'success' },
      { label: 'Vendedores activos', value: '4' },
      { label: 'Ticket promedio', value: formatCurrency(15_600) },
    ],
    charts: [
      {
        kind: 'bar',
        title: 'Facturación por vendedor',
        format: 'currency',
        colorful: true,
        data: [
          { label: 'Carolina R.', value: 14_820_000 },
          { label: 'Laura M.', value: 12_640_000 },
          { label: 'Andrés G.', value: 11_180_000 },
          { label: 'Felipe T.', value: 9_280_000 },
        ],
      },
      {
        kind: 'pie',
        title: 'Participación',
        format: 'currency',
        data: [
          { label: 'Carolina Ruiz', value: 14_820_000 },
          { label: 'Laura Martínez', value: 12_640_000 },
          { label: 'Andrés Gómez', value: 11_180_000 },
          { label: 'Felipe Torres', value: 9_280_000 },
        ],
      },
    ],
    table: {
      columns: [
        { key: 'vendedor', label: 'Vendedor' },
        { key: 'tx', label: 'Ventas', align: 'right', format: 'number' },
        { key: 'ticket', label: 'Ticket prom.', align: 'right', format: 'currency' },
        { key: 'total', label: 'Total', align: 'right', format: 'currency' },
        { key: 'part', label: 'Part.', align: 'right', format: 'percent' },
      ],
      rows: [
        { vendedor: 'Carolina Ruiz', tx: 942, ticket: 15_730, total: 14_820_000, part: 30.9 },
        { vendedor: 'Laura Martínez', tx: 812, ticket: 15_560, total: 12_640_000, part: 26.4 },
        { vendedor: 'Andrés Gómez', tx: 728, ticket: 15_360, total: 11_180_000, part: 23.3 },
        { vendedor: 'Felipe Torres', tx: 604, ticket: 15_360, total: 9_280_000, part: 19.4 },
      ],
    },
  }),

  'ventas-cliente': () => ({
    id: 'ventas-cliente',
    title: 'Ventas por cliente',
    description: 'Clientes con mayor volumen de compra en el período.',
    stats: [
      { label: 'Clientes activos', value: formatNumber(284) },
      { label: 'Top cliente', value: 'Hotelería Caribe', tone: 'success' },
      { label: 'Concentración top 5', value: '38.4%', tone: 'warning' },
      { label: 'Nuevos clientes', value: '46' },
    ],
    charts: [
      {
        kind: 'bar',
        title: 'Top clientes por facturación',
        format: 'currency',
        colorful: true,
        data: [
          { label: 'Caribe Group', value: 6_880_000 },
          { label: 'El Progreso', value: 5_430_000 },
          { label: 'La Economía', value: 4_120_000 },
          { label: 'La Brasa', value: 3_380_000 },
          { label: 'Cafetería C.', value: 2_610_000 },
        ],
      },
    ],
    table: {
      columns: [
        { key: 'cliente', label: 'Cliente' },
        { key: 'ciudad', label: 'Ciudad' },
        { key: 'compras', label: 'Compras', align: 'right', format: 'number' },
        { key: 'total', label: 'Total', align: 'right', format: 'currency' },
      ],
      rows: [
        { cliente: 'Hotelería Caribe Group', ciudad: 'Cartagena', compras: 38, total: 6_880_000 },
        { cliente: 'Distribuidora El Progreso', ciudad: 'Bogotá', compras: 42, total: 5_430_000 },
        { cliente: 'Supermercado La Economía', ciudad: 'Barranquilla', compras: 29, total: 4_120_000 },
        { cliente: 'Restaurante La Brasa Dorada', ciudad: 'Medellín', compras: 24, total: 3_380_000 },
        { cliente: 'Cafetería Central', ciudad: 'Bogotá', compras: 31, total: 2_610_000 },
      ],
    },
  }),

  'ventas-producto': () => ({
    id: 'ventas-producto',
    title: 'Ventas por producto',
    description: 'Productos más vendidos por unidades y valor.',
    stats: [
      { label: 'Unidades vendidas', value: formatNumber(3_847) },
      { label: 'Producto estrella', value: 'Café Molido', tone: 'success' },
      { label: 'Referencias vendidas', value: '312' },
      { label: 'Valor total', value: formatCurrency(32_618_000), tone: 'primary' },
    ],
    charts: [
      {
        kind: 'bar',
        title: 'Top productos por unidades',
        format: 'number',
        colorful: true,
        data: [
          { label: 'Café Molido', value: 342 },
          { label: 'Pan Integral', value: 289 },
          { label: 'Leche 1L', value: 254 },
          { label: 'Aceite Oliva', value: 187 },
          { label: 'Queso Manch.', value: 163 },
        ],
      },
    ],
    table: {
      columns: [
        { key: 'producto', label: 'Producto' },
        { key: 'categoria', label: 'Categoría' },
        { key: 'unidades', label: 'Unidades', align: 'right', format: 'number' },
        { key: 'total', label: 'Total', align: 'right', format: 'currency' },
      ],
      rows: [
        { producto: 'Café Molido Premium 500g', categoria: 'Bebidas', unidades: 342, total: 8_550_000 },
        { producto: 'Pan Artesanal Integral', categoria: 'Panadería', unidades: 289, total: 4_335_000 },
        { producto: 'Leche Entera 1L', categoria: 'Lácteos', unidades: 254, total: 3_048_000 },
        { producto: 'Aceite de Oliva Extra 750ml', categoria: 'Abarrotes', unidades: 187, total: 9_350_000 },
        { producto: 'Queso Manchego 250g', categoria: 'Lácteos', unidades: 163, total: 7_335_000 },
      ],
    },
  }),

  'ventas-sucursal': () => ({
    id: 'ventas-sucursal',
    title: 'Ventas por sucursal',
    description: 'Distribución de las ventas entre las sedes del negocio.',
    stats: [
      { label: 'Total red', value: formatCurrency(47_920_000), tone: 'primary' },
      { label: 'Mejor sede', value: 'Sede Principal', tone: 'success' },
      { label: 'Sedes activas', value: '4' },
      { label: 'Crecimiento red', value: '+8.1%', tone: 'success' },
    ],
    charts: [
      {
        kind: 'pie',
        title: 'Participación por sede',
        format: 'currency',
        data: [
          { label: 'Sede Principal', value: 19_940_000 },
          { label: 'Sucursal Norte', value: 12_360_000 },
          { label: 'Sucursal Sur', value: 9_180_000 },
          { label: 'Centro', value: 6_440_000 },
        ],
      },
      {
        kind: 'bar',
        title: 'Ventas por sede',
        format: 'currency',
        colorful: true,
        data: [
          { label: 'Principal', value: 19_940_000 },
          { label: 'Norte', value: 12_360_000 },
          { label: 'Sur', value: 9_180_000 },
          { label: 'Centro', value: 6_440_000 },
        ],
      },
    ],
    table: {
      columns: [
        { key: 'sede', label: 'Sucursal' },
        { key: 'tx', label: 'Transacciones', align: 'right', format: 'number' },
        { key: 'total', label: 'Total', align: 'right', format: 'currency' },
        { key: 'part', label: 'Part.', align: 'right', format: 'percent' },
      ],
      rows: [
        { sede: 'Sede Principal', tx: 1_842, total: 19_940_000, part: 41.6 },
        { sede: 'Sucursal Norte', tx: 1_128, total: 12_360_000, part: 25.8 },
        { sede: 'Sucursal Sur', tx: 864, total: 9_180_000, part: 19.2 },
        { sede: 'Centro', tx: 612, total: 6_440_000, part: 13.4 },
      ],
    },
  }),

  /* --------------------------- INVENTARIO -------------------------------- */
  'inv-actual': () => ({
    id: 'inv-actual',
    title: 'Inventario actual',
    description: 'Existencias y valorización de las referencias en bodega.',
    stats: [
      { label: 'Referencias', value: formatNumber(1_284) },
      { label: 'Valor inventario', value: formatCurrency(84_150_000), tone: 'primary' },
      { label: 'Unidades totales', value: formatNumber(28_640) },
      { label: 'Stock bajo', value: '7', tone: 'warning' },
    ],
    charts: [
      {
        kind: 'bar',
        title: 'Valor por categoría',
        format: 'currency',
        colorful: true,
        data: [
          { label: 'Abarrotes', value: 28_400_000 },
          { label: 'Bebidas', value: 19_800_000 },
          { label: 'Lácteos', value: 14_600_000 },
          { label: 'Panadería', value: 9_350_000 },
          { label: 'Snacks', value: 7_200_000 },
          { label: 'Aseo', value: 4_800_000 },
        ],
      },
    ],
    table: {
      columns: [
        { key: 'producto', label: 'Producto' },
        { key: 'categoria', label: 'Categoría' },
        { key: 'stock', label: 'Stock', align: 'right', format: 'number' },
        { key: 'costo', label: 'Costo unit.', align: 'right', format: 'currency' },
        { key: 'valor', label: 'Valor', align: 'right', format: 'currency' },
      ],
      rows: [
        { producto: 'Café Molido Premium 500g', categoria: 'Bebidas', stock: 420, costo: 14_800, valor: 6_216_000 },
        { producto: 'Aceite de Oliva Extra 750ml', categoria: 'Abarrotes', stock: 210, costo: 38_500, valor: 8_085_000 },
        { producto: 'Leche Entera 1L', categoria: 'Lácteos', stock: 680, costo: 3_600, valor: 2_448_000 },
        { producto: 'Queso Manchego 250g', categoria: 'Lácteos', stock: 145, costo: 32_000, valor: 4_640_000 },
        { producto: 'Pan Artesanal Integral', categoria: 'Panadería', stock: 96, costo: 6_800, valor: 652_800 },
      ],
    },
  }),

  'inv-kardex': () => ({
    id: 'inv-kardex',
    title: 'Kardex',
    description: 'Movimientos de entradas y salidas de una referencia.',
    stats: [
      { label: 'Producto', value: 'Café Molido 500g' },
      { label: 'Saldo actual', value: formatNumber(420), tone: 'primary' },
      { label: 'Entradas (mes)', value: formatNumber(600), tone: 'success' },
      { label: 'Salidas (mes)', value: formatNumber(342), tone: 'danger' },
    ],
    charts: [
      {
        kind: 'line',
        title: 'Evolución del saldo',
        subtitle: 'Últimas semanas',
        format: 'number',
        data: [
          { label: 'S1', value: 162 },
          { label: 'S2', value: 480 },
          { label: 'S3', value: 386 },
          { label: 'S4', value: 512 },
          { label: 'S5', value: 458 },
          { label: 'S6', value: 420 },
        ],
      },
    ],
    table: {
      columns: [
        { key: 'fecha', label: 'Fecha' },
        { key: 'mov', label: 'Movimiento' },
        { key: 'entrada', label: 'Entrada', align: 'right', format: 'number' },
        { key: 'salida', label: 'Salida', align: 'right', format: 'number' },
        { key: 'saldo', label: 'Saldo', align: 'right', format: 'number' },
      ],
      rows: [
        { fecha: '02 sep', mov: 'Compra #C-1201', entrada: 300, salida: 0, saldo: 480 },
        { fecha: '08 sep', mov: 'Venta POS', entrada: 0, salida: 94, saldo: 386 },
        { fecha: '14 sep', mov: 'Compra #C-1233', entrada: 300, salida: 0, saldo: 512 },
        { fecha: '18 sep', mov: 'Venta POS', entrada: 0, salida: 54, saldo: 458 },
        { fecha: '22 sep', mov: 'Venta POS', entrada: 0, salida: 38, saldo: 420 },
      ],
    },
  }),

  'inv-stock-bajo': () => ({
    id: 'inv-stock-bajo',
    title: 'Stock bajo',
    description: 'Referencias por debajo del stock mínimo definido.',
    stats: [
      { label: 'Productos por reponer', value: '7', tone: 'warning' },
      { label: 'Valor sugerido compra', value: formatCurrency(3_240_000), tone: 'primary' },
      { label: 'Críticos', value: '2', tone: 'danger' },
      { label: 'Proveedores', value: '4' },
    ],
    charts: [
      {
        kind: 'bar',
        title: 'Faltante frente al mínimo',
        format: 'number',
        colorful: true,
        data: [
          { label: 'Servilletas', value: 180 },
          { label: 'Azúcar 1kg', value: 120 },
          { label: 'Té Verde', value: 90 },
          { label: 'Jabón', value: 64 },
          { label: 'Galletas', value: 42 },
        ],
      },
    ],
    table: {
      columns: [
        { key: 'producto', label: 'Producto' },
        { key: 'stock', label: 'Stock', align: 'right', format: 'number' },
        { key: 'min', label: 'Mínimo', align: 'right', format: 'number' },
        { key: 'sugerido', label: 'Reponer', align: 'right', format: 'number' },
        { key: 'estado', label: 'Estado', align: 'center' },
      ],
      rows: [
        { producto: 'Servilletas x100', stock: 20, min: 200, sugerido: 300, estado: 'Crítico' },
        { producto: 'Azúcar 1kg', stock: 80, min: 200, sugerido: 200, estado: 'Bajo' },
        { producto: 'Té Verde x25', stock: 30, min: 120, sugerido: 150, estado: 'Crítico' },
        { producto: 'Jabón en barra', stock: 36, min: 100, sugerido: 120, estado: 'Bajo' },
        { producto: 'Galletas surtidas', stock: 58, min: 100, sugerido: 100, estado: 'Bajo' },
      ],
    },
  }),

  'inv-agotados': () => ({
    id: 'inv-agotados',
    title: 'Productos agotados',
    description: 'Referencias sin existencias y ventas perdidas estimadas.',
    stats: [
      { label: 'Agotados', value: '12', tone: 'danger' },
      { label: 'Venta perdida est.', value: formatCurrency(2_180_000), tone: 'danger' },
      { label: 'Días agotado prom.', value: '6' },
      { label: 'Reposición pendiente', value: '9' },
    ],
    charts: [
      {
        kind: 'bar',
        title: 'Días agotado',
        format: 'number',
        colorful: true,
        data: [
          { label: 'Gaseosa 3L', value: 14 },
          { label: 'Arroz 5kg', value: 9 },
          { label: 'Atún lata', value: 7 },
          { label: 'Detergente', value: 5 },
          { label: 'Yogurt 1L', value: 3 },
        ],
      },
    ],
    table: {
      columns: [
        { key: 'producto', label: 'Producto' },
        { key: 'categoria', label: 'Categoría' },
        { key: 'dias', label: 'Días agotado', align: 'right', format: 'number' },
        { key: 'perdida', label: 'Venta perdida', align: 'right', format: 'currency' },
      ],
      rows: [
        { producto: 'Gaseosa Familiar 3L', categoria: 'Bebidas', dias: 14, perdida: 840_000 },
        { producto: 'Arroz Premium 5kg', categoria: 'Abarrotes', dias: 9, perdida: 560_000 },
        { producto: 'Atún en lata x3', categoria: 'Abarrotes', dias: 7, perdida: 320_000 },
        { producto: 'Detergente 2kg', categoria: 'Aseo', dias: 5, perdida: 280_000 },
        { producto: 'Yogurt Griego 1L', categoria: 'Lácteos', dias: 3, perdida: 180_000 },
      ],
    },
  }),

  'inv-valorizacion': () => ({
    id: 'inv-valorizacion',
    title: 'Valorización de inventario',
    description: 'Valor del inventario distribuido por categoría.',
    stats: [
      { label: 'Valor total', value: formatCurrency(84_150_000), tone: 'primary' },
      { label: 'Al costo', value: formatCurrency(84_150_000) },
      { label: 'Precio de venta', value: formatCurrency(126_400_000), tone: 'success' },
      { label: 'Margen potencial', value: '33.4%', tone: 'success' },
    ],
    charts: [
      {
        kind: 'pie',
        title: 'Valor por categoría',
        format: 'currency',
        data: [
          { label: 'Abarrotes', value: 28_400_000 },
          { label: 'Bebidas', value: 19_800_000 },
          { label: 'Lácteos', value: 14_600_000 },
          { label: 'Panadería', value: 9_350_000 },
          { label: 'Snacks', value: 7_200_000 },
          { label: 'Aseo', value: 4_800_000 },
        ],
      },
    ],
    table: {
      columns: [
        { key: 'categoria', label: 'Categoría' },
        { key: 'refs', label: 'Referencias', align: 'right', format: 'number' },
        { key: 'unidades', label: 'Unidades', align: 'right', format: 'number' },
        { key: 'valor', label: 'Valor', align: 'right', format: 'currency' },
        { key: 'part', label: 'Part.', align: 'right', format: 'percent' },
      ],
      rows: [
        { categoria: 'Abarrotes', refs: 342, unidades: 9_800, valor: 28_400_000, part: 33.7 },
        { categoria: 'Bebidas', refs: 218, unidades: 6_400, valor: 19_800_000, part: 23.5 },
        { categoria: 'Lácteos', refs: 164, unidades: 4_200, valor: 14_600_000, part: 17.3 },
        { categoria: 'Panadería', refs: 128, unidades: 3_100, valor: 9_350_000, part: 11.1 },
        { categoria: 'Snacks', refs: 196, unidades: 3_040, valor: 7_200_000, part: 8.6 },
        { categoria: 'Aseo', refs: 236, unidades: 2_100, valor: 4_800_000, part: 5.8 },
      ],
    },
  }),

  'inv-rotacion': () => ({
    id: 'inv-rotacion',
    title: 'Rotación de inventario',
    description: 'Índice de rotación por categoría en el período.',
    stats: [
      { label: 'Rotación promedio', value: '4.2x', tone: 'primary' },
      { label: 'Mayor rotación', value: 'Panadería', tone: 'success' },
      { label: 'Menor rotación', value: 'Aseo', tone: 'warning' },
      { label: 'Días inventario', value: '86' },
    ],
    charts: [
      {
        kind: 'bar',
        title: 'Índice de rotación (veces)',
        format: 'number',
        colorful: true,
        data: [
          { label: 'Panadería', value: 12 },
          { label: 'Lácteos', value: 8 },
          { label: 'Bebidas', value: 6 },
          { label: 'Snacks', value: 4 },
          { label: 'Abarrotes', value: 3 },
          { label: 'Aseo', value: 2 },
        ],
      },
    ],
    table: {
      columns: [
        { key: 'categoria', label: 'Categoría' },
        { key: 'rotacion', label: 'Rotación', align: 'right', format: 'number' },
        { key: 'dias', label: 'Días inv.', align: 'right', format: 'number' },
        { key: 'estado', label: 'Estado', align: 'center' },
      ],
      rows: [
        { categoria: 'Panadería', rotacion: 12, dias: 30, estado: 'Óptima' },
        { categoria: 'Lácteos', rotacion: 8, dias: 45, estado: 'Óptima' },
        { categoria: 'Bebidas', rotacion: 6, dias: 61, estado: 'Buena' },
        { categoria: 'Snacks', rotacion: 4, dias: 91, estado: 'Regular' },
        { categoria: 'Abarrotes', rotacion: 3, dias: 122, estado: 'Regular' },
        { categoria: 'Aseo', rotacion: 2, dias: 182, estado: 'Baja' },
      ],
    },
  }),

  /* ----------------------------- COMPRAS --------------------------------- */
  'compras-periodo': () => ({
    id: 'compras-periodo',
    title: 'Compras por período',
    description: 'Evolución mensual de las compras a proveedores.',
    stats: [
      { label: 'Acumulado 2026', value: formatCurrency(210_540_000), tone: 'primary' },
      { label: 'Promedio mensual', value: formatCurrency(23_390_000) },
      { label: 'Órdenes de compra', value: formatNumber(342) },
      { label: 'Variación', value: '+3.4%', tone: 'warning' },
    ],
    charts: [
      {
        kind: 'bar',
        title: 'Compras mensuales',
        subtitle: 'Enero – Septiembre 2026',
        format: 'currency',
        data: months.map((m, i) => ({ label: m, value: monthlyPurchases[i] })),
      },
    ],
    table: {
      columns: [
        { key: 'mes', label: 'Mes' },
        { key: 'compras', label: 'Compras', align: 'right', format: 'currency' },
        { key: 'ordenes', label: 'Órdenes', align: 'right', format: 'number' },
      ],
      rows: months.map((m, i) => ({ mes: m, compras: monthlyPurchases[i], ordenes: 28 + i * 4 })),
    },
  }),

  'compras-proveedor': () => ({
    id: 'compras-proveedor',
    title: 'Compras por proveedor',
    description: 'Proveedores con mayor volumen de compra en el período.',
    stats: [
      { label: 'Proveedores activos', value: '38' },
      { label: 'Top proveedor', value: 'Alimentos del Valle', tone: 'success' },
      { label: 'Concentración top 5', value: '62.8%', tone: 'warning' },
      { label: 'Total período', value: formatCurrency(28_640_000), tone: 'primary' },
    ],
    charts: [
      {
        kind: 'pie',
        title: 'Participación por proveedor',
        format: 'currency',
        data: [
          { label: 'Alimentos del Valle', value: 8_420_000 },
          { label: 'Lácteos La Pradera', value: 5_980_000 },
          { label: 'Distribuidora Nacional', value: 4_620_000 },
          { label: 'Café de Origen', value: 3_580_000 },
          { label: 'Empaques y Más', value: 2_400_000 },
        ],
      },
    ],
    table: {
      columns: [
        { key: 'proveedor', label: 'Proveedor' },
        { key: 'ordenes', label: 'Órdenes', align: 'right', format: 'number' },
        { key: 'total', label: 'Total', align: 'right', format: 'currency' },
        { key: 'part', label: 'Part.', align: 'right', format: 'percent' },
      ],
      rows: [
        { proveedor: 'Alimentos del Valle S.A.', ordenes: 42, total: 8_420_000, part: 29.4 },
        { proveedor: 'Lácteos La Pradera', ordenes: 38, total: 5_980_000, part: 20.9 },
        { proveedor: 'Distribuidora Nacional', ordenes: 31, total: 4_620_000, part: 16.1 },
        { proveedor: 'Café de Origen Ltda.', ordenes: 24, total: 3_580_000, part: 12.5 },
        { proveedor: 'Empaques y Más', ordenes: 18, total: 2_400_000, part: 8.4 },
      ],
    },
  }),

  'compras-productos': () => ({
    id: 'compras-productos',
    title: 'Productos comprados',
    description: 'Productos con mayor volumen de compra en unidades y valor.',
    stats: [
      { label: 'Unidades compradas', value: formatNumber(12_480) },
      { label: 'Referencias', value: '284' },
      { label: 'Costo total', value: formatCurrency(28_640_000), tone: 'primary' },
      { label: 'Costo prom. unit.', value: formatCurrency(2_295) },
    ],
    charts: [
      {
        kind: 'bar',
        title: 'Top productos comprados',
        format: 'number',
        colorful: true,
        data: [
          { label: 'Leche 1L', value: 2_400 },
          { label: 'Café 500g', value: 1_800 },
          { label: 'Azúcar 1kg', value: 1_240 },
          { label: 'Aceite 750ml', value: 960 },
          { label: 'Pan integral', value: 820 },
        ],
      },
    ],
    table: {
      columns: [
        { key: 'producto', label: 'Producto' },
        { key: 'proveedor', label: 'Proveedor' },
        { key: 'unidades', label: 'Unidades', align: 'right', format: 'number' },
        { key: 'costo', label: 'Costo', align: 'right', format: 'currency' },
      ],
      rows: [
        { producto: 'Leche Entera 1L', proveedor: 'Lácteos La Pradera', unidades: 2_400, costo: 8_640_000 },
        { producto: 'Café Molido 500g', proveedor: 'Café de Origen', unidades: 1_800, costo: 3_580_000 },
        { producto: 'Azúcar 1kg', proveedor: 'Distribuidora Nacional', unidades: 1_240, costo: 2_480_000 },
        { producto: 'Aceite de Oliva 750ml', proveedor: 'Alimentos del Valle', unidades: 960, costo: 4_620_000 },
        { producto: 'Pan Artesanal Integral', proveedor: 'Alimentos del Valle', unidades: 820, costo: 1_640_000 },
      ],
    },
  }),

  /* ---------------------------- FINANCIERO ------------------------------- */
  'fin-utilidad': () => ({
    id: 'fin-utilidad',
    title: 'Utilidad',
    description: 'Ingresos, costos y utilidad neta por mes.',
    stats: [
      { label: 'Utilidad del mes', value: formatCurrency(19_280_000), tone: 'success' },
      { label: 'Margen neto', value: '40.2%', tone: 'success' },
      { label: 'Utilidad acumulada', value: formatCurrency(131_280_000), tone: 'primary' },
      { label: 'Variación', value: '+11.6%', tone: 'success' },
    ],
    charts: [
      {
        kind: 'line',
        title: 'Utilidad mensual',
        subtitle: 'Enero – Septiembre 2026',
        format: 'currency',
        data: months.map((m, i) => ({ label: m, value: monthlySales[i] - monthlyPurchases[i] })),
      },
    ],
    table: {
      columns: [
        { key: 'mes', label: 'Mes' },
        { key: 'ingresos', label: 'Ingresos', align: 'right', format: 'currency' },
        { key: 'costos', label: 'Costos', align: 'right', format: 'currency' },
        { key: 'utilidad', label: 'Utilidad', align: 'right', format: 'currency' },
        { key: 'margen', label: 'Margen', align: 'right', format: 'percent' },
      ],
      rows: months.map((m, i) => ({
        mes: m,
        ingresos: monthlySales[i],
        costos: monthlyPurchases[i],
        utilidad: monthlySales[i] - monthlyPurchases[i],
        margen: Number((((monthlySales[i] - monthlyPurchases[i]) / monthlySales[i]) * 100).toFixed(1)),
      })),
    },
  }),

  'fin-ingresos': () => ({
    id: 'fin-ingresos',
    title: 'Ingresos',
    description: 'Ingresos del período por fuente.',
    stats: [
      { label: 'Ingresos del mes', value: formatCurrency(47_920_000), tone: 'primary' },
      { label: 'Contado', value: formatCurrency(32_610_000), tone: 'success' },
      { label: 'Crédito', value: formatCurrency(15_310_000), tone: 'warning' },
      { label: 'Otros ingresos', value: formatCurrency(1_240_000) },
    ],
    charts: [
      {
        kind: 'pie',
        title: 'Ingresos por medio de pago',
        format: 'currency',
        data: [
          { label: 'Efectivo', value: 18_420_000 },
          { label: 'Tarjeta', value: 14_190_000 },
          { label: 'Transferencia', value: 12_060_000 },
          { label: 'Crédito', value: 3_250_000 },
        ],
      },
    ],
    table: {
      columns: [
        { key: 'medio', label: 'Medio de pago' },
        { key: 'tx', label: 'Transacciones', align: 'right', format: 'number' },
        { key: 'total', label: 'Total', align: 'right', format: 'currency' },
        { key: 'part', label: 'Part.', align: 'right', format: 'percent' },
      ],
      rows: [
        { medio: 'Efectivo', tx: 1_842, total: 18_420_000, part: 38.4 },
        { medio: 'Tarjeta', tx: 968, total: 14_190_000, part: 29.6 },
        { medio: 'Transferencia', tx: 742, total: 12_060_000, part: 25.2 },
        { medio: 'Crédito', tx: 128, total: 3_250_000, part: 6.8 },
      ],
    },
  }),

  'fin-egresos': () => ({
    id: 'fin-egresos',
    title: 'Egresos',
    description: 'Distribución de los egresos del período.',
    stats: [
      { label: 'Egresos del mes', value: formatCurrency(28_640_000), tone: 'danger' },
      { label: 'Compras', value: formatCurrency(18_640_000) },
      { label: 'Nómina', value: formatCurrency(6_200_000) },
      { label: 'Gastos fijos', value: formatCurrency(3_800_000) },
    ],
    charts: [
      {
        kind: 'pie',
        title: 'Egresos por concepto',
        format: 'currency',
        data: [
          { label: 'Compras', value: 18_640_000 },
          { label: 'Nómina', value: 6_200_000 },
          { label: 'Arriendo', value: 2_100_000 },
          { label: 'Servicios', value: 1_100_000 },
          { label: 'Otros', value: 600_000 },
        ],
      },
    ],
    table: {
      columns: [
        { key: 'concepto', label: 'Concepto' },
        { key: 'total', label: 'Total', align: 'right', format: 'currency' },
        { key: 'part', label: 'Part.', align: 'right', format: 'percent' },
      ],
      rows: [
        { concepto: 'Compras de mercancía', total: 18_640_000, part: 65.1 },
        { concepto: 'Nómina', total: 6_200_000, part: 21.6 },
        { concepto: 'Arriendo', total: 2_100_000, part: 7.3 },
        { concepto: 'Servicios públicos', total: 1_100_000, part: 3.8 },
        { concepto: 'Otros gastos', total: 600_000, part: 2.2 },
      ],
    },
  }),

  'fin-caja': () => ({
    id: 'fin-caja',
    title: 'Caja',
    description: 'Flujo de caja diario del período seleccionado.',
    stats: [
      { label: 'Saldo en caja', value: formatCurrency(8_420_000), tone: 'primary' },
      { label: 'Ingresos hoy', value: formatCurrency(1_671_000), tone: 'success' },
      { label: 'Egresos hoy', value: formatCurrency(640_000), tone: 'danger' },
      { label: 'Arqueos', value: '3' },
    ],
    charts: [
      {
        kind: 'line',
        title: 'Saldo de caja',
        subtitle: 'Últimos 10 días',
        format: 'currency',
        data: [
          { label: '13', value: 5_200_000 },
          { label: '14', value: 5_980_000 },
          { label: '15', value: 6_240_000 },
          { label: '16', value: 6_010_000 },
          { label: '17', value: 6_820_000 },
          { label: '18', value: 7_540_000 },
          { label: '19', value: 7_180_000 },
          { label: '20', value: 8_120_000 },
          { label: '21', value: 8_390_000 },
          { label: '22', value: 8_420_000 },
        ],
      },
    ],
    table: {
      columns: [
        { key: 'fecha', label: 'Fecha' },
        { key: 'ingresos', label: 'Ingresos', align: 'right', format: 'currency' },
        { key: 'egresos', label: 'Egresos', align: 'right', format: 'currency' },
        { key: 'saldo', label: 'Saldo', align: 'right', format: 'currency' },
      ],
      rows: [
        { fecha: '18 sep', ingresos: 2_261_000, egresos: 1_540_000, saldo: 7_540_000 },
        { fecha: '19 sep', ingresos: 2_034_000, egresos: 2_394_000, saldo: 7_180_000 },
        { fecha: '20 sep', ingresos: 2_638_000, egresos: 1_698_000, saldo: 8_120_000 },
        { fecha: '21 sep', ingresos: 1_842_000, egresos: 1_572_000, saldo: 8_390_000 },
        { fecha: '22 sep', ingresos: 1_671_000, egresos: 1_641_000, saldo: 8_420_000 },
      ],
    },
  }),

  'fin-cartera': () => ({
    id: 'fin-cartera',
    title: 'Cartera',
    description: 'Saldo por cobrar distribuido por antigüedad.',
    stats: [
      { label: 'Cartera total', value: formatCurrency(15_310_000), tone: 'primary' },
      { label: 'Por vencer', value: formatCurrency(8_390_000), tone: 'success' },
      { label: 'Vencida', value: formatCurrency(6_920_000), tone: 'danger' },
      { label: 'Facturas', value: '18' },
    ],
    charts: [
      {
        kind: 'bar',
        title: 'Cartera por antigüedad',
        format: 'currency',
        colorful: true,
        data: [
          { label: 'Por vencer', value: 8_390_000 },
          { label: '0–30', value: 3_180_000 },
          { label: '31–60', value: 2_140_000 },
          { label: '61–90', value: 980_000 },
          { label: '+90', value: 620_000 },
        ],
      },
    ],
    table: {
      columns: [
        { key: 'rango', label: 'Antigüedad' },
        { key: 'facturas', label: 'Facturas', align: 'right', format: 'number' },
        { key: 'saldo', label: 'Saldo', align: 'right', format: 'currency' },
        { key: 'part', label: 'Part.', align: 'right', format: 'percent' },
      ],
      rows: [
        { rango: 'Por vencer', facturas: 8, saldo: 8_390_000, part: 54.8 },
        { rango: '0–30 días', facturas: 4, saldo: 3_180_000, part: 20.8 },
        { rango: '31–60 días', facturas: 3, saldo: 2_140_000, part: 14.0 },
        { rango: '61–90 días', facturas: 2, saldo: 980_000, part: 6.4 },
        { rango: '+90 días', facturas: 1, saldo: 620_000, part: 4.0 },
      ],
    },
  }),

  'fin-cxp': () => ({
    id: 'fin-cxp',
    title: 'Cuentas por pagar',
    description: 'Obligaciones pendientes con proveedores por vencimiento.',
    stats: [
      { label: 'Total por pagar', value: formatCurrency(11_470_000), tone: 'primary' },
      { label: 'Vence esta semana', value: formatCurrency(2_100_000), tone: 'warning' },
      { label: 'Vencidas', value: formatCurrency(1_340_000), tone: 'danger' },
      { label: 'Proveedores', value: '9' },
    ],
    charts: [
      {
        kind: 'bar',
        title: 'Por pagar por proveedor',
        format: 'currency',
        colorful: true,
        data: [
          { label: 'Del Valle', value: 3_820_000 },
          { label: 'La Pradera', value: 2_640_000 },
          { label: 'Nacional', value: 2_180_000 },
          { label: 'Café Origen', value: 1_580_000 },
          { label: 'Empaques', value: 1_250_000 },
        ],
      },
    ],
    table: {
      columns: [
        { key: 'proveedor', label: 'Proveedor' },
        { key: 'factura', label: 'Factura' },
        { key: 'vence', label: 'Vence' },
        { key: 'saldo', label: 'Saldo', align: 'right', format: 'currency' },
      ],
      rows: [
        { proveedor: 'Alimentos del Valle S.A.', factura: 'FC-4821', vence: '28 sep', saldo: 3_820_000 },
        { proveedor: 'Lácteos La Pradera', factura: 'FC-4790', vence: '01 oct', saldo: 2_640_000 },
        { proveedor: 'Distribuidora Nacional', factura: 'FC-4755', vence: '18 sep', saldo: 2_180_000 },
        { proveedor: 'Café de Origen Ltda.', factura: 'FC-4802', vence: '05 oct', saldo: 1_580_000 },
        { proveedor: 'Empaques y Más', factura: 'FC-4769', vence: '12 oct', saldo: 1_250_000 },
      ],
    },
  }),
}

export function getReportView(id: string): ReportView {
  const build = builders[id] ?? builders['ventas-dia']
  return build()
}
