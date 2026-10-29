export type EmployeeStatus = 'activo' | 'inactivo' | 'suspendido' | 'vacaciones'
export type DocumentType = 'CC' | 'CE' | 'TI' | 'PA'

export type ActivityType =
  | 'venta'
  | 'apertura_caja'
  | 'cierre_caja'
  | 'ingreso'
  | 'ajuste'
  | 'devolucion'
  | 'sesion'

export interface ActivityEntry {
  id: string
  date: string
  time: string
  type: ActivityType
  title: string
  detail: string
  amount?: number
}

export interface SaleEntry {
  id: string
  date: string
  document: string
  customer: string
  items: number
  total: number
  method: 'Efectivo' | 'Tarjeta' | 'Transferencia'
  status: 'completada' | 'anulada' | 'pendiente'
}

export interface CashSession {
  id: string
  date: string
  register: string
  opening: number
  sales: number
  closing: number
  difference: number
  status: 'cuadrada' | 'sobrante' | 'faltante' | 'abierta'
}

export interface AuditEntry {
  id: string
  date: string
  time: string
  action: string
  module: string
  ip: string
  result: 'exitoso' | 'fallido'
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  fullName: string
  documentType: DocumentType
  document: string
  birthDate: string
  phone: string
  mobile: string
  email: string
  address: string
  city: string
  role: string
  branch: string
  hireDate: string
  status: EmployeeStatus
  notes: string
  hasUser: boolean
  username: string
  salesCount: number
  salesTotal: number
  cashOpenings: number
  lastActivity: string
  color: string
}

export const roles = [
  'Administrador',
  'Cajero',
  'Vendedor',
  'Supervisor',
  'Bodeguero',
  'Contador',
  'Gerente',
]

export const branches = [
  'Sede Principal',
  'Sucursal Norte',
  'Sucursal Sur',
  'Sucursal Centro',
  'Bodega Central',
]

export const cities = [
  'Bogotá',
  'Medellín',
  'Cali',
  'Barranquilla',
  'Cartagena',
  'Bucaramanga',
  'Pereira',
]

export const statusLabel: Record<EmployeeStatus, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  suspendido: 'Suspendido',
  vacaciones: 'Vacaciones',
}

export const statusVariant: Record<
  EmployeeStatus,
  'success' | 'neutral' | 'danger' | 'warning' | 'primary'
> = {
  activo: 'success',
  inactivo: 'neutral',
  suspendido: 'danger',
  vacaciones: 'primary',
}

export const activityLabel: Record<ActivityType, string> = {
  venta: 'Venta',
  apertura_caja: 'Apertura de caja',
  cierre_caja: 'Cierre de caja',
  ingreso: 'Inicio de sesión',
  ajuste: 'Ajuste de inventario',
  devolucion: 'Devolución',
  sesion: 'Sesión',
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

export function employeeInitials(e: Employee): string {
  return `${e.firstName[0] ?? ''}${e.lastName[0] ?? ''}`.toUpperCase()
}

export const employees: Employee[] = [
  {
    id: 'e1',
    firstName: 'Laura',
    lastName: 'Martínez',
    fullName: 'Laura Martínez',
    documentType: 'CC',
    document: '1032456789',
    birthDate: '1992-04-18',
    phone: '601 448 1122',
    mobile: '311 456 7788',
    email: 'laura.martinez@jeralpos.com',
    address: 'Calle 80 #14-22',
    city: 'Bogotá',
    role: 'Administrador',
    branch: 'Sede Principal',
    hireDate: '2021-02-15',
    status: 'activo',
    notes: 'Acceso total al sistema. Responsable de configuración.',
    hasUser: true,
    username: 'lmartinez',
    salesCount: 1240,
    salesTotal: 312400000,
    cashOpenings: 320,
    lastActivity: '2026-09-22 09:14',
    color: palette[0],
  },
  {
    id: 'e2',
    firstName: 'Carlos',
    lastName: 'Gómez',
    fullName: 'Carlos Gómez',
    documentType: 'CC',
    document: '80115544',
    birthDate: '1988-11-03',
    phone: '604 312 5566',
    mobile: '310 887 2200',
    email: 'carlos.gomez@jeralpos.com',
    address: 'Cra 43 #10-30',
    city: 'Medellín',
    role: 'Cajero',
    branch: 'Sucursal Norte',
    hireDate: '2022-06-01',
    status: 'activo',
    notes: 'Turno mañana. Caja 2.',
    hasUser: true,
    username: 'cgomez',
    salesCount: 2180,
    salesTotal: 198700000,
    cashOpenings: 540,
    lastActivity: '2026-09-22 08:02',
    color: palette[1],
  },
  {
    id: 'e3',
    firstName: 'Daniela',
    lastName: 'Rojas',
    fullName: 'Daniela Rojas',
    documentType: 'CC',
    document: '1090334521',
    birthDate: '1995-07-27',
    phone: '602 555 7788',
    mobile: '315 220 1144',
    email: 'daniela.rojas@jeralpos.com',
    address: 'Av 6N #23-11',
    city: 'Cali',
    role: 'Vendedor',
    branch: 'Sucursal Sur',
    hireDate: '2023-03-10',
    status: 'vacaciones',
    notes: 'En periodo de vacaciones hasta el 30/09.',
    hasUser: true,
    username: 'drojas',
    salesCount: 1560,
    salesTotal: 142300000,
    cashOpenings: 0,
    lastActivity: '2026-09-10 17:45',
    color: palette[2],
  },
  {
    id: 'e4',
    firstName: 'Andrés',
    lastName: 'Peña',
    fullName: 'Andrés Peña',
    documentType: 'CC',
    document: '79554120',
    birthDate: '1985-01-22',
    phone: '605 660 4433',
    mobile: '312 445 9987',
    email: 'andres.pena@jeralpos.com',
    address: 'Cra 8 #45-12',
    city: 'Barranquilla',
    role: 'Supervisor',
    branch: 'Sucursal Norte',
    hireDate: '2020-09-14',
    status: 'activo',
    notes: 'Supervisa cierres de caja y arqueos.',
    hasUser: true,
    username: 'apena',
    salesCount: 640,
    salesTotal: 88200000,
    cashOpenings: 180,
    lastActivity: '2026-09-21 19:30',
    color: palette[3],
  },
  {
    id: 'e5',
    firstName: 'Mónica',
    lastName: 'Salazar',
    fullName: 'Mónica Salazar',
    documentType: 'CE',
    document: '456778',
    birthDate: '1990-09-09',
    phone: '601 770 2233',
    mobile: '300 112 3344',
    email: 'monica.salazar@jeralpos.com',
    address: 'Calle 100 #19-54',
    city: 'Bogotá',
    role: 'Contador',
    branch: 'Sede Principal',
    hireDate: '2021-11-02',
    status: 'activo',
    notes: 'Consulta reportes financieros. Sin acceso a ventas.',
    hasUser: true,
    username: 'msalazar',
    salesCount: 0,
    salesTotal: 0,
    cashOpenings: 0,
    lastActivity: '2026-09-22 07:50',
    color: palette[4],
  },
  {
    id: 'e6',
    firstName: 'Julián',
    lastName: 'Torres',
    fullName: 'Julián Torres',
    documentType: 'CC',
    document: '1015667788',
    birthDate: '1998-12-15',
    phone: '606 445 8899',
    mobile: '318 774 5566',
    email: 'julian.torres@jeralpos.com',
    address: 'Vereda La Florida km 4',
    city: 'Pereira',
    role: 'Bodeguero',
    branch: 'Bodega Central',
    hireDate: '2023-08-21',
    status: 'suspendido',
    notes: 'Suspendido por revisión de inventario pendiente.',
    hasUser: false,
    username: '',
    salesCount: 0,
    salesTotal: 0,
    cashOpenings: 0,
    lastActivity: '2026-08-30 14:20',
    color: palette[5],
  },
  {
    id: 'e7',
    firstName: 'Valentina',
    lastName: 'Cruz',
    fullName: 'Valentina Cruz',
    documentType: 'CC',
    document: '1122556677',
    birthDate: '1996-05-30',
    phone: '605 331 5544',
    mobile: '316 998 1122',
    email: 'valentina.cruz@jeralpos.com',
    address: 'Mamonal km 8',
    city: 'Cartagena',
    role: 'Cajero',
    branch: 'Sucursal Centro',
    hireDate: '2024-01-08',
    status: 'activo',
    notes: 'Turno tarde. Caja 1.',
    hasUser: true,
    username: 'vcruz',
    salesCount: 980,
    salesTotal: 76500000,
    cashOpenings: 210,
    lastActivity: '2026-09-22 08:41',
    color: palette[6],
  },
  {
    id: 'e8',
    firstName: 'Ricardo',
    lastName: 'Vargas',
    fullName: 'Ricardo Vargas',
    documentType: 'CC',
    document: '80998877',
    birthDate: '1983-03-12',
    phone: '607 645 1100',
    mobile: '311 556 8899',
    email: 'ricardo.vargas@jeralpos.com',
    address: 'Calle 36 #22-18',
    city: 'Bucaramanga',
    role: 'Gerente',
    branch: 'Sede Principal',
    hireDate: '2019-05-20',
    status: 'inactivo',
    notes: 'Cuenta desactivada tras finalizar contrato.',
    hasUser: true,
    username: 'rvargas',
    salesCount: 320,
    salesTotal: 54200000,
    cashOpenings: 60,
    lastActivity: '2026-06-15 16:10',
    color: palette[7],
  },
]

export interface EmployeeSummary {
  total: number
  active: number
  inactive: number
  withUser: number
}

export function getEmployeeSummary(list: Employee[]): EmployeeSummary {
  return {
    total: list.length,
    active: list.filter((e) => e.status === 'activo').length,
    inactive: list.filter((e) => e.status === 'inactivo').length,
    withUser: list.filter((e) => e.hasUser).length,
  }
}

// Deterministic pseudo-random generator keeps mock detail stable per employee.
function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

function idNum(id: string): number {
  return Number.parseInt(id.replace(/\D/g, ''), 10)
}

const daysBack = (n: number) => {
  const d = new Date(2026, 8, 22)
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

const customers = [
  'Consumidor final',
  'Supermercado La 14',
  'Tienda Doña Rosa',
  'Cafetería Central',
  'Distribuidora El Progreso',
  'Panadería Trigo de Oro',
]

const registers = ['Caja 1', 'Caja 2', 'Caja 3']

export function getEmployeeActivity(employee: Employee): ActivityEntry[] {
  const rng = seeded(idNum(employee.id) * 41 + 7)
  const count = employee.status === 'inactivo' || employee.status === 'suspendido' ? 4 : 9
  const entries: ActivityEntry[] = []
  const avgSale = employee.salesCount > 0 ? employee.salesTotal / employee.salesCount : 0
  for (let i = 0; i < count; i++) {
    const roll = rng()
    let type: ActivityType
    if (employee.salesCount === 0) {
      type = roll > 0.6 ? 'ingreso' : roll > 0.3 ? 'ajuste' : 'sesion'
    } else {
      type =
        roll > 0.82
          ? 'apertura_caja'
          : roll > 0.72
            ? 'cierre_caja'
            : roll > 0.64
              ? 'devolucion'
              : roll > 0.5
                ? 'ingreso'
                : 'venta'
    }
    const hour = 8 + Math.floor(rng() * 11)
    const minute = Math.floor(rng() * 60)
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    let title = activityLabel[type]
    let detail = ''
    let amount: number | undefined
    if (type === 'venta') {
      const doc = `VT-${10000 + i + idNum(employee.id) * 13}`
      amount = Math.round(avgSale * (0.5 + rng()))
      title = 'Venta registrada'
      detail = `${doc} · ${customers[Math.floor(rng() * customers.length)]}`
    } else if (type === 'apertura_caja') {
      amount = Math.round((100000 + rng() * 200000) / 1000) * 1000
      title = 'Apertura de caja'
      detail = `${registers[Math.floor(rng() * registers.length)]} · base inicial`
    } else if (type === 'cierre_caja') {
      amount = Math.round((500000 + rng() * 3000000) / 1000) * 1000
      title = 'Cierre de caja'
      detail = `${registers[Math.floor(rng() * registers.length)]} · arqueo`
    } else if (type === 'devolucion') {
      amount = -Math.round(avgSale * (0.2 + rng() * 0.4))
      title = 'Devolución procesada'
      detail = `DV-${5000 + i} · reembolso`
    } else if (type === 'ingreso') {
      title = 'Inicio de sesión'
      detail = `${employee.branch} · sesión web`
    } else if (type === 'ajuste') {
      title = 'Ajuste de inventario'
      detail = `AJ-${3000 + i} · conteo`
    } else {
      title = 'Actividad de sesión'
      detail = `${employee.branch}`
    }
    entries.push({
      id: `${employee.id}-a${i}`,
      date: daysBack(i),
      time,
      type,
      title,
      detail,
      amount,
    })
  }
  return entries
}

export function getEmployeeSales(employee: Employee): SaleEntry[] {
  if (employee.salesCount === 0) return []
  const rng = seeded(idNum(employee.id) * 53 + 3)
  const avgSale = employee.salesTotal / employee.salesCount
  const methods: SaleEntry['method'][] = ['Efectivo', 'Tarjeta', 'Transferencia']
  return Array.from({ length: 8 }).map((_, i) => {
    const roll = rng()
    const status: SaleEntry['status'] =
      roll > 0.92 ? 'anulada' : roll > 0.86 ? 'pendiente' : 'completada'
    return {
      id: `${employee.id}-s${i}`,
      date: daysBack(i),
      document: `VT-${10000 + i + idNum(employee.id) * 13}`,
      customer: customers[Math.floor(rng() * customers.length)],
      items: 1 + Math.floor(rng() * 12),
      total: Math.round(avgSale * (0.4 + rng() * 1.4)),
      method: methods[Math.floor(rng() * methods.length)],
      status,
    }
  })
}

export function getEmployeeCashSessions(employee: Employee): CashSession[] {
  if (employee.cashOpenings === 0) return []
  const rng = seeded(idNum(employee.id) * 67 + 5)
  return Array.from({ length: 6 }).map((_, i) => {
    const opening = Math.round((100000 + rng() * 200000) / 1000) * 1000
    const sales = Math.round((800000 + rng() * 4000000) / 1000) * 1000
    const diffRoll = rng()
    const difference =
      diffRoll > 0.75
        ? Math.round((rng() * 40000) / 100) * 100
        : diffRoll < 0.2
          ? -Math.round((rng() * 30000) / 100) * 100
          : 0
    const closing = opening + sales + difference
    const isOpen = i === 0 && employee.status === 'activo' && rng() > 0.6
    let status: CashSession['status']
    if (isOpen) status = 'abierta'
    else if (difference > 0) status = 'sobrante'
    else if (difference < 0) status = 'faltante'
    else status = 'cuadrada'
    return {
      id: `${employee.id}-c${i}`,
      date: daysBack(i),
      register: registers[i % registers.length],
      opening,
      sales,
      closing: isOpen ? 0 : closing,
      difference: isOpen ? 0 : difference,
      status,
    }
  })
}

export function getEmployeeAudit(employee: Employee): AuditEntry[] {
  const rng = seeded(idNum(employee.id) * 89 + 11)
  const actions = [
    { action: 'Inicio de sesión', module: 'Autenticación' },
    { action: 'Cierre de sesión', module: 'Autenticación' },
    { action: 'Creó una venta', module: 'Ventas' },
    { action: 'Anuló una venta', module: 'Ventas' },
    { action: 'Editó un producto', module: 'Productos' },
    { action: 'Registró movimiento', module: 'Inventarios' },
    { action: 'Cerró caja', module: 'Caja' },
    { action: 'Cambió configuración', module: 'Ajustes' },
  ]
  return Array.from({ length: 7 }).map((_, i) => {
    const a = actions[Math.floor(rng() * actions.length)]
    const hour = 7 + Math.floor(rng() * 12)
    const minute = Math.floor(rng() * 60)
    const failed = rng() > 0.88
    return {
      id: `${employee.id}-au${i}`,
      date: daysBack(i),
      time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      action: a.action,
      module: a.module,
      ip: `190.${Math.floor(rng() * 255)}.${Math.floor(rng() * 255)}.${Math.floor(rng() * 255)}`,
      result: failed ? 'fallido' : 'exitoso',
    }
  })
}
