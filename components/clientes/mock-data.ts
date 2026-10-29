export type CustomerStatus = 'activo' | 'inactivo' | 'bloqueado' | 'moroso'
export type CustomerType = 'minorista' | 'mayorista' | 'distribuidor' | 'corporativo'
export type PersonType = 'natural' | 'juridica'
export type DocumentType = 'CC' | 'NIT' | 'CE' | 'PP'

export interface HistoryEntry {
  id: string
  date: string
  document: string
  type: 'Factura' | 'Nota crédito' | 'Recibo' | 'Devolución'
  amount: number
  status: 'pagada' | 'pendiente' | 'vencida' | 'anulada' | 'aplicado'
}

export interface Customer {
  id: string
  personType: PersonType
  documentType: DocumentType
  document: string
  firstName: string
  lastName: string
  businessName: string
  displayName: string
  phone: string
  mobile: string
  email: string
  address: string
  city: string
  department: string
  type: CustomerType
  creditLimit: number
  creditDays: number
  priceList: string
  status: CustomerStatus
  createdAt: string
  totalPurchases: number
  purchaseCount: number
  balance: number
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

export const priceLists = ['General', 'Mayorista', 'Distribuidor', 'Preferencial']

export const customerTypeLabel: Record<CustomerType, string> = {
  minorista: 'Minorista',
  mayorista: 'Mayorista',
  distribuidor: 'Distribuidor',
  corporativo: 'Corporativo',
}

export const statusLabel: Record<CustomerStatus, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  bloqueado: 'Bloqueado',
  moroso: 'Moroso',
}

export const statusVariant: Record<CustomerStatus, 'success' | 'neutral' | 'danger' | 'warning'> = {
  activo: 'success',
  inactivo: 'neutral',
  bloqueado: 'danger',
  moroso: 'warning',
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

export function customerInitials(c: Customer): string {
  if (c.personType === 'juridica') {
    return c.businessName
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
  }
  return `${c.firstName[0] ?? ''}${c.lastName[0] ?? ''}`.toUpperCase()
}

export const customers: Customer[] = [
  {
    id: 'c1',
    personType: 'natural',
    documentType: 'CC',
    document: '1032456789',
    firstName: 'María Fernanda',
    lastName: 'Gómez Ruiz',
    businessName: '',
    displayName: 'María Fernanda Gómez Ruiz',
    phone: '601 745 2210',
    mobile: '310 456 7890',
    email: 'mariaf.gomez@gmail.com',
    address: 'Cra 15 #93-45, Apto 502',
    city: 'Bogotá',
    department: 'Cundinamarca',
    type: 'minorista',
    creditLimit: 500000,
    creditDays: 15,
    priceList: 'General',
    status: 'activo',
    createdAt: '2024-02-11',
    totalPurchases: 4850000,
    purchaseCount: 34,
    balance: 0,
    lastPurchase: '2026-09-18',
    color: palette[0],
  },
  {
    id: 'c2',
    personType: 'juridica',
    documentType: 'NIT',
    document: '900456123-7',
    firstName: '',
    lastName: '',
    businessName: 'Distribuidora El Progreso S.A.S',
    displayName: 'Distribuidora El Progreso S.A.S',
    phone: '604 512 8890',
    mobile: '301 223 9987',
    email: 'compras@elprogreso.com',
    address: 'Calle 30 #45-12, Bodega 8',
    city: 'Medellín',
    department: 'Antioquia',
    type: 'distribuidor',
    creditLimit: 15000000,
    creditDays: 45,
    priceList: 'Distribuidor',
    status: 'activo',
    createdAt: '2023-08-03',
    totalPurchases: 128400000,
    purchaseCount: 156,
    balance: 4320000,
    lastPurchase: '2026-09-20',
    color: palette[1],
  },
  {
    id: 'c3',
    personType: 'juridica',
    documentType: 'NIT',
    document: '830112998-4',
    firstName: '',
    lastName: '',
    businessName: 'Supermercados La Economía Ltda',
    displayName: 'Supermercados La Economía Ltda',
    phone: '602 398 1120',
    mobile: '315 887 6654',
    email: 'pagos@laeconomia.co',
    address: 'Av. 6 Norte #23-80',
    city: 'Cali',
    department: 'Valle del Cauca',
    type: 'mayorista',
    creditLimit: 8000000,
    creditDays: 30,
    priceList: 'Mayorista',
    status: 'moroso',
    createdAt: '2023-11-22',
    totalPurchases: 67200000,
    purchaseCount: 89,
    balance: 6150000,
    lastPurchase: '2026-08-02',
    color: palette[2],
  },
  {
    id: 'c4',
    personType: 'natural',
    documentType: 'CC',
    document: '52889447',
    firstName: 'Carlos Andrés',
    lastName: 'Vargas León',
    businessName: '',
    displayName: 'Carlos Andrés Vargas León',
    phone: '605 331 4402',
    mobile: '312 998 4471',
    email: 'cavargas@outlook.com',
    address: 'Cra 52 #72-118',
    city: 'Barranquilla',
    department: 'Atlántico',
    type: 'minorista',
    creditLimit: 0,
    creditDays: 0,
    priceList: 'General',
    status: 'activo',
    createdAt: '2025-01-15',
    totalPurchases: 1230000,
    purchaseCount: 12,
    balance: 0,
    lastPurchase: '2026-09-10',
    color: palette[3],
  },
  {
    id: 'c5',
    personType: 'juridica',
    documentType: 'NIT',
    document: '901334556-2',
    firstName: '',
    lastName: '',
    businessName: 'Hotelería Caribe Group',
    displayName: 'Hotelería Caribe Group',
    phone: '605 660 7788',
    mobile: '300 445 1122',
    email: 'proveedores@caribegroup.com',
    address: 'Bocagrande, Cra 1 #5-15',
    city: 'Cartagena',
    department: 'Bolívar',
    type: 'corporativo',
    creditLimit: 25000000,
    creditDays: 60,
    priceList: 'Preferencial',
    status: 'activo',
    createdAt: '2022-05-19',
    totalPurchases: 245800000,
    purchaseCount: 312,
    balance: 12800000,
    lastPurchase: '2026-09-21',
    color: palette[4],
  },
  {
    id: 'c6',
    personType: 'natural',
    documentType: 'CE',
    document: '478112',
    firstName: 'Lucía',
    lastName: 'Martínez Peña',
    businessName: '',
    displayName: 'Lucía Martínez Peña',
    phone: '607 645 9010',
    mobile: '318 774 2200',
    email: 'lucia.mp@gmail.com',
    address: 'Calle 36 #18-22',
    city: 'Bucaramanga',
    department: 'Santander',
    type: 'minorista',
    creditLimit: 300000,
    creditDays: 8,
    priceList: 'General',
    status: 'inactivo',
    createdAt: '2024-06-30',
    totalPurchases: 890000,
    purchaseCount: 7,
    balance: 0,
    lastPurchase: '2026-03-14',
    color: palette[5],
  },
  {
    id: 'c7',
    personType: 'juridica',
    documentType: 'NIT',
    document: '811223447-9',
    firstName: '',
    lastName: '',
    businessName: 'Panadería y Café Aroma',
    displayName: 'Panadería y Café Aroma',
    phone: '606 312 5567',
    mobile: '316 220 9843',
    email: 'gerencia@cafearoma.co',
    address: 'Cra 8 #21-40',
    city: 'Pereira',
    department: 'Risaralda',
    type: 'mayorista',
    creditLimit: 5000000,
    creditDays: 30,
    priceList: 'Mayorista',
    status: 'bloqueado',
    createdAt: '2023-09-12',
    totalPurchases: 34500000,
    purchaseCount: 61,
    balance: 3200000,
    lastPurchase: '2026-07-05',
    color: palette[6],
  },
  {
    id: 'c8',
    personType: 'natural',
    documentType: 'CC',
    document: '1015998234',
    firstName: 'Andrés Felipe',
    lastName: 'Rojas Camacho',
    businessName: '',
    displayName: 'Andrés Felipe Rojas Camacho',
    phone: '601 889 3321',
    mobile: '311 556 7788',
    email: 'afrojas@empresa.com',
    address: 'Calle 100 #15-60, Of 304',
    city: 'Bogotá',
    department: 'Cundinamarca',
    type: 'corporativo',
    creditLimit: 3000000,
    creditDays: 30,
    priceList: 'Preferencial',
    status: 'activo',
    createdAt: '2024-10-08',
    totalPurchases: 18900000,
    purchaseCount: 41,
    balance: 950000,
    lastPurchase: '2026-09-19',
    color: palette[7],
  },
]

export interface CustomerSummary {
  total: number
  active: number
  withBalance: number
  pendingBalance: number
}

export function getCustomerSummary(list: Customer[]): CustomerSummary {
  return {
    total: list.length,
    active: list.filter((c) => c.status === 'activo').length,
    withBalance: list.filter((c) => c.balance > 0).length,
    pendingBalance: list.reduce((sum, c) => sum + c.balance, 0),
  }
}

// Deterministic pseudo-random generator so history stays stable per customer.
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

export function getCustomerHistory(customer: Customer): HistoryEntry[] {
  const rng = seeded(Number.parseInt(customer.id.replace(/\D/g, ''), 10) * 37 + 11)
  const count = Math.min(customer.purchaseCount, 10)
  const entries: HistoryEntry[] = []
  for (let i = 0; i < count; i++) {
    const roll = rng()
    const type: HistoryEntry['type'] =
      roll > 0.85 ? 'Nota crédito' : roll > 0.7 ? 'Recibo' : roll > 0.62 ? 'Devolución' : 'Factura'
    const base = Math.round((customer.totalPurchases / Math.max(customer.purchaseCount, 1)) * (0.6 + rng()))
    const statusRoll = rng()
    let status: HistoryEntry['status']
    if (type === 'Recibo') status = 'aplicado'
    else if (type === 'Nota crédito' || type === 'Devolución') status = 'anulada'
    else if (customer.status === 'moroso' && statusRoll > 0.4) status = 'vencida'
    else if (statusRoll > 0.6) status = 'pendiente'
    else status = 'pagada'
    entries.push({
      id: `${customer.id}-h${i}`,
      date: monthsBack(i),
      document: `${type === 'Factura' ? 'FV' : type === 'Recibo' ? 'RC' : 'NC'}-${1000 + i + Number.parseInt(customer.id.replace(/\D/g, ''), 10) * 10}`,
      type,
      amount: type === 'Recibo' || type === 'Nota crédito' || type === 'Devolución' ? -base : base,
      status,
    })
  }
  return entries
}

export interface AgingBucket {
  label: string
  amount: number
}

export function getAging(customer: Customer): AgingBucket[] {
  if (customer.balance <= 0) {
    return [
      { label: 'Corriente', amount: 0 },
      { label: '1-30 días', amount: 0 },
      { label: '31-60 días', amount: 0 },
      { label: '+60 días', amount: 0 },
    ]
  }
  const b = customer.balance
  if (customer.status === 'moroso') {
    return [
      { label: 'Corriente', amount: Math.round(b * 0.1) },
      { label: '1-30 días', amount: Math.round(b * 0.2) },
      { label: '31-60 días', amount: Math.round(b * 0.3) },
      { label: '+60 días', amount: Math.round(b * 0.4) },
    ]
  }
  return [
    { label: 'Corriente', amount: Math.round(b * 0.6) },
    { label: '1-30 días', amount: Math.round(b * 0.3) },
    { label: '31-60 días', amount: Math.round(b * 0.1) },
    { label: '+60 días', amount: 0 },
  ]
}
