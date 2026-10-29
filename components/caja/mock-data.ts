export type MovementType =
  | 'venta'
  | 'ingreso'
  | 'egreso'
  | 'devolucion'
  | 'retiro'
  | 'ajuste'

export type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Otro'

export interface CashMovement {
  id: string
  time: string
  type: MovementType
  concept: string
  reference: string
  method: PaymentMethod
  user: string
  /** Signed value: positive adds to the drawer, negative removes. */
  value: number
}

export interface CajaSession {
  id: string
  register: string
  branch: string
  user: string
  openedAt: string
  openingBalance: number
}

export type ClosingStatus = 'cuadrada' | 'sobrante' | 'faltante'

export interface ClosingRecord {
  id: string
  date: string
  register: string
  branch: string
  user: string
  openingBalance: number
  sales: number
  income: number
  expense: number
  refunds: number
  expected: number
  counted: number
  difference: number
  status: ClosingStatus
}

export const registers = ['Caja #001', 'Caja #002', 'Caja #003']
export const branches = ['Sede Principal', 'Sucursal Norte', 'Sucursal Sur', 'Sucursal Centro']
export const users = ['Laura Martínez', 'Carlos Gómez', 'Valentina Cruz', 'Andrés Peña']

export const movementTypeLabel: Record<MovementType, string> = {
  venta: 'Venta',
  ingreso: 'Ingreso',
  egreso: 'Egreso',
  devolucion: 'Devolución',
  retiro: 'Retiro',
  ajuste: 'Ajuste',
}

export const movementTypeVariant: Record<
  MovementType,
  'success' | 'primary' | 'danger' | 'warning' | 'neutral'
> = {
  venta: 'success',
  ingreso: 'primary',
  egreso: 'danger',
  devolucion: 'warning',
  retiro: 'danger',
  ajuste: 'neutral',
}

export const paymentMethods: PaymentMethod[] = ['Efectivo', 'Tarjeta', 'Transferencia', 'Otro']

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatSignedCurrency(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${formatCurrency(Math.abs(value))}`
}

/** The register that is currently open in the demo. */
export const currentSession: CajaSession = {
  id: 'sess-001',
  register: 'Caja #001',
  branch: 'Sede Principal',
  user: 'Laura Martínez',
  openedAt: '2026-09-22 08:00',
  openingBalance: 300000,
}

export const seedMovements: CashMovement[] = [
  { id: 'm1', time: '08:12', type: 'venta', concept: 'Venta de contado', reference: 'VT-10245', method: 'Efectivo', user: 'Laura Martínez', value: 84000 },
  { id: 'm2', time: '08:31', type: 'venta', concept: 'Venta de contado', reference: 'VT-10246', method: 'Tarjeta', user: 'Laura Martínez', value: 152000 },
  { id: 'm3', time: '09:05', type: 'ingreso', concept: 'Aporte de base adicional', reference: 'ING-3021', method: 'Efectivo', user: 'Andrés Peña', value: 200000 },
  { id: 'm4', time: '09:44', type: 'venta', concept: 'Venta de contado', reference: 'VT-10247', method: 'Efectivo', user: 'Laura Martínez', value: 46500 },
  { id: 'm5', time: '10:18', type: 'egreso', concept: 'Pago de domicilio', reference: 'EG-1188', method: 'Efectivo', user: 'Laura Martínez', value: -35000 },
  { id: 'm6', time: '10:52', type: 'venta', concept: 'Venta de contado', reference: 'VT-10248', method: 'Transferencia', user: 'Carlos Gómez', value: 320000 },
  { id: 'm7', time: '11:20', type: 'devolucion', concept: 'Devolución producto dañado', reference: 'DV-5044', method: 'Efectivo', user: 'Laura Martínez', value: -28000 },
  { id: 'm8', time: '11:58', type: 'venta', concept: 'Venta de contado', reference: 'VT-10249', method: 'Efectivo', user: 'Laura Martínez', value: 119000 },
  { id: 'm9', time: '12:35', type: 'retiro', concept: 'Retiro parcial a caja fuerte', reference: 'RT-0071', method: 'Efectivo', user: 'Andrés Peña', value: -250000 },
  { id: 'm10', time: '13:10', type: 'venta', concept: 'Venta de contado', reference: 'VT-10250', method: 'Tarjeta', user: 'Valentina Cruz', value: 76000 },
  { id: 'm11', time: '13:47', type: 'venta', concept: 'Venta de contado', reference: 'VT-10251', method: 'Efectivo', user: 'Laura Martínez', value: 54000 },
  { id: 'm12', time: '14:22', type: 'ajuste', concept: 'Ajuste por redondeo', reference: 'AJ-0310', method: 'Efectivo', user: 'Laura Martínez', value: -1200 },
]

export interface CajaSummary {
  openingBalance: number
  sales: number
  income: number
  expense: number
  refunds: number
  cashExpected: number
  totalMovements: number
}

/** Aggregate a session's movements into the KPI figures. */
export function computeSummary(
  session: CajaSession,
  movements: CashMovement[],
): CajaSummary {
  let sales = 0
  let income = 0
  let expense = 0
  let refunds = 0
  let cashDelta = 0

  for (const m of movements) {
    if (m.type === 'venta') sales += m.value
    else if (m.type === 'ingreso') income += m.value
    else if (m.type === 'egreso' || m.type === 'retiro') expense += Math.abs(m.value)
    else if (m.type === 'devolucion') refunds += Math.abs(m.value)

    if (m.method === 'Efectivo') cashDelta += m.value
  }

  return {
    openingBalance: session.openingBalance,
    sales,
    income,
    expense,
    refunds,
    cashExpected: session.openingBalance + cashDelta,
    totalMovements: movements.length,
  }
}

export function closingStatusFromDiff(diff: number): ClosingStatus {
  if (diff > 0) return 'sobrante'
  if (diff < 0) return 'faltante'
  return 'cuadrada'
}

export const closingStatusLabel: Record<ClosingStatus, string> = {
  cuadrada: 'Cuadra',
  sobrante: 'Sobrante',
  faltante: 'Faltante',
}

export const closingStatusVariant: Record<ClosingStatus, 'success' | 'warning' | 'danger'> = {
  cuadrada: 'success',
  sobrante: 'warning',
  faltante: 'danger',
}

export const closingHistory: ClosingRecord[] = [
  { id: 'c1', date: '2026-09-21', register: 'Caja #001', branch: 'Sede Principal', user: 'Laura Martínez', openingBalance: 300000, sales: 2840000, income: 150000, expense: 120000, refunds: 42000, expected: 1985000, counted: 1985000, difference: 0, status: 'cuadrada' },
  { id: 'c2', date: '2026-09-20', register: 'Caja #002', branch: 'Sucursal Norte', user: 'Carlos Gómez', openingBalance: 250000, sales: 1960000, income: 0, expense: 80000, refunds: 15000, expected: 1420000, counted: 1435000, difference: 15000, status: 'sobrante' },
  { id: 'c3', date: '2026-09-20', register: 'Caja #001', branch: 'Sede Principal', user: 'Valentina Cruz', openingBalance: 300000, sales: 3120000, income: 100000, expense: 210000, refunds: 60000, expected: 2140000, counted: 2118500, difference: -21500, status: 'faltante' },
  { id: 'c4', date: '2026-09-19', register: 'Caja #003', branch: 'Sucursal Sur', user: 'Andrés Peña', openingBalance: 200000, sales: 1450000, income: 50000, expense: 60000, refunds: 0, expected: 1180000, counted: 1180000, difference: 0, status: 'cuadrada' },
  { id: 'c5', date: '2026-09-19', register: 'Caja #001', branch: 'Sede Principal', user: 'Laura Martínez', openingBalance: 300000, sales: 2680000, income: 0, expense: 95000, refunds: 33000, expected: 1902000, counted: 1894000, difference: -8000, status: 'faltante' },
  { id: 'c6', date: '2026-09-18', register: 'Caja #002', branch: 'Sucursal Norte', user: 'Carlos Gómez', openingBalance: 250000, sales: 2210000, income: 70000, expense: 40000, refunds: 20000, expected: 1670000, counted: 1682000, difference: 12000, status: 'sobrante' },
]
