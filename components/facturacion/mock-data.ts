export type InvoiceStatus =
  | 'pendiente'
  | 'generada'
  | 'enviada'
  | 'aceptada'
  | 'rechazada'
  | 'anulada'

export type DianStatus = 'no_enviado' | 'en_proceso' | 'aceptado' | 'rechazado'
export type DocumentType = 'NIT' | 'CC' | 'CE' | 'RUT' | 'PAS'
export type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Crédito'

export interface InvoiceItem {
  id: string
  code: string
  description: string
  quantity: number
  unitPrice: number
  discount: number // percent 0-100
  taxRate: number // percent, e.g. 19, 5, 0
}

export interface InvoiceCustomer {
  name: string
  documentType: DocumentType
  document: string
  email: string
  phone: string
  address: string
  city: string
}

export interface ElectronicInfo {
  dianStatus: DianStatus
  cufe: string | null
  sentAt: string | null
  respondedAt: string | null
  message: string | null
}

export interface Invoice {
  id: string
  number: string
  date: string
  time: string
  customer: InvoiceCustomer
  seller: string
  paymentMethod: PaymentMethod
  items: InvoiceItem[]
  notes: string
  status: InvoiceStatus
  electronic: ElectronicInfo
}

/* -------------------------------------------------------------------------- */
/*  Company (issuer) — enterprise header                                      */
/* -------------------------------------------------------------------------- */

export const company = {
  name: 'JERALPOS S.A.S',
  nit: '901.456.789-0',
  regime: 'Responsable de IVA',
  address: 'Carrera 45 #23-15, Local 102',
  city: 'Bogotá D.C., Colombia',
  phone: '(601) 742 8890',
  email: 'facturacion@jeralpos.com',
  website: 'www.jeralpos.com',
  resolution:
    'Resolución DIAN No. 18764003210567 del 2026-01-15. Habilita del No. FE-1 al No. FE-50000. Vigencia 24 meses.',
}

/* -------------------------------------------------------------------------- */
/*  Labels & variants                                                         */
/* -------------------------------------------------------------------------- */

export const statusLabel: Record<InvoiceStatus, string> = {
  pendiente: 'Pendiente',
  generada: 'Generada',
  enviada: 'Enviada',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  anulada: 'Anulada',
}

export const statusVariant: Record<
  InvoiceStatus,
  'success' | 'warning' | 'danger' | 'neutral' | 'primary'
> = {
  pendiente: 'warning',
  generada: 'neutral',
  enviada: 'primary',
  aceptada: 'success',
  rechazada: 'danger',
  anulada: 'neutral',
}

export const dianStatusLabel: Record<DianStatus, string> = {
  no_enviado: 'No enviado',
  en_proceso: 'En proceso',
  aceptado: 'Aceptado por la DIAN',
  rechazado: 'Rechazado por la DIAN',
}

export const dianStatusVariant: Record<DianStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  no_enviado: 'neutral',
  en_proceso: 'warning',
  aceptado: 'success',
  rechazado: 'danger',
}

/* -------------------------------------------------------------------------- */
/*  Money & totals                                                            */
/* -------------------------------------------------------------------------- */

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export interface InvoiceTotals {
  gross: number // sum of qty * unitPrice
  discount: number // total discount amount
  subtotal: number // gross - discount (taxable base)
  tax: number // total tax
  total: number // subtotal + tax
}

export function lineNet(item: InvoiceItem): number {
  const gross = item.quantity * item.unitPrice
  return gross - gross * (item.discount / 100)
}

export function lineTax(item: InvoiceItem): number {
  return lineNet(item) * (item.taxRate / 100)
}

export function computeTotals(items: InvoiceItem[]): InvoiceTotals {
  let gross = 0
  let discount = 0
  let subtotal = 0
  let tax = 0
  for (const item of items) {
    const g = item.quantity * item.unitPrice
    const d = g * (item.discount / 100)
    const net = g - d
    gross += g
    discount += d
    subtotal += net
    tax += net * (item.taxRate / 100)
  }
  return { gross, discount, subtotal, tax, total: subtotal + tax }
}

/* -------------------------------------------------------------------------- */
/*  Seed invoices                                                             */
/* -------------------------------------------------------------------------- */

export const sellers = ['Laura Martínez', 'Andrés Gómez', 'Carolina Ruiz', 'Felipe Torres']

export const invoices: Invoice[] = [
  {
    id: 'inv-1',
    number: 'FE-1042',
    date: '2026-09-22',
    time: '09:14',
    customer: {
      name: 'Distribuidora El Progreso S.A.S',
      documentType: 'NIT',
      document: '900.123.456-1',
      email: 'compras@elprogreso.com',
      phone: '310 456 7788',
      address: 'Calle 80 #12-34',
      city: 'Bogotá',
    },
    seller: 'Laura Martínez',
    paymentMethod: 'Crédito',
    notes: 'Pedido mensual. Entregar en bodega principal.',
    status: 'aceptada',
    items: [
      { id: 'i1', code: 'PRD-001', description: 'Coca-Cola 600ml (paca x24)', quantity: 15, unitPrice: 42000, discount: 5, taxRate: 19 },
      { id: 'i2', code: 'PRD-014', description: 'Café soluble 170g', quantity: 30, unitPrice: 12500, discount: 0, taxRate: 19 },
      { id: 'i3', code: 'PRD-022', description: 'Arroz premium 500g', quantity: 50, unitPrice: 2800, discount: 0, taxRate: 5 },
    ],
    electronic: {
      dianStatus: 'aceptado',
      cufe: 'a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef',
      sentAt: '2026-09-22 09:15',
      respondedAt: '2026-09-22 09:15',
      message: 'Documento validado y aceptado por la DIAN.',
    },
  },
  {
    id: 'inv-2',
    number: 'FE-1043',
    date: '2026-09-22',
    time: '10:02',
    customer: {
      name: 'María Fernanda López',
      documentType: 'CC',
      document: '52.998.114',
      email: 'mafe.lopez@gmail.com',
      phone: '300 221 4455',
      address: 'Cra 15 #93-40',
      city: 'Bogotá',
    },
    seller: 'Andrés Gómez',
    paymentMethod: 'Tarjeta',
    notes: '',
    status: 'enviada',
    items: [
      { id: 'i1', code: 'PRD-101', description: 'Aceite de oliva 500ml', quantity: 2, unitPrice: 28900, discount: 0, taxRate: 19 },
      { id: 'i2', code: 'PRD-088', description: 'Pasta larga 500g', quantity: 6, unitPrice: 3400, discount: 0, taxRate: 5 },
    ],
    electronic: {
      dianStatus: 'en_proceso',
      cufe: 'f0e1d2c3b4a5968778695a4b3c2d1e0f9876543210fedcba0987654321fedcba',
      sentAt: '2026-09-22 10:03',
      respondedAt: null,
      message: 'Documento en validación por la DIAN.',
    },
  },
  {
    id: 'inv-3',
    number: 'FE-1044',
    date: '2026-09-21',
    time: '16:47',
    customer: {
      name: 'Hotelería Caribe Group',
      documentType: 'NIT',
      document: '830.998.112-3',
      email: 'admin@caribegroup.co',
      phone: '605 331 7788',
      address: 'Bocagrande Cra 1 #10-20',
      city: 'Cartagena',
    },
    seller: 'Carolina Ruiz',
    paymentMethod: 'Transferencia',
    notes: 'Factura consolidada del evento corporativo.',
    status: 'aceptada',
    items: [
      { id: 'i1', code: 'PRD-201', description: 'Agua mineral 500ml (caja x12)', quantity: 40, unitPrice: 18000, discount: 8, taxRate: 19 },
      { id: 'i2', code: 'PRD-210', description: 'Snack mixto 45g', quantity: 120, unitPrice: 2200, discount: 0, taxRate: 19 },
      { id: 'i3', code: 'SRV-005', description: 'Servicio de logística y entrega', quantity: 1, unitPrice: 350000, discount: 0, taxRate: 19 },
    ],
    electronic: {
      dianStatus: 'aceptado',
      cufe: '112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00',
      sentAt: '2026-09-21 16:48',
      respondedAt: '2026-09-21 16:49',
      message: 'Documento validado y aceptado por la DIAN.',
    },
  },
  {
    id: 'inv-4',
    number: 'FE-1045',
    date: '2026-09-21',
    time: '11:20',
    customer: {
      name: 'Consumidor Final',
      documentType: 'CC',
      document: '222222222222',
      email: '',
      phone: '',
      address: '',
      city: 'Bogotá',
    },
    seller: 'Felipe Torres',
    paymentMethod: 'Efectivo',
    notes: 'Venta de mostrador.',
    status: 'generada',
    items: [
      { id: 'i1', code: 'PRD-330', description: 'Chocolatina 40g', quantity: 4, unitPrice: 2500, discount: 0, taxRate: 19 },
      { id: 'i2', code: 'PRD-045', description: 'Galletas dulces 200g', quantity: 2, unitPrice: 5800, discount: 0, taxRate: 19 },
    ],
    electronic: {
      dianStatus: 'no_enviado',
      cufe: null,
      sentAt: null,
      respondedAt: null,
      message: null,
    },
  },
  {
    id: 'inv-5',
    number: 'FE-1046',
    date: '2026-09-20',
    time: '14:35',
    customer: {
      name: 'Restaurante La Brasa Dorada',
      documentType: 'NIT',
      document: '811.445.667-8',
      email: 'contabilidad@labrasa.com',
      phone: '604 312 7788',
      address: 'Cra 50 #10-30',
      city: 'Medellín',
    },
    seller: 'Laura Martínez',
    paymentMethod: 'Crédito',
    notes: '',
    status: 'rechazada',
    items: [
      { id: 'i1', code: 'PRD-410', description: 'Carne de res kg', quantity: 25, unitPrice: 32000, discount: 0, taxRate: 0 },
      { id: 'i2', code: 'PRD-411', description: 'Pollo entero kg', quantity: 40, unitPrice: 12000, discount: 0, taxRate: 0 },
    ],
    electronic: {
      dianStatus: 'rechazado',
      cufe: null,
      sentAt: '2026-09-20 14:36',
      respondedAt: '2026-09-20 14:37',
      message:
        'Rechazado (Regla FAD06): el NIT del adquiriente no corresponde con el registrado en el RUT.',
    },
  },
  {
    id: 'inv-6',
    number: 'FE-1047',
    date: '2026-09-20',
    time: '08:59',
    customer: {
      name: 'Cafetería Central',
      documentType: 'NIT',
      document: '901.556.223-4',
      email: 'pedidos@cafeteriacentral.co',
      phone: '601 770 8899',
      address: 'Av. El Dorado #92-30',
      city: 'Bogotá',
    },
    seller: 'Andrés Gómez',
    paymentMethod: 'Transferencia',
    notes: 'Reposición semanal.',
    status: 'aceptada',
    items: [
      { id: 'i1', code: 'PRD-014', description: 'Café soluble 170g', quantity: 24, unitPrice: 12500, discount: 3, taxRate: 19 },
      { id: 'i2', code: 'PRD-500', description: 'Azúcar refinada 1kg', quantity: 30, unitPrice: 4200, discount: 0, taxRate: 5 },
      { id: 'i3', code: 'PRD-501', description: 'Vasos desechables 7oz (x50)', quantity: 10, unitPrice: 6800, discount: 0, taxRate: 19 },
    ],
    electronic: {
      dianStatus: 'aceptado',
      cufe: 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
      sentAt: '2026-09-20 09:00',
      respondedAt: '2026-09-20 09:01',
      message: 'Documento validado y aceptado por la DIAN.',
    },
  },
  {
    id: 'inv-7',
    number: 'FE-1048',
    date: '2026-09-19',
    time: '17:12',
    customer: {
      name: 'Panadería El Trigal',
      documentType: 'NIT',
      document: '812.334.778-1',
      email: 'gerencia@eltrigal.co',
      phone: '606 445 1230',
      address: 'Calle 36 #22-18',
      city: 'Pereira',
    },
    seller: 'Carolina Ruiz',
    paymentMethod: 'Efectivo',
    notes: '',
    status: 'pendiente',
    items: [
      { id: 'i1', code: 'PRD-500', description: 'Azúcar refinada 1kg', quantity: 40, unitPrice: 4200, discount: 0, taxRate: 5 },
      { id: 'i2', code: 'PRD-610', description: 'Harina de trigo 1kg', quantity: 60, unitPrice: 3600, discount: 0, taxRate: 5 },
    ],
    electronic: {
      dianStatus: 'no_enviado',
      cufe: null,
      sentAt: null,
      respondedAt: null,
      message: null,
    },
  },
  {
    id: 'inv-8',
    number: 'FE-1049',
    date: '2026-09-19',
    time: '13:05',
    customer: {
      name: 'Supermercado La Economía',
      documentType: 'NIT',
      document: '900.778.334-6',
      email: 'compras@laeconomia.com',
      phone: '605 660 2211',
      address: 'Cra 8 #45-12',
      city: 'Barranquilla',
    },
    seller: 'Felipe Torres',
    paymentMethod: 'Crédito',
    notes: 'Pedido con descuento por volumen.',
    status: 'anulada',
    items: [
      { id: 'i1', code: 'PRD-001', description: 'Coca-Cola 600ml (paca x24)', quantity: 20, unitPrice: 42000, discount: 10, taxRate: 19 },
      { id: 'i2', code: 'PRD-201', description: 'Agua mineral 500ml (caja x12)', quantity: 30, unitPrice: 18000, discount: 10, taxRate: 19 },
    ],
    electronic: {
      dianStatus: 'aceptado',
      cufe: '0f1e2d3c4b5a69788796a5b4c3d2e1f00f1e2d3c4b5a69788796a5b4c3d2e1f0',
      sentAt: '2026-09-19 13:06',
      respondedAt: '2026-09-19 13:07',
      message: 'Documento anulado mediante nota crédito NC-233.',
    },
  },
  {
    id: 'inv-9',
    number: 'FE-1050',
    date: '2026-09-22',
    time: '11:48',
    customer: {
      name: 'Juan Pablo Herrera',
      documentType: 'CC',
      document: '79.112.556',
      email: 'jp.herrera@outlook.com',
      phone: '312 998 1100',
      address: 'Calle 127 #7-83',
      city: 'Bogotá',
    },
    seller: 'Laura Martínez',
    paymentMethod: 'Tarjeta',
    notes: '',
    status: 'generada',
    items: [
      { id: 'i1', code: 'PRD-101', description: 'Aceite de oliva 500ml', quantity: 1, unitPrice: 28900, discount: 0, taxRate: 19 },
      { id: 'i2', code: 'PRD-045', description: 'Galletas dulces 200g', quantity: 3, unitPrice: 5800, discount: 0, taxRate: 19 },
      { id: 'i3', code: 'PRD-330', description: 'Chocolatina 40g', quantity: 10, unitPrice: 2500, discount: 0, taxRate: 19 },
    ],
    electronic: {
      dianStatus: 'no_enviado',
      cufe: null,
      sentAt: null,
      respondedAt: null,
      message: null,
    },
  },
]

/* -------------------------------------------------------------------------- */
/*  Summary / KPIs                                                            */
/* -------------------------------------------------------------------------- */

export const TODAY = '2026-09-22'
export const MONTH_PREFIX = '2026-09'

export interface InvoiceSummary {
  today: number
  month: number
  accepted: number
  pending: number
  rejected: number
  billed: number
}

export function getSummary(list: Invoice[]): InvoiceSummary {
  let today = 0
  let month = 0
  let accepted = 0
  let pending = 0
  let rejected = 0
  let billed = 0
  for (const inv of list) {
    if (inv.date === TODAY) today++
    if (inv.date.startsWith(MONTH_PREFIX)) month++
    if (inv.status === 'aceptada') accepted++
    if (inv.status === 'pendiente' || inv.status === 'generada') pending++
    if (inv.status === 'rechazada') rejected++
    if (inv.status !== 'anulada') billed += computeTotals(inv.items).total
  }
  return { today, month, accepted, pending, rejected, billed }
}

/** Number to Spanish words for the invoice legal "value in letters" line. */
export function numberToWords(value: number): string {
  const n = Math.round(value)
  if (n === 0) return 'CERO PESOS M/CTE'
  const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE']
  const especiales = [
    'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE',
    'DIECIOCHO', 'DIECINUEVE',
  ]
  const decenas = [
    '', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA',
  ]
  const centenas = [
    '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS',
    'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS',
  ]

  const toWords = (num: number): string => {
    if (num === 0) return ''
    if (num === 100) return 'CIEN'
    let words = ''
    const c = Math.floor(num / 100)
    const rest = num % 100
    if (c > 0) words += centenas[c] + ' '
    if (rest >= 10 && rest < 20) {
      words += especiales[rest - 10] + ' '
    } else {
      const d = Math.floor(rest / 10)
      const u = rest % 10
      if (d > 0) {
        if (d === 2 && u > 0) words += 'VEINTI' + unidades[u].toLowerCase().toUpperCase() + ' '
        else {
          words += decenas[d]
          if (u > 0) words += ' Y ' + unidades[u]
          words += ' '
        }
      } else if (u > 0) {
        words += unidades[u] + ' '
      }
    }
    return words
  }

  let result = ''
  const millones = Math.floor(n / 1000000)
  const miles = Math.floor((n % 1000000) / 1000)
  const resto = n % 1000

  if (millones > 0) {
    result += millones === 1 ? 'UN MILLÓN ' : toWords(millones) + 'MILLONES '
  }
  if (miles > 0) {
    result += miles === 1 ? 'MIL ' : toWords(miles) + 'MIL '
  }
  if (resto > 0) {
    result += toWords(resto)
  }
  return result.trim() + ' PESOS M/CTE'
}
