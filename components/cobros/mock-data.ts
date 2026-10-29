export type ReceivableStatus = 'pendiente' | 'parcial' | 'pagada' | 'vencida' | 'anulada'
export type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Cheque' | 'Otro'
export type DocumentType = 'NIT' | 'CC' | 'CE' | 'RUT' | 'PAS'

/** "Today" anchor for the module so aging is deterministic. */
export const TODAY = '2026-09-22'
export const MONTH_PREFIX = '2026-09'

export interface Payment {
  id: string
  date: string
  method: PaymentMethod
  amount: number
  reference: string
  notes: string
  receivedBy: string
}

export interface Receivable {
  id: string
  invoice: string
  customerId: string
  customerName: string
  documentType: DocumentType
  document: string
  email: string
  phone: string
  city: string
  issueDate: string
  dueDate: string
  total: number
  payments: Payment[]
  /** Manually anulada flag (overrides computed status). */
  voided?: boolean
}

/* -------------------------------------------------------------------------- */
/*  Labels & variants                                                         */
/* -------------------------------------------------------------------------- */

export const statusLabel: Record<ReceivableStatus, string> = {
  pendiente: 'Pendiente',
  parcial: 'Parcial',
  pagada: 'Pagada',
  vencida: 'Vencida',
  anulada: 'Anulada',
}

export const statusVariant: Record<
  ReceivableStatus,
  'success' | 'warning' | 'danger' | 'neutral' | 'primary'
> = {
  pendiente: 'warning',
  parcial: 'primary',
  pagada: 'success',
  vencida: 'danger',
  anulada: 'neutral',
}

/* -------------------------------------------------------------------------- */
/*  Money helpers                                                             */
/* -------------------------------------------------------------------------- */

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function paidAmount(r: Receivable): number {
  return r.payments.reduce((sum, p) => sum + p.amount, 0)
}

export function balance(r: Receivable): number {
  return Math.max(0, r.total - paidAmount(r))
}

/** Whole days between `TODAY` and the due date; positive = overdue. */
export function daysOverdue(r: Receivable, today: string = TODAY): number {
  const due = new Date(r.dueDate + 'T00:00:00')
  const now = new Date(today + 'T00:00:00')
  const diff = Math.round((now.getTime() - due.getTime()) / 86_400_000)
  return diff
}

export function statusOf(r: Receivable, today: string = TODAY): ReceivableStatus {
  if (r.voided) return 'anulada'
  const bal = balance(r)
  const paid = paidAmount(r)
  if (bal <= 0) return 'pagada'
  if (daysOverdue(r, today) > 0) return 'vencida'
  if (paid > 0) return 'parcial'
  return 'pendiente'
}

/* -------------------------------------------------------------------------- */
/*  Aging buckets                                                             */
/* -------------------------------------------------------------------------- */

export type AgingBucketKey = 'b0_30' | 'b31_60' | 'b61_90' | 'b90_plus' | 'current'

export interface AgingBucket {
  key: Exclude<AgingBucketKey, 'current'>
  label: string
  amount: number
}

/** Classify by overdue days: only outstanding, non-void receivables count. */
export function agingBucketOf(r: Receivable): AgingBucketKey {
  const od = daysOverdue(r)
  if (od <= 0) return 'current'
  if (od <= 30) return 'b0_30'
  if (od <= 60) return 'b31_60'
  if (od <= 90) return 'b61_90'
  return 'b90_plus'
}

export function computeAging(list: Receivable[]): AgingBucket[] {
  const buckets: Record<Exclude<AgingBucketKey, 'current'>, number> = {
    b0_30: 0,
    b31_60: 0,
    b61_90: 0,
    b90_plus: 0,
  }
  for (const r of list) {
    if (r.voided) continue
    const bal = balance(r)
    if (bal <= 0) continue
    const key = agingBucketOf(r)
    if (key === 'current') continue
    buckets[key] += bal
  }
  return [
    { key: 'b0_30', label: '0–30 días', amount: buckets.b0_30 },
    { key: 'b31_60', label: '31–60 días', amount: buckets.b31_60 },
    { key: 'b61_90', label: '61–90 días', amount: buckets.b61_90 },
    { key: 'b90_plus', label: '+90 días', amount: buckets.b90_plus },
  ]
}

/* -------------------------------------------------------------------------- */
/*  Summary / KPIs                                                            */
/* -------------------------------------------------------------------------- */

export interface CarteraSummary {
  total: number // outstanding balance (not overdue yet)
  porVencer: number
  vencida: number
  cobradoHoy: number
  cobradoMes: number
}

export function getSummary(list: Receivable[], today: string = TODAY): CarteraSummary {
  let total = 0
  let porVencer = 0
  let vencida = 0
  let cobradoHoy = 0
  let cobradoMes = 0
  for (const r of list) {
    if (!r.voided) {
      const bal = balance(r)
      total += bal
      if (bal > 0) {
        if (daysOverdue(r, today) > 0) vencida += bal
        else porVencer += bal
      }
    }
    for (const p of r.payments) {
      if (p.date === today) cobradoHoy += p.amount
      if (p.date.startsWith(MONTH_PREFIX)) cobradoMes += p.amount
    }
  }
  return { total, porVencer, vencida, cobradoHoy, cobradoMes }
}

/* -------------------------------------------------------------------------- */
/*  Customer roll-up (for the cartera profile)                                */
/* -------------------------------------------------------------------------- */

export interface CustomerCartera {
  customerId: string
  customerName: string
  documentType: DocumentType
  document: string
  email: string
  phone: string
  city: string
  totalInvoiced: number
  totalPaid: number
  balance: number
  overdue: number
  lastPayment: Payment | null
  receivables: Receivable[]
  payments: Payment[]
}

export function customerCartera(list: Receivable[], customerId: string): CustomerCartera | null {
  const rows = list.filter((r) => r.customerId === customerId)
  if (rows.length === 0) return null
  const first = rows[0]
  let totalInvoiced = 0
  let totalPaid = 0
  let bal = 0
  let overdue = 0
  const payments: Payment[] = []
  for (const r of rows) {
    if (r.voided) continue
    totalInvoiced += r.total
    totalPaid += paidAmount(r)
    const b = balance(r)
    bal += b
    if (b > 0 && daysOverdue(r) > 0) overdue += b
    for (const p of r.payments) payments.push(p)
  }
  payments.sort((a, b) => (a.date < b.date ? 1 : -1))
  return {
    customerId,
    customerName: first.customerName,
    documentType: first.documentType,
    document: first.document,
    email: first.email,
    phone: first.phone,
    city: first.city,
    totalInvoiced,
    totalPaid,
    balance: bal,
    overdue,
    lastPayment: payments[0] ?? null,
    receivables: rows,
    payments,
  }
}

export const paymentMethods: PaymentMethod[] = [
  'Efectivo',
  'Tarjeta',
  'Transferencia',
  'Cheque',
  'Otro',
]

export const collectors = ['Laura Martínez', 'Andrés Gómez', 'Carolina Ruiz', 'Felipe Torres']

/* -------------------------------------------------------------------------- */
/*  Seed receivables                                                          */
/* -------------------------------------------------------------------------- */

export const receivables: Receivable[] = [
  {
    id: 'ar-1',
    invoice: 'FE-1042',
    customerId: 'c-progreso',
    customerName: 'Distribuidora El Progreso S.A.S',
    documentType: 'NIT',
    document: '900.123.456-1',
    email: 'compras@elprogreso.com',
    phone: '310 456 7788',
    city: 'Bogotá',
    issueDate: '2026-09-02',
    dueDate: '2026-10-02',
    total: 2_450_000,
    payments: [
      {
        id: 'p-1',
        date: '2026-09-15',
        method: 'Transferencia',
        amount: 1_000_000,
        reference: 'TRF-88213',
        notes: 'Abono parcial acordado.',
        receivedBy: 'Laura Martínez',
      },
    ],
  },
  {
    id: 'ar-2',
    invoice: 'FE-1046',
    customerId: 'c-brasa',
    customerName: 'Restaurante La Brasa Dorada',
    documentType: 'NIT',
    document: '811.445.667-8',
    email: 'contabilidad@labrasa.com',
    phone: '604 312 7788',
    city: 'Medellín',
    issueDate: '2026-08-10',
    dueDate: '2026-09-09',
    total: 1_280_000,
    payments: [],
  },
  {
    id: 'ar-3',
    invoice: 'FE-1044',
    customerId: 'c-caribe',
    customerName: 'Hotelería Caribe Group',
    documentType: 'NIT',
    document: '830.998.112-3',
    email: 'admin@caribegroup.co',
    phone: '605 331 7788',
    city: 'Cartagena',
    issueDate: '2026-09-11',
    dueDate: '2026-10-11',
    total: 4_120_000,
    payments: [
      {
        id: 'p-2',
        date: '2026-09-18',
        method: 'Transferencia',
        amount: 2_000_000,
        reference: 'TRF-90881',
        notes: '',
        receivedBy: 'Carolina Ruiz',
      },
      {
        id: 'p-3',
        date: '2026-09-22',
        method: 'Tarjeta',
        amount: 620_000,
        reference: 'APR-556677',
        notes: 'Abono con datáfono.',
        receivedBy: 'Carolina Ruiz',
      },
    ],
  },
  {
    id: 'ar-4',
    invoice: 'FE-1030',
    customerId: 'c-economia',
    customerName: 'Supermercado La Economía',
    documentType: 'NIT',
    document: '900.778.334-6',
    email: 'compras@laeconomia.com',
    phone: '605 660 2211',
    city: 'Barranquilla',
    issueDate: '2026-06-15',
    dueDate: '2026-07-15',
    total: 3_600_000,
    payments: [
      {
        id: 'p-4',
        date: '2026-08-01',
        method: 'Transferencia',
        amount: 600_000,
        reference: 'TRF-55120',
        notes: 'Abono parcial.',
        receivedBy: 'Felipe Torres',
      },
    ],
  },
  {
    id: 'ar-5',
    invoice: 'FE-1047',
    customerId: 'c-central',
    customerName: 'Cafetería Central',
    documentType: 'NIT',
    document: '901.556.223-4',
    email: 'pedidos@cafeteriacentral.co',
    phone: '601 770 8899',
    city: 'Bogotá',
    issueDate: '2026-09-20',
    dueDate: '2026-10-20',
    total: 540_000,
    payments: [],
  },
  {
    id: 'ar-6',
    invoice: 'FE-1015',
    customerId: 'c-trigal',
    customerName: 'Panadería El Trigal',
    documentType: 'NIT',
    document: '812.334.778-1',
    email: 'gerencia@eltrigal.co',
    phone: '606 445 1230',
    city: 'Pereira',
    issueDate: '2026-05-28',
    dueDate: '2026-06-27',
    total: 1_950_000,
    payments: [
      {
        id: 'p-5',
        date: '2026-07-10',
        method: 'Efectivo',
        amount: 450_000,
        reference: 'REC-0012',
        notes: '',
        receivedBy: 'Andrés Gómez',
      },
    ],
  },
  {
    id: 'ar-7',
    invoice: 'FE-1041',
    customerId: 'c-progreso',
    customerName: 'Distribuidora El Progreso S.A.S',
    documentType: 'NIT',
    document: '900.123.456-1',
    email: 'compras@elprogreso.com',
    phone: '310 456 7788',
    city: 'Bogotá',
    issueDate: '2026-08-20',
    dueDate: '2026-09-19',
    total: 980_000,
    payments: [],
  },
  {
    id: 'ar-8',
    invoice: 'FE-1035',
    customerId: 'c-caribe',
    customerName: 'Hotelería Caribe Group',
    documentType: 'NIT',
    document: '830.998.112-3',
    email: 'admin@caribegroup.co',
    phone: '605 331 7788',
    city: 'Cartagena',
    issueDate: '2026-07-30',
    dueDate: '2026-08-29',
    total: 2_760_000,
    payments: [
      {
        id: 'p-6',
        date: '2026-09-05',
        method: 'Transferencia',
        amount: 1_760_000,
        reference: 'TRF-77340',
        notes: 'Abono parcial.',
        receivedBy: 'Carolina Ruiz',
      },
    ],
  },
  {
    id: 'ar-9',
    invoice: 'FE-1028',
    customerId: 'c-lopez',
    customerName: 'María Fernanda López',
    documentType: 'CC',
    document: '52.998.114',
    email: 'mafe.lopez@gmail.com',
    phone: '300 221 4455',
    city: 'Bogotá',
    issueDate: '2026-09-12',
    dueDate: '2026-09-27',
    total: 320_000,
    payments: [],
  },
  {
    id: 'ar-10',
    invoice: 'FE-1009',
    customerId: 'c-economia',
    customerName: 'Supermercado La Economía',
    documentType: 'NIT',
    document: '900.778.334-6',
    email: 'compras@laeconomia.com',
    phone: '605 660 2211',
    city: 'Barranquilla',
    issueDate: '2026-09-01',
    dueDate: '2026-10-01',
    total: 1_500_000,
    payments: [
      {
        id: 'p-7',
        date: '2026-09-01',
        method: 'Efectivo',
        amount: 1_500_000,
        reference: 'REC-0044',
        notes: 'Pago de contado.',
        receivedBy: 'Felipe Torres',
      },
    ],
  },
  {
    id: 'ar-11',
    invoice: 'FE-1002',
    customerId: 'c-brasa',
    customerName: 'Restaurante La Brasa Dorada',
    documentType: 'NIT',
    document: '811.445.667-8',
    email: 'contabilidad@labrasa.com',
    phone: '604 312 7788',
    city: 'Medellín',
    issueDate: '2026-04-10',
    dueDate: '2026-05-10',
    total: 2_100_000,
    payments: [
      {
        id: 'p-8',
        date: '2026-06-01',
        method: 'Transferencia',
        amount: 500_000,
        reference: 'TRF-33110',
        notes: '',
        receivedBy: 'Laura Martínez',
      },
    ],
  },
  {
    id: 'ar-12',
    invoice: 'FE-1048',
    customerId: 'c-trigal',
    customerName: 'Panadería El Trigal',
    documentType: 'NIT',
    document: '812.334.778-1',
    email: 'gerencia@eltrigal.co',
    phone: '606 445 1230',
    city: 'Pereira',
    issueDate: '2026-09-19',
    dueDate: '2026-10-19',
    total: 690_000,
    payments: [],
  },
]
