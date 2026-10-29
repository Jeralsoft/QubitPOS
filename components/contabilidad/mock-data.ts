import {
  TrendingUp,
  TrendingDown,
  Wallet,
  HandCoins,
  ReceiptText,
  Landmark,
  Scale,
  PiggyBank,
  BookOpen,
  LayoutDashboard,
  ListTree,
  NotebookPen,
  Library,
  FileSpreadsheet,
  ArrowDownCircle,
  ArrowUpCircle,
  Percent,
  Lock,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'
import type { Indicator } from '@/components/dashboard/mock-data'
import type { ChartSpec, ColumnFormat } from '@/components/reportes/mock-data'
import { formatCurrency, formatNumber, formatValue } from '@/components/reportes/mock-data'

export { formatCurrency, formatNumber, formatValue }
export type { ColumnFormat }

/* -------------------------------------------------------------------------- */
/*  Section navigation                                                        */
/* -------------------------------------------------------------------------- */

export type SectionId =
  | 'dashboard'
  | 'plan'
  | 'asientos'
  | 'diario'
  | 'mayor'
  | 'balance'
  | 'cxc'
  | 'cxp'
  | 'ingresos'
  | 'gastos'
  | 'impuestos'
  | 'cierres'
  | 'reportes'

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
    label: 'General',
    sections: [
      { id: 'dashboard', label: 'Dashboard contable', icon: LayoutDashboard },
      { id: 'plan', label: 'Plan de cuentas', icon: ListTree },
    ],
  },
  {
    label: 'Movimientos',
    sections: [
      { id: 'asientos', label: 'Asientos contables', icon: NotebookPen },
      { id: 'diario', label: 'Libro diario', icon: BookOpen },
      { id: 'mayor', label: 'Libro mayor', icon: Library },
      { id: 'balance', label: 'Balance de comprobación', icon: Scale },
    ],
  },
  {
    label: 'Cartera',
    sections: [
      { id: 'cxc', label: 'Cuentas por cobrar', icon: HandCoins },
      { id: 'cxp', label: 'Cuentas por pagar', icon: ReceiptText },
    ],
  },
  {
    label: 'Resultados',
    sections: [
      { id: 'ingresos', label: 'Ingresos', icon: ArrowUpCircle },
      { id: 'gastos', label: 'Gastos', icon: ArrowDownCircle },
      { id: 'impuestos', label: 'Impuestos', icon: Percent },
    ],
  },
  {
    label: 'Cierre',
    sections: [
      { id: 'cierres', label: 'Cierres contables', icon: Lock },
      { id: 'reportes', label: 'Reportes contables', icon: FileSpreadsheet },
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
    id: 'ingresos',
    label: 'Ingresos',
    value: formatCurrency(47_920_000),
    description: 'Septiembre 2026',
    comparison: '+8.1% vs. mes anterior',
    trend: 'up',
    tone: 'success',
    icon: ArrowUpCircle,
  },
  {
    id: 'gastos',
    label: 'Gastos',
    value: formatCurrency(28_640_000),
    description: 'Septiembre 2026',
    comparison: '+3.4% vs. mes anterior',
    trend: 'up',
    tone: 'warning',
    icon: ArrowDownCircle,
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
    id: 'cxc',
    label: 'Cuentas por cobrar',
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
  {
    id: 'activos',
    label: 'Activos',
    value: formatCurrency(212_480_000),
    description: 'Total activos',
    comparison: '+5.2% vs. mes anterior',
    trend: 'up',
    tone: 'primary',
    icon: Landmark,
  },
  {
    id: 'pasivos',
    label: 'Pasivos',
    value: formatCurrency(78_640_000),
    description: 'Total pasivos',
    comparison: '-1.8% vs. mes anterior',
    trend: 'up',
    tone: 'warning',
    icon: Wallet,
  },
  {
    id: 'patrimonio',
    label: 'Patrimonio',
    value: formatCurrency(133_840_000),
    description: 'Total patrimonio',
    comparison: '+9.4% vs. mes anterior',
    trend: 'up',
    tone: 'primary',
    icon: PiggyBank,
  },
]

/* -------------------------------------------------------------------------- */
/*  Dashboard charts                                                          */
/* -------------------------------------------------------------------------- */

const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep']
const monthlyIncome = [
  32_400_000, 28_900_000, 35_100_000, 33_700_000, 38_200_000, 41_500_000, 39_800_000, 44_300_000,
  47_920_000,
]
const monthlyProfit = [
  11_800_000, 9_600_000, 13_400_000, 12_100_000, 15_200_000, 17_100_000, 15_900_000, 18_300_000,
  19_280_000,
]

export const dashboardCharts: ChartSpec[] = [
  {
    kind: 'bar',
    title: 'Ingresos mensuales',
    subtitle: 'Enero – Septiembre 2026',
    format: 'currency',
    data: months.map((m, i) => ({ label: m, value: monthlyIncome[i] })),
  },
  {
    kind: 'line',
    title: 'Utilidad mensual',
    subtitle: 'Resultado del ejercicio',
    format: 'currency',
    data: months.map((m, i) => ({ label: m, value: monthlyProfit[i] })),
  },
  {
    kind: 'pie',
    title: 'Composición de activos',
    format: 'currency',
    data: [
      { label: 'Disponible', value: 34_600_000 },
      { label: 'Cartera', value: 15_310_000 },
      { label: 'Inventarios', value: 84_150_000 },
      { label: 'Propiedad y equipo', value: 62_420_000 },
      { label: 'Otros activos', value: 16_000_000 },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/*  Plan de cuentas                                                           */
/* -------------------------------------------------------------------------- */

export type AccountType = 'Activo' | 'Pasivo' | 'Patrimonio' | 'Ingreso' | 'Gasto' | 'Costo'
export type AccountNature = 'Débito' | 'Crédito'

export interface Account {
  code: string
  name: string
  type: AccountType
  nature: AccountNature
  balance: number
  active: boolean
}

export const accountTypeVariant: Record<
  AccountType,
  'primary' | 'success' | 'warning' | 'danger' | 'neutral'
> = {
  Activo: 'primary',
  Pasivo: 'warning',
  Patrimonio: 'success',
  Ingreso: 'success',
  Gasto: 'danger',
  Costo: 'neutral',
}

export const accounts: Account[] = [
  { code: '1105', name: 'Caja general', type: 'Activo', nature: 'Débito', balance: 4_820_000, active: true },
  { code: '1110', name: 'Bancos', type: 'Activo', nature: 'Débito', balance: 29_780_000, active: true },
  { code: '1305', name: 'Clientes nacionales', type: 'Activo', nature: 'Débito', balance: 15_310_000, active: true },
  { code: '1435', name: 'Mercancías no fabricadas', type: 'Activo', nature: 'Débito', balance: 84_150_000, active: true },
  { code: '1524', name: 'Equipo de oficina', type: 'Activo', nature: 'Débito', balance: 18_640_000, active: true },
  { code: '1540', name: 'Flota y equipo de transporte', type: 'Activo', nature: 'Débito', balance: 43_780_000, active: true },
  { code: '2205', name: 'Proveedores nacionales', type: 'Pasivo', nature: 'Crédito', balance: 11_470_000, active: true },
  { code: '2365', name: 'Retención en la fuente', type: 'Pasivo', nature: 'Crédito', balance: 3_240_000, active: true },
  { code: '2408', name: 'IVA por pagar', type: 'Pasivo', nature: 'Crédito', balance: 6_180_000, active: true },
  { code: '2505', name: 'Obligaciones financieras', type: 'Pasivo', nature: 'Crédito', balance: 57_750_000, active: true },
  { code: '3115', name: 'Aportes sociales', type: 'Patrimonio', nature: 'Crédito', balance: 90_000_000, active: true },
  { code: '3605', name: 'Utilidad del ejercicio', type: 'Patrimonio', nature: 'Crédito', balance: 19_280_000, active: true },
  { code: '4135', name: 'Comercio al por mayor', type: 'Ingreso', nature: 'Crédito', balance: 44_120_000, active: true },
  { code: '4175', name: 'Devoluciones en ventas', type: 'Ingreso', nature: 'Débito', balance: 1_240_000, active: true },
  { code: '4210', name: 'Ingresos financieros', type: 'Ingreso', nature: 'Crédito', balance: 3_800_000, active: true },
  { code: '5105', name: 'Gastos de personal', type: 'Gasto', nature: 'Débito', balance: 12_640_000, active: true },
  { code: '5135', name: 'Servicios', type: 'Gasto', nature: 'Débito', balance: 4_820_000, active: true },
  { code: '5140', name: 'Gastos legales', type: 'Gasto', nature: 'Débito', balance: 1_180_000, active: true },
  { code: '5160', name: 'Depreciaciones', type: 'Gasto', nature: 'Débito', balance: 2_400_000, active: false },
  { code: '6135', name: 'Costo de mercancía vendida', type: 'Costo', nature: 'Débito', balance: 26_480_000, active: true },
]

export const accountOptions = accounts.map((a) => `${a.code} · ${a.name}`)

/* -------------------------------------------------------------------------- */
/*  Asientos contables / libro diario                                         */
/* -------------------------------------------------------------------------- */

export type EntryStatus = 'Contabilizado' | 'Borrador' | 'Anulado'

export interface JournalLine {
  account: string
  description: string
  debit: number
  credit: number
}

export interface JournalEntry {
  id: string
  number: string
  date: string
  concept: string
  reference: string
  lines: JournalLine[]
  status: EntryStatus
}

export const entryStatusVariant: Record<EntryStatus, 'success' | 'warning' | 'danger'> = {
  Contabilizado: 'success',
  Borrador: 'warning',
  Anulado: 'danger',
}

export const journalEntries: JournalEntry[] = [
  {
    id: 'a1',
    number: 'CD-000482',
    date: '22/09/2026',
    concept: 'Venta de contado factura F-002481',
    reference: 'F-002481',
    status: 'Contabilizado',
    lines: [
      { account: '1105 · Caja general', description: 'Recaudo en efectivo', debit: 1_240_000, credit: 0 },
      { account: '4135 · Comercio al por mayor', description: 'Venta de mercancía', debit: 0, credit: 1_042_000 },
      { account: '2408 · IVA por pagar', description: 'IVA generado 19%', debit: 0, credit: 198_000 },
    ],
  },
  {
    id: 'a2',
    number: 'CE-000311',
    date: '21/09/2026',
    concept: 'Pago proveedor Alimentos del Valle',
    reference: 'FC-8842',
    status: 'Contabilizado',
    lines: [
      { account: '2205 · Proveedores nacionales', description: 'Abono factura de compra', debit: 3_480_000, credit: 0 },
      { account: '1110 · Bancos', description: 'Transferencia bancaria', debit: 0, credit: 3_480_000 },
    ],
  },
  {
    id: 'a3',
    number: 'CC-000198',
    date: '20/09/2026',
    concept: 'Compra de mercancía a crédito',
    reference: 'FC-8851',
    status: 'Contabilizado',
    lines: [
      { account: '1435 · Mercancías no fabricadas', description: 'Ingreso a inventario', debit: 5_200_000, credit: 0 },
      { account: '2205 · Proveedores nacionales', description: 'Factura de compra', debit: 0, credit: 5_200_000 },
    ],
  },
  {
    id: 'a4',
    number: 'CD-000481',
    date: '20/09/2026',
    concept: 'Recaudo cartera cliente El Progreso',
    reference: 'RC-1204',
    status: 'Contabilizado',
    lines: [
      { account: '1110 · Bancos', description: 'Consignación cliente', debit: 2_640_000, credit: 0 },
      { account: '1305 · Clientes nacionales', description: 'Abono factura F-002310', debit: 0, credit: 2_640_000 },
    ],
  },
  {
    id: 'a5',
    number: 'CG-000090',
    date: '19/09/2026',
    concept: 'Causación nómina primera quincena',
    reference: 'NOM-09-1',
    status: 'Borrador',
    lines: [
      { account: '5105 · Gastos de personal', description: 'Salarios quincena', debit: 6_320_000, credit: 0 },
      { account: '1110 · Bancos', description: 'Pago nómina', debit: 0, credit: 5_480_000 },
      { account: '2365 · Retención en la fuente', description: 'Retención empleados', debit: 0, credit: 840_000 },
    ],
  },
  {
    id: 'a6',
    number: 'CD-000480',
    date: '18/09/2026',
    concept: 'Anulación factura duplicada',
    reference: 'F-002470',
    status: 'Anulado',
    lines: [
      { account: '1305 · Clientes nacionales', description: 'Reverso factura', debit: 0, credit: 620_000 },
      { account: '4135 · Comercio al por mayor', description: 'Reverso ingreso', debit: 620_000, credit: 0 },
    ],
  },
]

export function entryTotals(lines: JournalLine[]): { debit: number; credit: number; diff: number } {
  const debit = lines.reduce((s, l) => s + l.debit, 0)
  const credit = lines.reduce((s, l) => s + l.credit, 0)
  return { debit, credit, diff: debit - credit }
}

/* -------------------------------------------------------------------------- */
/*  Libro mayor                                                               */
/* -------------------------------------------------------------------------- */

export interface LedgerMovement {
  date: string
  entry: string
  description: string
  debit: number
  credit: number
  balance: number
}

export interface LedgerAccount {
  code: string
  name: string
  nature: AccountNature
  opening: number
  movements: LedgerMovement[]
  closing: number
}

export const ledgerAccounts: LedgerAccount[] = [
  {
    code: '1110',
    name: 'Bancos',
    nature: 'Débito',
    opening: 30_100_000,
    closing: 29_780_000,
    movements: [
      { date: '18/09/2026', entry: 'CG-000089', description: 'Pago servicios públicos', debit: 0, credit: 1_180_000, balance: 28_920_000 },
      { date: '19/09/2026', entry: 'CG-000090', description: 'Pago nómina quincena', debit: 0, credit: 5_480_000, balance: 23_440_000 },
      { date: '20/09/2026', entry: 'CD-000481', description: 'Recaudo cliente El Progreso', debit: 2_640_000, credit: 0, balance: 26_080_000 },
      { date: '21/09/2026', entry: 'CE-000311', description: 'Pago proveedor', debit: 0, credit: 3_480_000, balance: 22_600_000 },
      { date: '22/09/2026', entry: 'CD-000483', description: 'Consignación ventas del día', debit: 7_180_000, credit: 0, balance: 29_780_000 },
    ],
  },
  {
    code: '1305',
    name: 'Clientes nacionales',
    nature: 'Débito',
    opening: 17_330_000,
    closing: 15_310_000,
    movements: [
      { date: '18/09/2026', entry: 'F-002478', description: 'Venta a crédito', debit: 2_150_000, credit: 0, balance: 19_480_000 },
      { date: '20/09/2026', entry: 'CD-000481', description: 'Abono factura F-002310', debit: 0, credit: 2_640_000, balance: 16_840_000 },
      { date: '22/09/2026', entry: 'RC-1210', description: 'Recaudo Caribe Group', debit: 0, credit: 1_530_000, balance: 15_310_000 },
    ],
  },
  {
    code: '2205',
    name: 'Proveedores nacionales',
    nature: 'Crédito',
    opening: 9_750_000,
    closing: 11_470_000,
    movements: [
      { date: '20/09/2026', entry: 'CC-000198', description: 'Compra de mercancía', debit: 0, credit: 5_200_000, balance: 14_950_000 },
      { date: '21/09/2026', entry: 'CE-000311', description: 'Pago factura FC-8842', debit: 3_480_000, credit: 0, balance: 11_470_000 },
    ],
  },
  {
    code: '4135',
    name: 'Comercio al por mayor',
    nature: 'Crédito',
    opening: 42_500_000,
    closing: 44_120_000,
    movements: [
      { date: '20/09/2026', entry: 'CD-000481', description: 'Ventas del día', debit: 0, credit: 2_240_000, balance: 44_740_000 },
      { date: '22/09/2026', entry: 'CD-000482', description: 'Venta factura F-002481', debit: 620_000, credit: 0, balance: 44_120_000 },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/*  Balance de comprobación                                                   */
/* -------------------------------------------------------------------------- */

export interface TrialRow {
  code: string
  name: string
  debitMov: number
  creditMov: number
  debitBal: number
  creditBal: number
}

// Curated so both the movement columns and the balance columns tie out exactly:
// movimientos débito = movimientos crédito = 164.840.000 and
// saldos débito = saldos crédito = 240.420.000.
export const trialBalance: TrialRow[] = [
  { code: '1105', name: 'Caja general', debitMov: 12_480_000, creditMov: 7_660_000, debitBal: 4_820_000, creditBal: 0 },
  { code: '1110', name: 'Bancos', debitMov: 41_820_000, creditMov: 43_440_000, debitBal: 29_780_000, creditBal: 0 },
  { code: '1305', name: 'Clientes nacionales', debitMov: 8_640_000, creditMov: 6_620_000, debitBal: 15_310_000, creditBal: 0 },
  { code: '1435', name: 'Mercancías no fabricadas', debitMov: 32_180_000, creditMov: 26_480_000, debitBal: 84_150_000, creditBal: 0 },
  { code: '1524', name: 'Equipo de oficina', debitMov: 0, creditMov: 0, debitBal: 18_640_000, creditBal: 0 },
  { code: '1540', name: 'Flota y equipo de transporte', debitMov: 0, creditMov: 0, debitBal: 43_780_000, creditBal: 0 },
  { code: '5105', name: 'Gastos de personal', debitMov: 12_640_000, creditMov: 0, debitBal: 12_640_000, creditBal: 0 },
  { code: '5135', name: 'Servicios', debitMov: 4_820_000, creditMov: 0, debitBal: 4_820_000, creditBal: 0 },
  { code: '6135', name: 'Costo de mercancía vendida', debitMov: 26_480_000, creditMov: 0, debitBal: 26_480_000, creditBal: 0 },
  { code: '2205', name: 'Proveedores nacionales', debitMov: 18_240_000, creditMov: 19_960_000, debitBal: 0, creditBal: 11_470_000 },
  { code: '2365', name: 'Retención en la fuente', debitMov: 0, creditMov: 3_240_000, debitBal: 0, creditBal: 3_240_000 },
  { code: '2408', name: 'IVA por pagar', debitMov: 2_100_000, creditMov: 8_280_000, debitBal: 0, creditBal: 6_180_000 },
  { code: '2505', name: 'Obligaciones financieras', debitMov: 4_200_000, creditMov: 0, debitBal: 0, creditBal: 57_750_000 },
  { code: '3115', name: 'Aportes sociales', debitMov: 0, creditMov: 0, debitBal: 0, creditBal: 90_000_000 },
  { code: '3705', name: 'Resultados de ejercicios anteriores', debitMov: 0, creditMov: 0, debitBal: 0, creditBal: 23_860_000 },
  { code: '4135', name: 'Comercio al por mayor', debitMov: 1_240_000, creditMov: 45_360_000, debitBal: 0, creditBal: 44_120_000 },
  { code: '4210', name: 'Ingresos financieros', debitMov: 0, creditMov: 3_800_000, debitBal: 0, creditBal: 3_800_000 },
]

/* -------------------------------------------------------------------------- */
/*  Cartera (CxC / CxP)                                                       */
/* -------------------------------------------------------------------------- */

export type AgingStatus = 'Vigente' | 'Vencida' | 'Pagada'

export interface AgingDoc {
  id: string
  party: string
  document: string
  date: string
  due: string
  total: number
  balance: number
  status: AgingStatus
}

export const agingStatusVariant: Record<AgingStatus, 'success' | 'warning' | 'danger'> = {
  Vigente: 'warning',
  Vencida: 'danger',
  Pagada: 'success',
}

export const receivables: AgingDoc[] = [
  { id: 'r1', party: 'Hotelería Caribe Group', document: 'F-002310', date: '02/09/2026', due: '02/10/2026', total: 6_880_000, balance: 6_880_000, status: 'Vigente' },
  { id: 'r2', party: 'Distribuidora El Progreso', document: 'F-002288', date: '18/08/2026', due: '17/09/2026', total: 5_430_000, balance: 3_240_000, status: 'Vencida' },
  { id: 'r3', party: 'Supermercado La Economía', document: 'F-002301', date: '28/08/2026', due: '27/09/2026', total: 4_120_000, balance: 4_120_000, status: 'Vigente' },
  { id: 'r4', party: 'Restaurante La Brasa Dorada', document: 'F-002265', date: '05/08/2026', due: '04/09/2026', total: 3_380_000, balance: 1_070_000, status: 'Vencida' },
  { id: 'r5', party: 'Cafetería Central', document: 'F-002340', date: '15/09/2026', due: '15/10/2026', total: 2_610_000, balance: 0, status: 'Pagada' },
]

export const payables: AgingDoc[] = [
  { id: 'p1', party: 'Alimentos del Valle S.A.', document: 'FC-8851', date: '20/09/2026', due: '20/10/2026', total: 5_200_000, balance: 5_200_000, status: 'Vigente' },
  { id: 'p2', party: 'Distribuidora Nacional', document: 'FC-8790', date: '14/08/2026', due: '13/09/2026', total: 4_100_000, balance: 2_100_000, status: 'Vencida' },
  { id: 'p3', party: 'Lácteos La Pradera', document: 'FC-8820', date: '30/08/2026', due: '29/09/2026', total: 2_640_000, balance: 2_640_000, status: 'Vigente' },
  { id: 'p4', party: 'Café de Origen Ltda.', document: 'FC-8760', date: '01/08/2026', due: '31/08/2026', total: 1_530_000, balance: 1_530_000, status: 'Vencida' },
  { id: 'p5', party: 'Empaques y Más', document: 'FC-8845', date: '18/09/2026', due: '18/10/2026', total: 980_000, balance: 0, status: 'Pagada' },
]

/* -------------------------------------------------------------------------- */
/*  Ingresos / Gastos                                                         */
/* -------------------------------------------------------------------------- */

export interface CategoryRow {
  account: string
  category: string
  amount: number
  share: number
}

export const incomeRows: CategoryRow[] = [
  { account: '4135', category: 'Comercio al por mayor', amount: 38_120_000, share: 79.5 },
  { account: '4145', category: 'Comercio al por menor', amount: 6_000_000, share: 12.5 },
  { account: '4210', category: 'Ingresos financieros', amount: 3_800_000, share: 7.9 },
]

export const incomeChart: ChartSpec = {
  kind: 'pie',
  title: 'Composición de ingresos',
  format: 'currency',
  data: incomeRows.map((r) => ({ label: r.category, value: r.amount })),
}

export const expenseRows: CategoryRow[] = [
  { account: '5105', category: 'Gastos de personal', amount: 12_640_000, share: 44.1 },
  { account: '6135', category: 'Costo de mercancía vendida', amount: 8_620_000, share: 30.1 },
  { account: '5135', category: 'Servicios', amount: 4_820_000, share: 16.8 },
  { account: '5160', category: 'Depreciaciones', amount: 2_400_000, share: 8.4 },
  { account: '5140', category: 'Gastos legales', amount: 160_000, share: 0.6 },
]

export const expenseChart: ChartSpec = {
  kind: 'bar',
  title: 'Gastos por categoría',
  format: 'currency',
  colorful: true,
  data: expenseRows.map((r) => ({ label: r.category.split(' ').slice(0, 2).join(' '), value: r.amount })),
}

/* -------------------------------------------------------------------------- */
/*  Impuestos                                                                 */
/* -------------------------------------------------------------------------- */

export type TaxStatus = 'Por declarar' | 'Declarado' | 'Pagado'

export interface TaxRow {
  id: string
  name: string
  period: string
  base: number
  rate: string
  value: number
  due: string
  status: TaxStatus
}

export const taxStatusVariant: Record<TaxStatus, 'warning' | 'primary' | 'success'> = {
  'Por declarar': 'warning',
  Declarado: 'primary',
  Pagado: 'success',
}

export const taxes: TaxRow[] = [
  { id: 't1', name: 'IVA', period: 'Sep 2026', base: 44_120_000, rate: '19%', value: 6_180_000, due: '18/10/2026', status: 'Por declarar' },
  { id: 't2', name: 'Retención en la fuente', period: 'Sep 2026', base: 32_400_000, rate: '2.5%', value: 3_240_000, due: '15/10/2026', status: 'Por declarar' },
  { id: 't3', name: 'ICA', period: 'Sep 2026', base: 44_120_000, rate: '4.14 x mil', value: 1_827_000, due: '20/10/2026', status: 'Declarado' },
  { id: 't4', name: 'IVA', period: 'Ago 2026', base: 41_300_000, rate: '19%', value: 5_640_000, due: '18/09/2026', status: 'Pagado' },
  { id: 't5', name: 'Retención en la fuente', period: 'Ago 2026', base: 30_100_000, rate: '2.5%', value: 2_980_000, due: '15/09/2026', status: 'Pagado' },
]

/* -------------------------------------------------------------------------- */
/*  Cierres contables                                                         */
/* -------------------------------------------------------------------------- */

export type ClosingStatus = 'Cerrado' | 'En proceso' | 'Abierto'

export interface ClosingRow {
  id: string
  period: string
  type: 'Mensual' | 'Anual'
  date: string
  user: string
  result: number
  status: ClosingStatus
}

export const closingStatusVariant: Record<ClosingStatus, 'success' | 'warning' | 'neutral'> = {
  Cerrado: 'success',
  'En proceso': 'warning',
  Abierto: 'neutral',
}

export const closings: ClosingRow[] = [
  { id: 'c1', period: 'Septiembre 2026', type: 'Mensual', date: '—', user: '—', result: 19_280_000, status: 'Abierto' },
  { id: 'c2', period: 'Agosto 2026', type: 'Mensual', date: '03/09/2026', user: 'Laura Martínez', result: 18_300_000, status: 'Cerrado' },
  { id: 'c3', period: 'Julio 2026', type: 'Mensual', date: '04/08/2026', user: 'Laura Martínez', result: 15_900_000, status: 'Cerrado' },
  { id: 'c4', period: 'Junio 2026', type: 'Mensual', date: '05/07/2026', user: 'Andrés Gómez', result: 17_100_000, status: 'Cerrado' },
  { id: 'c5', period: 'Año 2025', type: 'Anual', date: '31/01/2026', user: 'Laura Martínez', result: 168_400_000, status: 'Cerrado' },
]

/* -------------------------------------------------------------------------- */
/*  Reportes contables (estados financieros)                                  */
/* -------------------------------------------------------------------------- */

export interface ReportStat {
  label: string
  value: string
  tone?: 'default' | 'success' | 'danger' | 'warning' | 'primary'
}

export interface ReportColumn {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
  format?: ColumnFormat
}

export interface ContableReport {
  id: string
  label: string
  icon: LucideIcon
  title: string
  description: string
  stats: ReportStat[]
  charts: ChartSpec[]
  columns: ReportColumn[]
  rows: Record<string, string | number>[]
}

export const contableReports: ContableReport[] = [
  {
    id: 'estado-resultados',
    label: 'Estado de resultados',
    icon: BarChart3,
    title: 'Estado de resultados',
    description: 'Resultado del ejercicio acumulado a septiembre de 2026.',
    stats: [
      { label: 'Ingresos', value: formatCurrency(47_920_000), tone: 'primary' },
      { label: 'Costos y gastos', value: formatCurrency(28_640_000) },
      { label: 'Utilidad neta', value: formatCurrency(19_280_000), tone: 'success' },
      { label: 'Margen neto', value: '40.2%', tone: 'success' },
    ],
    charts: [],
    columns: [
      { key: 'concepto', label: 'Concepto' },
      { key: 'valor', label: 'Valor', align: 'right', format: 'currency' },
    ],
    rows: [
      { concepto: 'Ingresos operacionales', valor: 44_120_000 },
      { concepto: '(−) Costo de ventas', valor: -26_480_000 },
      { concepto: 'Utilidad bruta', valor: 17_640_000 },
      { concepto: '(−) Gastos de administración', valor: -6_160_000 },
      { concepto: '(−) Gastos de personal', valor: -12_640_000 },
      { concepto: '(+) Ingresos financieros', valor: 3_800_000 },
      { concepto: 'Utilidad operacional', valor: 2_440_000 },
      { concepto: 'Utilidad neta del ejercicio', valor: 19_280_000 },
    ],
  },
  {
    id: 'balance-general',
    label: 'Balance general',
    icon: Scale,
    title: 'Balance general',
    description: 'Estado de situación financiera a 30 de septiembre de 2026.',
    stats: [
      { label: 'Activos', value: formatCurrency(212_480_000), tone: 'primary' },
      { label: 'Pasivos', value: formatCurrency(78_640_000), tone: 'warning' },
      { label: 'Patrimonio', value: formatCurrency(133_840_000), tone: 'success' },
      { label: 'Ecuación', value: 'Balanceado', tone: 'success' },
    ],
    charts: [],
    columns: [
      { key: 'cuenta', label: 'Cuenta' },
      { key: 'grupo', label: 'Grupo' },
      { key: 'valor', label: 'Valor', align: 'right', format: 'currency' },
    ],
    rows: [
      { cuenta: 'Disponible', grupo: 'Activo', valor: 34_600_000 },
      { cuenta: 'Cartera de clientes', grupo: 'Activo', valor: 15_310_000 },
      { cuenta: 'Inventarios', grupo: 'Activo', valor: 84_150_000 },
      { cuenta: 'Propiedad, planta y equipo', grupo: 'Activo', valor: 62_420_000 },
      { cuenta: 'Otros activos', grupo: 'Activo', valor: 16_000_000 },
      { cuenta: 'Obligaciones financieras', grupo: 'Pasivo', valor: 57_750_000 },
      { cuenta: 'Proveedores', grupo: 'Pasivo', valor: 11_470_000 },
      { cuenta: 'Impuestos por pagar', grupo: 'Pasivo', valor: 9_420_000 },
      { cuenta: 'Aportes sociales', grupo: 'Patrimonio', valor: 90_000_000 },
      { cuenta: 'Utilidad del ejercicio', grupo: 'Patrimonio', valor: 19_280_000 },
    ],
  },
  {
    id: 'flujo-efectivo',
    label: 'Flujo de efectivo',
    icon: TrendingDown,
    title: 'Flujo de efectivo',
    description: 'Movimiento de efectivo por actividad — septiembre 2026.',
    stats: [
      { label: 'Saldo inicial', value: formatCurrency(30_100_000) },
      { label: 'Flujo operación', value: formatCurrency(9_460_000), tone: 'success' },
      { label: 'Flujo inversión', value: formatCurrency(-6_400_000), tone: 'danger' },
      { label: 'Saldo final', value: formatCurrency(34_600_000), tone: 'primary' },
    ],
    charts: [],
    columns: [
      { key: 'actividad', label: 'Actividad' },
      { key: 'entradas', label: 'Entradas', align: 'right', format: 'currency' },
      { key: 'salidas', label: 'Salidas', align: 'right', format: 'currency' },
      { key: 'neto', label: 'Neto', align: 'right', format: 'currency' },
    ],
    rows: [
      { actividad: 'Actividades de operación', entradas: 52_180_000, salidas: 42_720_000, neto: 9_460_000 },
      { actividad: 'Actividades de inversión', entradas: 0, salidas: 6_400_000, neto: -6_400_000 },
      { actividad: 'Actividades de financiación', entradas: 5_000_000, salidas: 3_560_000, neto: 1_440_000 },
      { actividad: 'Variación neta de efectivo', entradas: 57_180_000, salidas: 52_680_000, neto: 4_500_000 },
    ],
  },
]

export const contableReportById: Record<string, ContableReport> = Object.fromEntries(
  contableReports.map((r) => [r.id, r]),
)
