export type SupplierStatus = 'activo' | 'inactivo' | 'bloqueado' | 'moroso'
export type SupplierType = 'productos' | 'servicios' | 'materia_prima' | 'mixto'
export type PersonType = 'natural' | 'juridica'
export type DocumentType = 'NIT' | 'CC' | 'CE' | 'RUT'

export type PayableStatus = 'pendiente' | 'parcial' | 'pagada' | 'vencida' | 'anulada'

export interface Payable {
  id: string
  document: string
  date: string
  dueDate: string
  amount: number
  paid: number
  balance: number
  status: PayableStatus
}

export interface HistoryEntry {
  id: string
  date: string
  document: string
  type: 'Compra' | 'Factura' | 'Pago' | 'Nota débito' | 'Devolución'
  amount: number
  status: 'pagada' | 'pendiente' | 'vencida' | 'anulada' | 'aplicado'
}

export interface Supplier {
  id: string
  personType: PersonType
  documentType: DocumentType
  document: string
  businessName: string
  tradeName: string
  displayName: string
  contactName: string
  phone: string
  mobile: string
  email: string
  address: string
  city: string
  department: string
  type: SupplierType
  paymentTerms: string
  creditDays: number
  creditLimit: number
  status: SupplierStatus
  createdAt: string
  totalPurchases: number
  purchaseCount: number
  monthPurchases: number
  balance: number
  totalPaid: number
  lastPurchase: string
  color: string
}

export const cities = [
  'Bogotá',
  'Medellín',
  'Cali',
  'Barranquilla',
  'Cartagena',
  'Bucaramanga',
  'Pereira',
]

export const departments = [
  'Cundinamarca',
  'Antioquia',
  'Valle del Cauca',
  'Atlántico',
  'Bolívar',
  'Santander',
  'Risaralda',
]

export const paymentTermsList = [
  'Contado',
  'Crédito 15 días',
  'Crédito 30 días',
  'Crédito 45 días',
  'Crédito 60 días',
]

export const supplierTypeLabel: Record<SupplierType, string> = {
  productos: 'Productos',
  servicios: 'Servicios',
  materia_prima: 'Materia prima',
  mixto: 'Mixto',
}

export const statusLabel: Record<SupplierStatus, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  bloqueado: 'Bloqueado',
  moroso: 'Moroso',
}

export const statusVariant: Record<SupplierStatus, 'success' | 'neutral' | 'danger' | 'warning'> = {
  activo: 'success',
  inactivo: 'neutral',
  bloqueado: 'danger',
  moroso: 'warning',
}

export const payableStatusLabel: Record<PayableStatus, string> = {
  pendiente: 'Pendiente',
  parcial: 'Parcial',
  pagada: 'Pagada',
  vencida: 'Vencida',
  anulada: 'Anulada',
}

export const payableStatusVariant: Record<
  PayableStatus,
  'success' | 'warning' | 'danger' | 'neutral' | 'primary'
> = {
  pendiente: 'warning',
  parcial: 'primary',
  pagada: 'success',
  vencida: 'danger',
  anulada: 'neutral',
}

const palette = [
  '#2563eb',
  '#0d9488',
  '#7c3aed',
  '#db2777',
  '#ea580c',
  '#0891b2',
  '#4f46e5',
  '#16a34a',
]

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function supplierInitials(s: Supplier): string {
  if (s.personType === 'juridica') {
    return s.businessName
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
  }
  return s.businessName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export const suppliers: Supplier[] = [
  {
    id: 's1',
    personType: 'juridica',
    documentType: 'NIT',
    document: '900123456-1',
    businessName: 'Alimentos del Valle S.A.S',
    tradeName: 'Alivalle',
    displayName: 'Alimentos del Valle S.A.S',
    contactName: 'Jorge Restrepo',
    phone: '602 555 1020',
    mobile: '311 456 7788',
    email: 'ventas@alivalle.com',
    address: 'Zona Industrial Acopi, Bod 14',
    city: 'Cali',
    department: 'Valle del Cauca',
    type: 'productos',
    paymentTerms: 'Crédito 30 días',
    creditDays: 30,
    creditLimit: 40000000,
    status: 'activo',
    createdAt: '2023-03-14',
    totalPurchases: 214500000,
    purchaseCount: 184,
    monthPurchases: 12400000,
    balance: 8650000,
    totalPaid: 205850000,
    lastPurchase: '2026-09-20',
    color: palette[0],
  },
  {
    id: 's2',
    personType: 'juridica',
    documentType: 'NIT',
    document: '830998112-3',
    businessName: 'Distribuciones Andinas Ltda',
    tradeName: 'DisAndina',
    displayName: 'Distribuciones Andinas Ltda',
    contactName: 'Marcela Ospina',
    phone: '601 448 9900',
    mobile: '310 887 2200',
    email: 'compras@disandina.co',
    address: 'Calle 13 #68-90',
    city: 'Bogotá',
    department: 'Cundinamarca',
    type: 'mixto',
    paymentTerms: 'Crédito 45 días',
    creditDays: 45,
    creditLimit: 60000000,
    status: 'activo',
    createdAt: '2022-07-08',
    totalPurchases: 389200000,
    purchaseCount: 267,
    monthPurchases: 21800000,
    balance: 15200000,
    totalPaid: 374000000,
    lastPurchase: '2026-09-21',
    color: palette[1],
  },
  {
    id: 's3',
    personType: 'juridica',
    documentType: 'NIT',
    document: '811445667-8',
    businessName: 'Empaques y Plásticos del Norte',
    tradeName: 'Emplanorte',
    displayName: 'Empaques y Plásticos del Norte',
    contactName: 'Fernando Gil',
    phone: '604 312 7788',
    mobile: '315 220 1144',
    email: 'facturacion@emplanorte.com',
    address: 'Cra 50 #10-30, Itagüí',
    city: 'Medellín',
    department: 'Antioquia',
    type: 'materia_prima',
    paymentTerms: 'Crédito 30 días',
    creditDays: 30,
    creditLimit: 25000000,
    status: 'moroso',
    createdAt: '2023-01-25',
    totalPurchases: 96800000,
    purchaseCount: 112,
    monthPurchases: 3200000,
    balance: 11450000,
    totalPaid: 85350000,
    lastPurchase: '2026-08-05',
    color: palette[2],
  },
  {
    id: 's4',
    personType: 'natural',
    documentType: 'CC',
    document: '71998445',
    businessName: 'Transportes Rápidos JR',
    tradeName: 'JR Logística',
    displayName: 'Transportes Rápidos JR',
    contactName: 'Julián Rincón',
    phone: '605 660 2211',
    mobile: '312 445 9987',
    email: 'jr.transportes@gmail.com',
    address: 'Cra 8 #45-12',
    city: 'Barranquilla',
    department: 'Atlántico',
    type: 'servicios',
    paymentTerms: 'Contado',
    creditDays: 0,
    creditLimit: 0,
    status: 'activo',
    createdAt: '2024-05-19',
    totalPurchases: 42300000,
    purchaseCount: 78,
    monthPurchases: 4100000,
    balance: 0,
    totalPaid: 42300000,
    lastPurchase: '2026-09-19',
    color: palette[3],
  },
  {
    id: 's5',
    personType: 'juridica',
    documentType: 'NIT',
    document: '901556223-4',
    businessName: 'Tecnología y Equipos POS S.A.S',
    tradeName: 'TecPOS',
    displayName: 'Tecnología y Equipos POS S.A.S',
    contactName: 'Diana Cárdenas',
    phone: '601 770 8899',
    mobile: '300 112 3344',
    email: 'soporte@tecpos.com',
    address: 'Av. El Dorado #92-30',
    city: 'Bogotá',
    department: 'Cundinamarca',
    type: 'servicios',
    paymentTerms: 'Crédito 60 días',
    creditDays: 60,
    creditLimit: 30000000,
    status: 'activo',
    createdAt: '2022-11-30',
    totalPurchases: 78900000,
    purchaseCount: 43,
    monthPurchases: 6500000,
    balance: 5400000,
    totalPaid: 73500000,
    lastPurchase: '2026-09-18',
    color: palette[4],
  },
  {
    id: 's6',
    personType: 'juridica',
    documentType: 'NIT',
    document: '812334778-1',
    businessName: 'Lácteos San Rafael',
    tradeName: 'San Rafael',
    displayName: 'Lácteos San Rafael',
    contactName: 'Patricia Muñoz',
    phone: '606 445 1230',
    mobile: '318 774 5566',
    email: 'pedidos@lacteossanrafael.co',
    address: 'Vereda La Florida km 4',
    city: 'Pereira',
    department: 'Risaralda',
    type: 'productos',
    paymentTerms: 'Crédito 15 días',
    creditDays: 15,
    creditLimit: 18000000,
    status: 'inactivo',
    createdAt: '2023-06-12',
    totalPurchases: 54200000,
    purchaseCount: 96,
    monthPurchases: 0,
    balance: 0,
    totalPaid: 54200000,
    lastPurchase: '2026-04-10',
    color: palette[5],
  },
  {
    id: 's7',
    personType: 'juridica',
    documentType: 'NIT',
    document: '900778334-6',
    businessName: 'Suministros Industriales Caribe',
    tradeName: 'SuinCaribe',
    displayName: 'Suministros Industriales Caribe',
    contactName: 'Álvaro Barrios',
    phone: '605 331 7788',
    mobile: '316 998 1122',
    email: 'gerencia@suincaribe.com',
    address: 'Mamonal km 8, Bod 3',
    city: 'Cartagena',
    department: 'Bolívar',
    type: 'materia_prima',
    paymentTerms: 'Crédito 45 días',
    creditDays: 45,
    creditLimit: 35000000,
    status: 'bloqueado',
    createdAt: '2023-09-02',
    totalPurchases: 128600000,
    purchaseCount: 141,
    monthPurchases: 2400000,
    balance: 9800000,
    totalPaid: 118800000,
    lastPurchase: '2026-07-22',
    color: palette[6],
  },
  {
    id: 's8',
    personType: 'natural',
    documentType: 'RUT',
    document: '1098554120',
    businessName: 'Papelería y Aseo El Punto',
    tradeName: 'El Punto',
    displayName: 'Papelería y Aseo El Punto',
    contactName: 'Sandra Villalba',
    phone: '607 645 3320',
    mobile: '311 556 8899',
    email: 'elpunto.insumos@gmail.com',
    address: 'Calle 36 #22-18',
    city: 'Bucaramanga',
    department: 'Santander',
    type: 'mixto',
    paymentTerms: 'Crédito 30 días',
    creditDays: 30,
    creditLimit: 8000000,
    status: 'activo',
    createdAt: '2024-08-15',
    totalPurchases: 23400000,
    purchaseCount: 58,
    monthPurchases: 1800000,
    balance: 1350000,
    totalPaid: 22050000,
    lastPurchase: '2026-09-17',
    color: palette[7],
  },
]

export interface SupplierSummary {
  total: number
  active: number
  monthPurchases: number
  payable: number
}

export function getSupplierSummary(list: Supplier[]): SupplierSummary {
  return {
    total: list.length,
    active: list.filter((s) => s.status === 'activo').length,
    monthPurchases: list.reduce((sum, s) => sum + s.monthPurchases, 0),
    payable: list.reduce((sum, s) => sum + s.balance, 0),
  }
}

// Deterministic pseudo-random generator so mock detail stays stable per supplier.
function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

const monthsBack = (n: number) => {
  const d = new Date(2026, 8, 20)
  d.setMonth(d.getMonth() - n)
  return d.toISOString().slice(0, 10)
}

const addDays = (iso: string, days: number) => {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function getSupplierHistory(supplier: Supplier): HistoryEntry[] {
  const rng = seeded(Number.parseInt(supplier.id.replace(/\D/g, ''), 10) * 41 + 7)
  const count = Math.min(supplier.purchaseCount, 10)
  const entries: HistoryEntry[] = []
  for (let i = 0; i < count; i++) {
    const roll = rng()
    const type: HistoryEntry['type'] =
      roll > 0.85
        ? 'Pago'
        : roll > 0.72
          ? 'Nota débito'
          : roll > 0.64
            ? 'Devolución'
            : roll > 0.4
              ? 'Factura'
              : 'Compra'
    const base = Math.round(
      (supplier.totalPurchases / Math.max(supplier.purchaseCount, 1)) * (0.6 + rng()),
    )
    const statusRoll = rng()
    let status: HistoryEntry['status']
    if (type === 'Pago') status = 'aplicado'
    else if (type === 'Nota débito' || type === 'Devolución') status = 'anulada'
    else if (supplier.status === 'moroso' && statusRoll > 0.4) status = 'vencida'
    else if (statusRoll > 0.6) status = 'pendiente'
    else status = 'pagada'
    entries.push({
      id: `${supplier.id}-h${i}`,
      date: monthsBack(i),
      document: `${type === 'Pago' ? 'CE' : type === 'Nota débito' ? 'ND' : 'FC'}-${1000 + i + Number.parseInt(supplier.id.replace(/\D/g, ''), 10) * 10}`,
      type,
      amount: type === 'Pago' || type === 'Nota débito' || type === 'Devolución' ? -base : base,
      status,
    })
  }
  return entries
}

export function getPayables(supplier: Supplier): Payable[] {
  if (supplier.balance <= 0) {
    // Fully-paid suppliers still show a short settled history.
    const rng = seeded(Number.parseInt(supplier.id.replace(/\D/g, ''), 10) * 53 + 3)
    return Array.from({ length: 3 }).map((_, i) => {
      const amount = Math.round(
        (supplier.totalPurchases / Math.max(supplier.purchaseCount, 1)) * (0.8 + rng()),
      )
      const date = monthsBack(i + 1)
      return {
        id: `${supplier.id}-p${i}`,
        document: `FC-${2000 + i + Number.parseInt(supplier.id.replace(/\D/g, ''), 10) * 10}`,
        date,
        dueDate: addDays(date, supplier.creditDays || 15),
        amount,
        paid: amount,
        balance: 0,
        status: 'pagada' as PayableStatus,
      }
    })
  }

  const rng = seeded(Number.parseInt(supplier.id.replace(/\D/g, ''), 10) * 53 + 3)
  const docs = 5
  const weights = Array.from({ length: docs }).map(() => 0.4 + rng())
  const weightSum = weights.reduce((a, b) => a + b, 0)
  const payables: Payable[] = []
  let remaining = supplier.balance

  for (let i = 0; i < docs; i++) {
    const isLast = i === docs - 1
    const share = isLast ? remaining : Math.round((supplier.balance * weights[i]) / weightSum)
    const outstanding = Math.max(share, 0)
    remaining -= outstanding

    const date = monthsBack(i)
    const dueDate = addDays(date, supplier.creditDays || 30)
    const overdue = new Date(dueDate) < new Date('2026-09-20')

    const partialRoll = rng()
    const paid = partialRoll > 0.6 ? Math.round(outstanding * (0.2 + rng() * 0.4)) : 0
    const amount = outstanding + paid

    let status: PayableStatus
    if (paid > 0) status = 'parcial'
    else if (supplier.status === 'moroso' && overdue) status = 'vencida'
    else if (overdue) status = 'vencida'
    else status = 'pendiente'

    payables.push({
      id: `${supplier.id}-p${i}`,
      document: `FC-${2000 + i + Number.parseInt(supplier.id.replace(/\D/g, ''), 10) * 10}`,
      date,
      dueDate,
      amount,
      paid,
      balance: outstanding,
      status,
    })
  }
  return payables
}
