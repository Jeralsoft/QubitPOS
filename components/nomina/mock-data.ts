export type PayrollSection =
  | 'dashboard'
  | 'empleados'
  | 'contratos'
  | 'liquidacion'
  | 'novedades'
  | 'asistencia'
  | 'comisiones'
  | 'pagos'
  | 'seguridad-social'
  | 'prestaciones'
  | 'vacaciones'
  | 'retiros'
  | 'documentos'
  | 'reportes'
  | 'contable'
  | 'electronica'
  | 'configuracion'
  | 'auditoria'

export type PayrollStatus = 'Borrador' | 'En revisión' | 'Pendiente de aprobación' | 'Aprobada' | 'Cerrada' | 'Pagada' | 'Anulada'
export type NoveltyStatus = 'Pendiente' | 'Aprobada' | 'Rechazada'

export interface PayrollEmployee {
  id: string
  initials: string
  name: string
  document: string
  role: string
  contract: string
  branch: string
  department: string
  startDate: string
  salary: number
  status: 'Activo' | 'Inactivo' | 'Retirado'
  eps: string
  pension: string
  arl: string
  bank: string
  account: string
}

export interface PayrollNovelty {
  id: string
  employee: string
  initials: string
  type: string
  period: string
  quantity: string
  value: number
  status: NoveltyStatus
  registeredBy: string
  date: string
}

export interface PayrollLiquidation {
  id: string
  employee: string
  initials: string
  contract: string
  base: number
  devengado: number
  deductions: number
  net: number
  employerCost: number
  status: PayrollStatus
}

export interface PayrollPayment {
  id: string
  employee: string
  period: string
  net: number
  date: string
  method: string
  status: 'Pendiente' | 'Programado' | 'Pagado' | 'Rechazado'
}

export interface PayrollNavGroup {
  label: string
  items: { label: string; id: PayrollSection; icon: string }[]
}

export const payrollNav: PayrollNavGroup[] = [
  { label: 'Gestión', items: [
    { label: 'Panel principal', id: 'dashboard', icon: 'LayoutDashboard' },
    { label: 'Empleados', id: 'empleados', icon: 'Users' },
    { label: 'Contratos laborales', id: 'contratos', icon: 'BriefcaseBusiness' },
  ] },
  { label: 'Procesos', items: [
    { label: 'Liquidación de nómina', id: 'liquidacion', icon: 'Calculator' },
    { label: 'Novedades', id: 'novedades', icon: 'ClipboardList' },
    { label: 'Asistencia y turnos', id: 'asistencia', icon: 'Clock3' },
    { label: 'Comisiones del POS', id: 'comisiones', icon: 'BadgeDollarSign' },
    { label: 'Pagos y deducciones', id: 'pagos', icon: 'WalletCards' },
  ] },
  { label: 'Obligaciones', items: [
    { label: 'Seguridad social', id: 'seguridad-social', icon: 'ShieldCheck' },
    { label: 'Prestaciones sociales', id: 'prestaciones', icon: 'Landmark' },
    { label: 'Vacaciones', id: 'vacaciones', icon: 'Palmtree' },
    { label: 'Liquidaciones de retiro', id: 'retiros', icon: 'UserMinus' },
  ] },
  { label: 'Documentos y control', items: [
    { label: 'Comprobantes y documentos', id: 'documentos', icon: 'Files' },
    { label: 'Reportes laborales', id: 'reportes', icon: 'BarChart3' },
    { label: 'Integración contable', id: 'contable', icon: 'BookOpenCheck' },
    { label: 'Nómina electrónica DIAN', id: 'electronica', icon: 'Send' },
    { label: 'Configuración', id: 'configuracion', icon: 'Settings2' },
    { label: 'Auditoría e historial', id: 'auditoria', icon: 'History' },
  ] },
]

export const employees: PayrollEmployee[] = [
  { id: 'EMP-001', initials: 'LR', name: 'Laura Martínez', document: 'CC 1.032.456.789', role: 'Vendedora', contract: 'Término indefinido', branch: 'Sede Principal', department: 'Ventas', startDate: '15/02/2022', salary: 2_100_000, status: 'Activo', eps: 'Sura EPS', pension: 'Porvenir', arl: 'Sura ARL', bank: 'Bancolombia', account: '•••• 4582' },
  { id: 'EMP-002', initials: 'CR', name: 'Carlos Ramírez', document: 'CC 79.456.123', role: 'Administrador', contract: 'Término indefinido', branch: 'Sede Norte', department: 'Administración', startDate: '08/06/2021', salary: 3_800_000, status: 'Activo', eps: 'Sanitas EPS', pension: 'Colpensiones', arl: 'Sura ARL', bank: 'Davivienda', account: '•••• 1098' },
  { id: 'EMP-003', initials: 'SN', name: 'Sofía Navarro', document: 'CC 1.019.876.543', role: 'Cocinera', contract: 'Término fijo', branch: 'Sede Principal', department: 'Cocina', startDate: '22/08/2023', salary: 1_650_000, status: 'Activo', eps: 'Nueva EPS', pension: 'Protección', arl: 'Colmena ARL', bank: 'Nequi', account: '•••• 7712' },
  { id: 'EMP-004', initials: 'JD', name: 'Juan David Torres', document: 'CC 1.098.765.432', role: 'Domiciliario', contract: 'Obra o labor', branch: 'Sede Sur', department: 'Operaciones', startDate: '03/01/2024', salary: 1_500_000, status: 'Activo', eps: 'Sura EPS', pension: 'Porvenir', arl: 'Positiva ARL', bank: 'Bancolombia', account: '•••• 3341' },
  { id: 'EMP-005', initials: 'VA', name: 'Valentina Arias', document: 'CC 1.023.445.678', role: 'Contadora', contract: 'Término indefinido', branch: 'Sede Principal', department: 'Finanzas', startDate: '10/04/2020', salary: 4_200_000, status: 'Activo', eps: 'Sanitas EPS', pension: 'Colfondos', arl: 'Sura ARL', bank: 'Bancolombia', account: '•••• 9055' },
  { id: 'EMP-006', initials: 'MG', name: 'Mateo Gómez', document: 'CC 1.011.223.344', role: 'Mesero', contract: 'Término fijo', branch: 'Sede Norte', department: 'Servicio', startDate: '14/11/2023', salary: 1_500_000, status: 'Activo', eps: 'Compensar', pension: 'Protección', arl: 'Sura ARL', bank: 'Daviplata', account: '•••• 2468' },
  { id: 'EMP-007', initials: 'PC', name: 'Paula Castillo', document: 'CC 52.123.987', role: 'Coordinadora', contract: 'Término indefinido', branch: 'Sede Principal', department: 'Operaciones', startDate: '27/09/2019', salary: 3_200_000, status: 'Inactivo', eps: 'Sura EPS', pension: 'Porvenir', arl: 'Sura ARL', bank: 'Bancolombia', account: '•••• 6182' },
]

export const liquidations: PayrollLiquidation[] = [
  { id: 'LIQ-2025-06-001', employee: 'Laura Martínez', initials: 'LR', contract: 'Indefinido', base: 2_100_000, devengado: 2_310_000, deductions: 184_800, net: 2_125_200, employerCost: 2_889_000, status: 'Aprobada' },
  { id: 'LIQ-2025-06-002', employee: 'Carlos Ramírez', initials: 'CR', contract: 'Indefinido', base: 3_800_000, devengado: 3_800_000, deductions: 304_000, net: 3_496_000, employerCost: 5_225_000, status: 'Aprobada' },
  { id: 'LIQ-2025-06-003', employee: 'Sofía Navarro', initials: 'SN', contract: 'Fijo', base: 1_650_000, devengado: 1_650_000, deductions: 132_000, net: 1_518_000, employerCost: 2_266_500, status: 'Pendiente de aprobación' },
  { id: 'LIQ-2025-06-004', employee: 'Juan David Torres', initials: 'JD', contract: 'Obra o labor', base: 1_500_000, devengado: 1_620_000, deductions: 129_600, net: 1_490_400, employerCost: 2_062_500, status: 'En revisión' },
  { id: 'LIQ-2025-06-005', employee: 'Valentina Arias', initials: 'VA', contract: 'Indefinido', base: 4_200_000, devengado: 4_200_000, deductions: 336_000, net: 3_864_000, employerCost: 5_775_000, status: 'Aprobada' },
  { id: 'LIQ-2025-06-006', employee: 'Mateo Gómez', initials: 'MG', contract: 'Fijo', base: 1_500_000, devengado: 1_575_000, deductions: 126_000, net: 1_449_000, employerCost: 2_062_500, status: 'Borrador' },
]

export const novelties: PayrollNovelty[] = [
  { id: 'NOV-084', employee: 'Laura Martínez', initials: 'LR', type: 'Comisión de ventas', period: 'Junio 2025', quantity: '1', value: 210_000, status: 'Aprobada', registeredBy: 'Carlos Ramírez', date: '26/06/2025' },
  { id: 'NOV-083', employee: 'Juan David Torres', initials: 'JD', type: 'Hora extra diurna', period: 'Junio 2025', quantity: '8 horas', value: 60_000, status: 'Pendiente', registeredBy: 'Paula Castillo', date: '25/06/2025' },
  { id: 'NOV-082', employee: 'Sofía Navarro', initials: 'SN', type: 'Incapacidad común', period: 'Junio 2025', quantity: '2 días', value: 110_000, status: 'Pendiente', registeredBy: 'Carlos Ramírez', date: '24/06/2025' },
  { id: 'NOV-081', employee: 'Mateo Gómez', initials: 'MG', type: 'Recargo nocturno', period: 'Junio 2025', quantity: '12 horas', value: 94_000, status: 'Aprobada', registeredBy: 'Paula Castillo', date: '23/06/2025' },
  { id: 'NOV-080', employee: 'Valentina Arias', initials: 'VA', type: 'Bonificación', period: 'Junio 2025', quantity: '1', value: 350_000, status: 'Rechazada', registeredBy: 'Carlos Ramírez', date: '20/06/2025' },
]

export const payments: PayrollPayment[] = [
  { id: 'PAG-025', employee: 'Laura Martínez', period: 'Mayo 2025', net: 2_085_200, date: '05/06/2025', method: 'Bancolombia', status: 'Pagado' },
  { id: 'PAG-024', employee: 'Carlos Ramírez', period: 'Mayo 2025', net: 3_496_000, date: '05/06/2025', method: 'Davivienda', status: 'Pagado' },
  { id: 'PAG-023', employee: 'Sofía Navarro', period: 'Mayo 2025', net: 1_518_000, date: '05/06/2025', method: 'Nequi', status: 'Pagado' },
  { id: 'PAG-022', employee: 'Juan David Torres', period: 'Junio 2025', net: 1_490_400, date: '30/06/2025', method: 'Bancolombia', status: 'Programado' },
]

export const costTrend = [
  { label: 'Ene', value: 28_400_000 }, { label: 'Feb', value: 29_100_000 }, { label: 'Mar', value: 30_250_000 },
  { label: 'Abr', value: 31_800_000 }, { label: 'May', value: 32_400_000 }, { label: 'Jun', value: 34_280_000 },
]

export const conceptDistribution = [
  { label: 'Salarios', value: 22_980_000 }, { label: 'Prestaciones', value: 4_820_000 },
  { label: 'Seguridad social', value: 4_160_000 }, { label: 'Comisiones', value: 1_240_000 }, { label: 'Otros', value: 1_080_000 },
]

export const benefitRows = [
  { concept: 'Cesantías', period: 'Junio 2025', employees: 6, base: 15_750_000, value: 1_312_500, status: 'Causado' },
  { concept: 'Intereses a las cesantías', period: 'Junio 2025', employees: 6, base: 15_750_000, value: 13_125, status: 'Causado' },
  { concept: 'Prima de servicios', period: 'Junio 2025', employees: 6, base: 15_750_000, value: 1_312_500, status: 'Pagado' },
  { concept: 'Vacaciones', period: 'Junio 2025', employees: 6, base: 15_750_000, value: 656_250, status: 'Causado' },
]

export const socialSecurity = [
  { concept: 'Salud', employee: 1_346_400, employer: 2_692_800, total: 4_039_200, entity: 'EPS varias', due: '05/07/2025' },
  { concept: 'Pensión', employee: 1_346_400, employer: 3_230_400, total: 4_576_800, entity: 'Fondos varios', due: '05/07/2025' },
  { concept: 'ARL', employee: 0, employer: 541_900, total: 541_900, entity: 'Sura ARL', due: '05/07/2025' },
  { concept: 'Caja / SENA / ICBF', employee: 0, employer: 1_212_000, total: 1_212_000, entity: 'CCF varias', due: '05/07/2025' },
]

export const auditRows = [
  { date: '28/06/2025 10:42', user: 'Carlos Ramírez', action: 'Aprobó liquidación', record: 'LIQ-2025-06-001', detail: 'Aprobación del período junio 2025' },
  { date: '27/06/2025 16:18', user: 'Paula Castillo', action: 'Registró novedad', record: 'NOV-084', detail: 'Comisión de ventas de Laura Martínez' },
  { date: '26/06/2025 09:12', user: 'Valentina Arias', action: 'Actualizó contrato', record: 'CTR-006', detail: 'Modificación salarial' },
  { date: '25/06/2025 14:30', user: 'Carlos Ramírez', action: 'Cerró período', record: 'PER-2025-05', detail: 'Cierre de nómina mayo 2025' },
]

export const formatCOP = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
export const formatShortCOP = (value: number) => value >= 1_000_000 ? `$${(value / 1_000_000).toFixed(1).replace('.', ',')} M` : formatCOP(value)
