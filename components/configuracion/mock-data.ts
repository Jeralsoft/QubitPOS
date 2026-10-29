import type { BadgeProps } from '@/components/jeralpos/badge'

export type BadgeVariant = NonNullable<BadgeProps['variant']>

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export type SectionId =
  // General
  | 'empresa'
  | 'logo'
  | 'contacto'
  | 'regional'
  // Sucursales
  | 'sucursales'
  | 'cajas'
  // Inventario
  | 'unidades'
  | 'categorias'
  | 'marcas'
  | 'impuestos-inv'
  | 'listas-precios'
  | 'stock'
  // Ventas
  | 'metodos-pago'
  | 'tipos-venta'
  | 'descuentos'
  | 'impuestos-ventas'
  | 'consecutivos'
  // Facturación
  | 'prefijos'
  | 'resoluciones'
  | 'numeracion'
  | 'electronica'
  | 'dian'
  // Usuarios
  | 'roles'
  | 'permisos'
  | 'seguridad'
  // Sistema
  | 'notificaciones'
  | 'correo'
  | 'respaldo'
  | 'auditoria'
  | 'preferencias'
  | 'apariencia'

/* ------------------------------------------------------------------ */
/* Empresa                                                             */
/* ------------------------------------------------------------------ */

export interface CompanyInfo {
  tradeName: string
  legalName: string
  nit: string
  phone: string
  email: string
  address: string
  city: string
  department: string
  website: string
}

export const companyInfo: CompanyInfo = {
  tradeName: 'QUBIT POS',
  legalName: 'Qubit Soluciones POS S.A.S.',
  nit: '901.456.789-3',
  phone: '+57 604 444 8899',
  email: 'contacto@qubitpos.co',
  address: 'Calle 30 # 45-12, Local 3',
  city: 'Medellín',
  department: 'Antioquia',
  website: 'https://www.qubitpos.co',
}

export const colombiaDepartments = [
  'Antioquia',
  'Atlántico',
  'Bogotá D.C.',
  'Bolívar',
  'Boyacá',
  'Caldas',
  'Cundinamarca',
  'Nariño',
  'Risaralda',
  'Santander',
  'Valle del Cauca',
]

/* ------------------------------------------------------------------ */
/* Regional                                                            */
/* ------------------------------------------------------------------ */

export interface RegionalConfig {
  country: string
  currency: string
  timezone: string
  dateFormat: string
  numberFormat: string
  language: string
}

export const regionalConfig: RegionalConfig = {
  country: 'Colombia',
  currency: 'COP',
  timezone: 'America/Bogota',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: '1.234.567,89',
  language: 'es-CO',
}

/* ------------------------------------------------------------------ */
/* Sucursales & Cajas                                                  */
/* ------------------------------------------------------------------ */

export interface Branch {
  id: string
  name: string
  code: string
  address: string
  phone: string
  active: boolean
}

export const branches: Branch[] = [
  {
    id: 'b1',
    name: 'Sede Principal',
    code: 'SP-001',
    address: 'Calle 30 # 45-12, Medellín',
    phone: '+57 604 444 8899',
    active: true,
  },
  {
    id: 'b2',
    name: 'Sucursal Norte',
    code: 'SN-002',
    address: 'Cra 52 # 80-30, Bello',
    phone: '+57 604 555 1122',
    active: true,
  },
  {
    id: 'b3',
    name: 'Sucursal Poblado',
    code: 'SP-003',
    address: 'Cra 43A # 7-50, Medellín',
    phone: '+57 604 333 7788',
    active: true,
  },
  {
    id: 'b4',
    name: 'Bodega Central',
    code: 'BC-004',
    address: 'Autopista Sur # 12-90, Itagüí',
    phone: '+57 604 222 4455',
    active: false,
  },
]

export interface Register {
  id: string
  name: string
  branch: string
  terminal: string
  active: boolean
}

export const registers: Register[] = [
  { id: 'c1', name: 'Caja 1', branch: 'Sede Principal', terminal: 'POS-A1', active: true },
  { id: 'c2', name: 'Caja 2', branch: 'Sede Principal', terminal: 'POS-A2', active: true },
  { id: 'c3', name: 'Caja Norte', branch: 'Sucursal Norte', terminal: 'POS-B1', active: true },
  { id: 'c4', name: 'Caja Poblado', branch: 'Sucursal Poblado', terminal: 'POS-C1', active: false },
]

/* ------------------------------------------------------------------ */
/* Inventario                                                          */
/* ------------------------------------------------------------------ */

export interface UnitOfMeasure {
  id: string
  name: string
  abbr: string
  type: 'Unidad' | 'Peso' | 'Volumen' | 'Longitud'
  active: boolean
}

export const units: UnitOfMeasure[] = [
  { id: 'u1', name: 'Unidad', abbr: 'UND', type: 'Unidad', active: true },
  { id: 'u2', name: 'Kilogramo', abbr: 'KG', type: 'Peso', active: true },
  { id: 'u3', name: 'Gramo', abbr: 'G', type: 'Peso', active: true },
  { id: 'u4', name: 'Litro', abbr: 'L', type: 'Volumen', active: true },
  { id: 'u5', name: 'Caja', abbr: 'CJA', type: 'Unidad', active: true },
  { id: 'u6', name: 'Metro', abbr: 'M', type: 'Longitud', active: false },
]

export interface Category {
  id: string
  name: string
  products: number
  active: boolean
}

export const categories: Category[] = [
  { id: 'cat1', name: 'Bebidas', products: 84, active: true },
  { id: 'cat2', name: 'Alimentos', products: 156, active: true },
  { id: 'cat3', name: 'Aseo y limpieza', products: 62, active: true },
  { id: 'cat4', name: 'Papelería', products: 38, active: true },
  { id: 'cat5', name: 'Tecnología', products: 21, active: false },
]

export interface Brand {
  id: string
  name: string
  products: number
  active: boolean
}

export const brands: Brand[] = [
  { id: 'br1', name: 'Postobón', products: 32, active: true },
  { id: 'br2', name: 'Nutresa', products: 47, active: true },
  { id: 'br3', name: 'Alpina', products: 28, active: true },
  { id: 'br4', name: 'Familia', products: 19, active: true },
  { id: 'br5', name: 'Colombina', products: 24, active: true },
]

/* ------------------------------------------------------------------ */
/* Impuestos                                                           */
/* ------------------------------------------------------------------ */

export interface Tax {
  id: string
  name: string
  rate: number
  type: 'IVA' | 'INC' | 'Retención' | 'Exento'
  active: boolean
}

export const taxes: Tax[] = [
  { id: 't1', name: 'IVA General', rate: 19, type: 'IVA', active: true },
  { id: 't2', name: 'IVA Reducido', rate: 5, type: 'IVA', active: true },
  { id: 't3', name: 'Impuesto al Consumo', rate: 8, type: 'INC', active: true },
  { id: 't4', name: 'Exento de IVA', rate: 0, type: 'Exento', active: true },
  { id: 't5', name: 'Retención en la fuente', rate: 2.5, type: 'Retención', active: false },
]

/* ------------------------------------------------------------------ */
/* Listas de precios & Stock                                           */
/* ------------------------------------------------------------------ */

export interface PriceList {
  id: string
  name: string
  adjustment: string
  currency: string
  isDefault: boolean
  active: boolean
}

export const priceLists: PriceList[] = [
  { id: 'pl1', name: 'Precio público', adjustment: 'Base', currency: 'COP', isDefault: true, active: true },
  { id: 'pl2', name: 'Mayorista', adjustment: '-12%', currency: 'COP', isDefault: false, active: true },
  { id: 'pl3', name: 'Distribuidor', adjustment: '-18%', currency: 'COP', isDefault: false, active: true },
  { id: 'pl4', name: 'Promocional', adjustment: '-25%', currency: 'COP', isDefault: false, active: false },
]

export interface StockConfig {
  trackStock: boolean
  allowNegative: boolean
  lowStockAlerts: boolean
  autoDiscount: boolean
  lowStockThreshold: number
  costingMethod: string
}

export const stockConfig: StockConfig = {
  trackStock: true,
  allowNegative: false,
  lowStockAlerts: true,
  autoDiscount: true,
  lowStockThreshold: 10,
  costingMethod: 'Promedio ponderado',
}

/* ------------------------------------------------------------------ */
/* Ventas                                                              */
/* ------------------------------------------------------------------ */

export interface PaymentMethod {
  id: string
  name: string
  description: string
  active: boolean
}

export const paymentMethods: PaymentMethod[] = [
  { id: 'pm1', name: 'Efectivo', description: 'Pagos en efectivo con control de apertura y cierre de caja', active: true },
  { id: 'pm2', name: 'Tarjeta', description: 'Débito y crédito mediante datáfono o pasarela', active: true },
  { id: 'pm3', name: 'Transferencia', description: 'Transferencias bancarias y PSE', active: true },
  { id: 'pm4', name: 'Otros', description: 'Bonos, puntos y medios de pago alternativos', active: false },
]

export interface SaleType {
  id: string
  name: string
  description: string
  active: boolean
}

export const saleTypes: SaleType[] = [
  { id: 'st1', name: 'Venta directa', description: 'Facturación inmediata en punto de venta', active: true },
  { id: 'st2', name: 'Venta a crédito', description: 'Genera cuenta por cobrar al cliente', active: true },
  { id: 'st3', name: 'Cotización', description: 'Documento previo sin afectar inventario', active: true },
  { id: 'st4', name: 'Pedido', description: 'Reserva de inventario para despacho posterior', active: true },
  { id: 'st5', name: 'Domicilio', description: 'Venta con entrega a domicilio', active: false },
]

export interface Discount {
  id: string
  name: string
  type: 'Porcentaje' | 'Valor fijo'
  value: string
  scope: string
  active: boolean
}

export const discounts: Discount[] = [
  { id: 'd1', name: 'Descuento cliente frecuente', type: 'Porcentaje', value: '5%', scope: 'General', active: true },
  { id: 'd2', name: 'Promoción temporada', type: 'Porcentaje', value: '15%', scope: 'Categoría', active: true },
  { id: 'd3', name: 'Descuento por volumen', type: 'Porcentaje', value: '10%', scope: 'Producto', active: true },
  { id: 'd4', name: 'Cupón bienvenida', type: 'Valor fijo', value: '$10.000', scope: 'General', active: false },
]

/* ------------------------------------------------------------------ */
/* Consecutivos                                                        */
/* ------------------------------------------------------------------ */

export interface Sequence {
  id: string
  document: string
  prefix: string
  start: number
  current: number
  end: number
  active: boolean
}

export const sequences: Sequence[] = [
  { id: 'sq1', document: 'Factura de venta', prefix: 'FV', start: 1, current: 4821, end: 50000, active: true },
  { id: 'sq2', document: 'Factura electrónica', prefix: 'FE', start: 1, current: 2140, end: 20000, active: true },
  { id: 'sq3', document: 'Nota de crédito', prefix: 'NC', start: 1, current: 312, end: 10000, active: true },
  { id: 'sq4', document: 'Nota débito', prefix: 'ND', start: 1, current: 87, end: 10000, active: true },
  { id: 'sq5', document: 'Recibo de caja', prefix: 'RC', start: 1, current: 6503, end: 99999, active: true },
  { id: 'sq6', document: 'Cotización', prefix: 'COT', start: 1, current: 1290, end: 50000, active: false },
]

/* ------------------------------------------------------------------ */
/* Facturación                                                         */
/* ------------------------------------------------------------------ */

export interface Prefix {
  id: string
  prefix: string
  description: string
  branch: string
  active: boolean
}

export const prefixes: Prefix[] = [
  { id: 'pf1', prefix: 'FV', description: 'Facturación general sede principal', branch: 'Sede Principal', active: true },
  { id: 'pf2', prefix: 'FVN', description: 'Facturación sucursal norte', branch: 'Sucursal Norte', active: true },
  { id: 'pf3', prefix: 'FVP', description: 'Facturación sucursal poblado', branch: 'Sucursal Poblado', active: true },
]

export interface Resolution {
  id: string
  number: string
  prefix: string
  range: string
  issuedAt: string
  expiresAt: string
  status: 'Vigente' | 'Por vencer' | 'Vencida'
}

export const resolutions: Resolution[] = [
  {
    id: 'r1',
    number: '18764000123456',
    prefix: 'FV',
    range: '1 - 50.000',
    issuedAt: '15/01/2026',
    expiresAt: '15/01/2028',
    status: 'Vigente',
  },
  {
    id: 'r2',
    number: '18764000987654',
    prefix: 'FE',
    range: '1 - 20.000',
    issuedAt: '10/03/2025',
    expiresAt: '10/03/2026',
    status: 'Por vencer',
  },
  {
    id: 'r3',
    number: '18764000555000',
    prefix: 'FVN',
    range: '1 - 30.000',
    issuedAt: '01/06/2024',
    expiresAt: '01/06/2025',
    status: 'Vencida',
  },
]

export const resolutionStatusVariant: Record<Resolution['status'], BadgeVariant> = {
  Vigente: 'success',
  'Por vencer': 'warning',
  Vencida: 'danger',
}

export interface DianConfig {
  environment: 'Pruebas' | 'Producción'
  companyType: string
  fiscalResponsibility: string
  testSetId: string
  softwareId: string
  technicalKey: string
  connected: boolean
}

export const dianConfig: DianConfig = {
  environment: 'Pruebas',
  companyType: 'Persona jurídica',
  fiscalResponsibility: 'O-13 - Gran contribuyente',
  testSetId: 'a1b2c3d4-0000-0000-0000-000000000000',
  softwareId: 'SW-JERALPOS-001',
  technicalKey: '••••••••••••••••••••',
  connected: false,
}

/* ------------------------------------------------------------------ */
/* Usuarios (referencia)                                               */
/* ------------------------------------------------------------------ */

export interface RoleSummary {
  id: string
  name: string
  users: number
  description: string
  tone: BadgeVariant
}

export const roleSummaries: RoleSummary[] = [
  { id: 'ro1', name: 'Administrador', users: 3, description: 'Acceso total al sistema', tone: 'danger' },
  { id: 'ro2', name: 'Supervisor', users: 5, description: 'Gestión de operación y reportes', tone: 'warning' },
  { id: 'ro3', name: 'Cajero', users: 12, description: 'Punto de venta y cobros', tone: 'primary' },
  { id: 'ro4', name: 'Inventario', users: 4, description: 'Gestión de stock y productos', tone: 'success' },
  { id: 'ro5', name: 'Contador', users: 2, description: 'Facturación y reportes contables', tone: 'neutral' },
]

/* ------------------------------------------------------------------ */
/* Sistema                                                             */
/* ------------------------------------------------------------------ */

export interface NotificationSetting {
  id: string
  title: string
  description: string
  email: boolean
  push: boolean
}

export const notificationSettings: NotificationSetting[] = [
  { id: 'n1', title: 'Stock bajo', description: 'Avisar cuando un producto llegue al mínimo', email: true, push: true },
  { id: 'n2', title: 'Cierre de caja', description: 'Resumen al cerrar cada turno de caja', email: true, push: false },
  { id: 'n3', title: 'Cartera vencida', description: 'Recordatorios de cuentas por cobrar', email: true, push: true },
  { id: 'n4', title: 'Resolución por vencer', description: 'Alertar antes de vencer la resolución DIAN', email: true, push: true },
  { id: 'n5', title: 'Nuevas ventas', description: 'Notificar cada venta registrada', email: false, push: false },
]

export interface EmailConfig {
  provider: string
  host: string
  port: string
  username: string
  encryption: string
  fromName: string
  fromEmail: string
}

export const emailConfig: EmailConfig = {
  provider: 'SMTP',
  host: 'smtp.jeralpos.co',
  port: '587',
  username: 'notificaciones@jeralpos.co',
  encryption: 'TLS',
  fromName: 'JERALPOS',
  fromEmail: 'notificaciones@jeralpos.co',
}

export interface Backup {
  id: string
  date: string
  size: string
  type: 'Automático' | 'Manual'
  status: 'Completado' | 'En progreso' | 'Fallido'
}

export const backups: Backup[] = [
  { id: 'bk1', date: '22/09/2026 03:00', size: '248 MB', type: 'Automático', status: 'Completado' },
  { id: 'bk2', date: '21/09/2026 03:00', size: '246 MB', type: 'Automático', status: 'Completado' },
  { id: 'bk3', date: '20/09/2026 15:42', size: '245 MB', type: 'Manual', status: 'Completado' },
  { id: 'bk4', date: '20/09/2026 03:00', size: '244 MB', type: 'Automático', status: 'Completado' },
]

export const backupStatusVariant: Record<Backup['status'], BadgeVariant> = {
  Completado: 'success',
  'En progreso': 'primary',
  Fallido: 'danger',
}

export interface Preferences {
  compactTables: boolean
  showTips: boolean
  confirmDelete: boolean
  soundEffects: boolean
  autoLogout: boolean
  itemsPerPage: string
  defaultBranch: string
}

export const preferences: Preferences = {
  compactTables: false,
  showTips: true,
  confirmDelete: true,
  soundEffects: false,
  autoLogout: true,
  itemsPerPage: '25',
  defaultBranch: 'Sede Principal',
}

/* ------------------------------------------------------------------ */
/* Apariencia                                                          */
/* ------------------------------------------------------------------ */

export type ThemeMode = 'light' | 'dark' | 'system'

export interface AppearanceConfig {
  theme: ThemeMode
  primaryColor: string
  sidebarSize: 'compact' | 'comfortable' | 'wide'
}

export const appearanceConfig: AppearanceConfig = {
  theme: 'system',
  primaryColor: 'blue',
  sidebarSize: 'comfortable',
}

export const primaryColorOptions: { id: string; label: string; swatch: string }[] = [
  { id: 'blue', label: 'Azul', swatch: '#2563eb' },
  { id: 'emerald', label: 'Esmeralda', swatch: '#059669' },
  { id: 'violet', label: 'Violeta', swatch: '#7c3aed' },
  { id: 'amber', label: 'Ámbar', swatch: '#d97706' },
  { id: 'rose', label: 'Rosa', swatch: '#e11d48' },
  { id: 'slate', label: 'Pizarra', swatch: '#475569' },
]
