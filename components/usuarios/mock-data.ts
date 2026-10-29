import {
  Shield,
  UserCog,
  Eye,
  ShoppingCart,
  Tag,
  Boxes,
  Calculator,
  type LucideIcon,
} from 'lucide-react'

export type UserStatus = 'activo' | 'inactivo' | 'bloqueado'

export interface AppUser {
  id: string
  username: string
  employee: string
  email: string
  roleId: RoleId
  branch: string
  lastAccess: string | null
  status: UserStatus
  sessions: number
  failedAttempts: number
  passwordChangedAt: string
  createdAt: string
  avatarInitials: string
}

export type RoleId =
  | 'administrador'
  | 'gerente'
  | 'supervisor'
  | 'cajero'
  | 'vendedor'
  | 'inventario'
  | 'contabilidad'

export type PermissionAction = 'ver' | 'crear' | 'editar' | 'eliminar'

export type ModuleKey =
  | 'dashboard'
  | 'ventas'
  | 'compras'
  | 'inventario'
  | 'clientes'
  | 'proveedores'
  | 'caja'
  | 'reportes'
  | 'usuarios'

export interface ModuleDef {
  key: ModuleKey
  label: string
}

export const modules: ModuleDef[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'ventas', label: 'Ventas' },
  { key: 'compras', label: 'Compras' },
  { key: 'inventario', label: 'Inventario' },
  { key: 'clientes', label: 'Clientes' },
  { key: 'proveedores', label: 'Proveedores' },
  { key: 'caja', label: 'Caja' },
  { key: 'reportes', label: 'Reportes' },
  { key: 'usuarios', label: 'Usuarios' },
]

export const actions: PermissionAction[] = ['ver', 'crear', 'editar', 'eliminar']

export const actionLabel: Record<PermissionAction, string> = {
  ver: 'Ver',
  crear: 'Crear',
  editar: 'Editar',
  eliminar: 'Eliminar',
}

export type PermissionMatrix = Record<ModuleKey, Record<PermissionAction, boolean>>

function fullAccess(): Record<PermissionAction, boolean> {
  return { ver: true, crear: true, editar: true, eliminar: true }
}
function viewOnly(): Record<PermissionAction, boolean> {
  return { ver: true, crear: false, editar: false, eliminar: false }
}
function noAccess(): Record<PermissionAction, boolean> {
  return { ver: false, crear: false, editar: false, eliminar: false }
}
function crud(ver: boolean, crear: boolean, editar: boolean, eliminar: boolean) {
  return { ver, crear, editar, eliminar }
}

export interface Role {
  id: RoleId
  name: string
  description: string
  icon: LucideIcon
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
  system: boolean
  permissions: PermissionMatrix
}

export const roles: Role[] = [
  {
    id: 'administrador',
    name: 'Administrador',
    description: 'Control total del sistema y la configuración.',
    icon: Shield,
    tone: 'danger',
    system: true,
    permissions: {
      dashboard: viewOnly(),
      ventas: fullAccess(),
      compras: fullAccess(),
      inventario: fullAccess(),
      clientes: fullAccess(),
      proveedores: fullAccess(),
      caja: fullAccess(),
      reportes: viewOnly(),
      usuarios: fullAccess(),
    },
  },
  {
    id: 'gerente',
    name: 'Gerente',
    description: 'Supervisa operaciones, reportes y equipos.',
    icon: UserCog,
    tone: 'primary',
    system: true,
    permissions: {
      dashboard: viewOnly(),
      ventas: fullAccess(),
      compras: fullAccess(),
      inventario: crud(true, true, true, false),
      clientes: fullAccess(),
      proveedores: fullAccess(),
      caja: crud(true, true, true, false),
      reportes: viewOnly(),
      usuarios: crud(true, false, false, false),
    },
  },
  {
    id: 'supervisor',
    name: 'Supervisor',
    description: 'Coordina cajas, ventas y turnos.',
    icon: Eye,
    tone: 'primary',
    system: true,
    permissions: {
      dashboard: viewOnly(),
      ventas: crud(true, true, true, false),
      compras: crud(true, true, false, false),
      inventario: crud(true, true, true, false),
      clientes: crud(true, true, true, false),
      proveedores: viewOnly(),
      caja: fullAccess(),
      reportes: viewOnly(),
      usuarios: noAccess(),
    },
  },
  {
    id: 'cajero',
    name: 'Cajero',
    description: 'Registra ventas y movimientos de caja.',
    icon: Calculator,
    tone: 'success',
    system: true,
    permissions: {
      dashboard: viewOnly(),
      ventas: crud(true, true, false, false),
      compras: noAccess(),
      inventario: viewOnly(),
      clientes: crud(true, true, false, false),
      proveedores: noAccess(),
      caja: crud(true, true, true, false),
      reportes: noAccess(),
      usuarios: noAccess(),
    },
  },
  {
    id: 'vendedor',
    name: 'Vendedor',
    description: 'Gestiona ventas y atención a clientes.',
    icon: Tag,
    tone: 'success',
    system: true,
    permissions: {
      dashboard: viewOnly(),
      ventas: crud(true, true, false, false),
      compras: noAccess(),
      inventario: viewOnly(),
      clientes: crud(true, true, true, false),
      proveedores: noAccess(),
      caja: noAccess(),
      reportes: noAccess(),
      usuarios: noAccess(),
    },
  },
  {
    id: 'inventario',
    name: 'Inventario',
    description: 'Administra stock, compras y proveedores.',
    icon: Boxes,
    tone: 'warning',
    system: true,
    permissions: {
      dashboard: viewOnly(),
      ventas: noAccess(),
      compras: fullAccess(),
      inventario: fullAccess(),
      clientes: noAccess(),
      proveedores: fullAccess(),
      caja: noAccess(),
      reportes: viewOnly(),
      usuarios: noAccess(),
    },
  },
  {
    id: 'contabilidad',
    name: 'Contabilidad',
    description: 'Consulta financiera, caja y reportes.',
    icon: Calculator,
    tone: 'neutral',
    system: true,
    permissions: {
      dashboard: viewOnly(),
      ventas: viewOnly(),
      compras: viewOnly(),
      inventario: viewOnly(),
      clientes: viewOnly(),
      proveedores: viewOnly(),
      caja: crud(true, true, true, false),
      reportes: viewOnly(),
      usuarios: noAccess(),
    },
  },
]

export const roleName: Record<RoleId, string> = roles.reduce(
  (acc, r) => {
    acc[r.id] = r.name
    return acc
  },
  {} as Record<RoleId, string>,
)

export const branches = [
  'Sede Principal',
  'Sucursal Norte',
  'Sucursal Sur',
  'Sucursal Centro',
  'Bodega Central',
]

export const employees = [
  'Carlos Andrés Ruiz',
  'Ana María Torres',
  'Miguel Ángel Rojas',
  'Laura Fernández',
  'Jorge Martínez',
  'Diana Carolina Peña',
  'Santiago Gómez',
  'Valentina Ospina',
  'Andrés Felipe Cardona',
  'Paola Restrepo',
  'Julián Herrera',
  'Camila Vargas',
]

export const users: AppUser[] = [
  {
    id: 'u1',
    username: 'cruiz',
    employee: 'Carlos Andrés Ruiz',
    email: 'carlos.ruiz@jeralpos.co',
    roleId: 'administrador',
    branch: 'Sede Principal',
    lastAccess: '22 sep 2026, 08:14',
    status: 'activo',
    sessions: 2,
    failedAttempts: 0,
    passwordChangedAt: '02 sep 2026',
    createdAt: '14 ene 2025',
    avatarInitials: 'CR',
  },
  {
    id: 'u2',
    username: 'atorres',
    employee: 'Ana María Torres',
    email: 'ana.torres@jeralpos.co',
    roleId: 'gerente',
    branch: 'Sede Principal',
    lastAccess: '22 sep 2026, 07:52',
    status: 'activo',
    sessions: 1,
    failedAttempts: 0,
    passwordChangedAt: '18 ago 2026',
    createdAt: '03 feb 2025',
    avatarInitials: 'AT',
  },
  {
    id: 'u3',
    username: 'mrojas',
    employee: 'Miguel Ángel Rojas',
    email: 'miguel.rojas@jeralpos.co',
    roleId: 'supervisor',
    branch: 'Sucursal Norte',
    lastAccess: '21 sep 2026, 19:40',
    status: 'activo',
    sessions: 1,
    failedAttempts: 1,
    passwordChangedAt: '30 jul 2026',
    createdAt: '20 feb 2025',
    avatarInitials: 'MR',
  },
  {
    id: 'u4',
    username: 'lfernandez',
    employee: 'Laura Fernández',
    email: 'laura.fernandez@jeralpos.co',
    roleId: 'cajero',
    branch: 'Sucursal Norte',
    lastAccess: '22 sep 2026, 09:03',
    status: 'activo',
    sessions: 1,
    failedAttempts: 0,
    passwordChangedAt: '11 sep 2026',
    createdAt: '15 mar 2025',
    avatarInitials: 'LF',
  },
  {
    id: 'u5',
    username: 'jmartinez',
    employee: 'Jorge Martínez',
    email: 'jorge.martinez@jeralpos.co',
    roleId: 'vendedor',
    branch: 'Sucursal Sur',
    lastAccess: '20 sep 2026, 16:22',
    status: 'activo',
    sessions: 0,
    failedAttempts: 0,
    passwordChangedAt: '05 jun 2026',
    createdAt: '01 abr 2025',
    avatarInitials: 'JM',
  },
  {
    id: 'u6',
    username: 'dpena',
    employee: 'Diana Carolina Peña',
    email: 'diana.pena@jeralpos.co',
    roleId: 'contabilidad',
    branch: 'Sede Principal',
    lastAccess: '22 sep 2026, 08:41',
    status: 'activo',
    sessions: 1,
    failedAttempts: 0,
    passwordChangedAt: '28 ago 2026',
    createdAt: '12 abr 2025',
    avatarInitials: 'DP',
  },
  {
    id: 'u7',
    username: 'sgomez',
    employee: 'Santiago Gómez',
    email: 'santiago.gomez@jeralpos.co',
    roleId: 'inventario',
    branch: 'Bodega Central',
    lastAccess: '21 sep 2026, 14:10',
    status: 'activo',
    sessions: 1,
    failedAttempts: 0,
    passwordChangedAt: '19 jul 2026',
    createdAt: '22 abr 2025',
    avatarInitials: 'SG',
  },
  {
    id: 'u8',
    username: 'vospina',
    employee: 'Valentina Ospina',
    email: 'valentina.ospina@jeralpos.co',
    roleId: 'vendedor',
    branch: 'Sucursal Centro',
    lastAccess: '18 sep 2026, 11:35',
    status: 'inactivo',
    sessions: 0,
    failedAttempts: 0,
    passwordChangedAt: '14 may 2026',
    createdAt: '05 may 2025',
    avatarInitials: 'VO',
  },
  {
    id: 'u9',
    username: 'acardona',
    employee: 'Andrés Felipe Cardona',
    email: 'andres.cardona@jeralpos.co',
    roleId: 'cajero',
    branch: 'Sucursal Sur',
    lastAccess: '19 sep 2026, 20:05',
    status: 'bloqueado',
    sessions: 0,
    failedAttempts: 5,
    passwordChangedAt: '02 mar 2026',
    createdAt: '18 may 2025',
    avatarInitials: 'AC',
  },
  {
    id: 'u10',
    username: 'prestrepo',
    employee: 'Paola Restrepo',
    email: 'paola.restrepo@jeralpos.co',
    roleId: 'supervisor',
    branch: 'Sucursal Centro',
    lastAccess: '22 sep 2026, 06:58',
    status: 'activo',
    sessions: 1,
    failedAttempts: 0,
    passwordChangedAt: '25 ago 2026',
    createdAt: '02 jun 2025',
    avatarInitials: 'PR',
  },
  {
    id: 'u11',
    username: 'jherrera',
    employee: 'Julián Herrera',
    email: 'julian.herrera@jeralpos.co',
    roleId: 'inventario',
    branch: 'Bodega Central',
    lastAccess: '17 sep 2026, 09:12',
    status: 'inactivo',
    sessions: 0,
    failedAttempts: 2,
    passwordChangedAt: '10 abr 2026',
    createdAt: '15 jun 2025',
    avatarInitials: 'JH',
  },
  {
    id: 'u12',
    username: 'cvargas',
    employee: 'Camila Vargas',
    email: 'camila.vargas@jeralpos.co',
    roleId: 'vendedor',
    branch: 'Sucursal Norte',
    lastAccess: '22 sep 2026, 08:30',
    status: 'activo',
    sessions: 1,
    failedAttempts: 0,
    passwordChangedAt: '01 sep 2026',
    createdAt: '28 jun 2025',
    avatarInitials: 'CV',
  },
]

export const statusConfig: Record<
  UserStatus,
  { label: string; variant: 'success' | 'neutral' | 'danger' }
> = {
  activo: { label: 'Activo', variant: 'success' },
  inactivo: { label: 'Inactivo', variant: 'neutral' },
  bloqueado: { label: 'Bloqueado', variant: 'danger' },
}

export const roleToneVariant: Record<Role['tone'], 'primary' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  neutral: 'neutral',
}

export type AuditAction =
  | 'inicio_sesion'
  | 'cierre_sesion'
  | 'creacion'
  | 'edicion'
  | 'eliminacion'
  | 'intento_fallido'
  | 'bloqueo'
  | 'cambio_clave'

export interface AuditEntry {
  id: string
  date: string
  user: string
  action: AuditAction
  module: string
  record: string
  ip: string
  description: string
}

export const auditActionConfig: Record<
  AuditAction,
  { label: string; variant: 'success' | 'primary' | 'warning' | 'danger' | 'neutral' }
> = {
  inicio_sesion: { label: 'Inicio de sesión', variant: 'success' },
  cierre_sesion: { label: 'Cierre de sesión', variant: 'neutral' },
  creacion: { label: 'Creación', variant: 'primary' },
  edicion: { label: 'Edición', variant: 'warning' },
  eliminacion: { label: 'Eliminación', variant: 'danger' },
  intento_fallido: { label: 'Intento fallido', variant: 'danger' },
  bloqueo: { label: 'Bloqueo', variant: 'danger' },
  cambio_clave: { label: 'Cambio de clave', variant: 'primary' },
}

export const auditLog: AuditEntry[] = [
  {
    id: 'a1',
    date: '22 sep 2026, 09:03',
    user: 'lfernandez',
    action: 'inicio_sesion',
    module: 'Seguridad',
    record: 'SES-8841',
    ip: '190.85.12.44',
    description: 'Inicio de sesión exitoso desde Sucursal Norte.',
  },
  {
    id: 'a2',
    date: '22 sep 2026, 08:52',
    user: 'cruiz',
    action: 'edicion',
    module: 'Usuarios',
    record: 'USR-0012',
    ip: '190.85.12.10',
    description: 'Actualizó el rol de Camila Vargas a Vendedor.',
  },
  {
    id: 'a3',
    date: '22 sep 2026, 08:41',
    user: 'dpena',
    action: 'inicio_sesion',
    module: 'Seguridad',
    record: 'SES-8840',
    ip: '190.85.12.10',
    description: 'Inicio de sesión exitoso desde Sede Principal.',
  },
  {
    id: 'a4',
    date: '22 sep 2026, 08:20',
    user: 'atorres',
    action: 'creacion',
    module: 'Ventas',
    record: 'FE-1088',
    ip: '190.85.12.10',
    description: 'Registró la factura FE-1088 por $2.480.000.',
  },
  {
    id: 'a5',
    date: '21 sep 2026, 20:15',
    user: 'acardona',
    action: 'bloqueo',
    module: 'Seguridad',
    record: 'USR-0009',
    ip: '181.49.77.91',
    description: 'Cuenta bloqueada tras 5 intentos fallidos consecutivos.',
  },
  {
    id: 'a6',
    date: '21 sep 2026, 20:12',
    user: 'acardona',
    action: 'intento_fallido',
    module: 'Seguridad',
    record: 'USR-0009',
    ip: '181.49.77.91',
    description: 'Intento de acceso fallido (contraseña incorrecta).',
  },
  {
    id: 'a7',
    date: '21 sep 2026, 19:40',
    user: 'mrojas',
    action: 'edicion',
    module: 'Inventario',
    record: 'PRD-3391',
    ip: '190.85.30.22',
    description: 'Ajustó el stock de Café Molido Premium 500g.',
  },
  {
    id: 'a8',
    date: '21 sep 2026, 18:05',
    user: 'sgomez',
    action: 'creacion',
    module: 'Compras',
    record: 'OC-0442',
    ip: '190.85.44.5',
    description: 'Creó la orden de compra OC-0442 a Distribuidora El Sol.',
  },
  {
    id: 'a9',
    date: '21 sep 2026, 16:22',
    user: 'jmartinez',
    action: 'cierre_sesion',
    module: 'Seguridad',
    record: 'SES-8830',
    ip: '186.29.10.7',
    description: 'Cierre de sesión manual desde Sucursal Sur.',
  },
  {
    id: 'a10',
    date: '21 sep 2026, 15:48',
    user: 'cruiz',
    action: 'eliminacion',
    module: 'Clientes',
    record: 'CLI-0771',
    ip: '190.85.12.10',
    description: 'Eliminó un registro de cliente duplicado.',
  },
  {
    id: 'a11',
    date: '21 sep 2026, 11:30',
    user: 'prestrepo',
    action: 'cambio_clave',
    module: 'Seguridad',
    record: 'USR-0010',
    ip: '190.85.60.14',
    description: 'Cambio de contraseña completado correctamente.',
  },
  {
    id: 'a12',
    date: '20 sep 2026, 16:22',
    user: 'jmartinez',
    action: 'inicio_sesion',
    module: 'Seguridad',
    record: 'SES-8810',
    ip: '186.29.10.7',
    description: 'Inicio de sesión exitoso desde Sucursal Sur.',
  },
]

export interface ActiveSession {
  id: string
  user: string
  device: string
  location: string
  ip: string
  started: string
  current: boolean
}

export const activeSessions: ActiveSession[] = [
  {
    id: 'ses1',
    user: 'cruiz',
    device: 'Chrome · Windows 11',
    location: 'Sede Principal',
    ip: '190.85.12.10',
    started: 'Hoy, 08:14',
    current: true,
  },
  {
    id: 'ses2',
    user: 'cruiz',
    device: 'App móvil · Android',
    location: 'Sede Principal',
    ip: '190.85.12.55',
    started: 'Hoy, 07:20',
    current: false,
  },
  {
    id: 'ses3',
    user: 'atorres',
    device: 'Edge · Windows 11',
    location: 'Sede Principal',
    ip: '190.85.12.11',
    started: 'Hoy, 07:52',
    current: false,
  },
  {
    id: 'ses4',
    user: 'lfernandez',
    device: 'Chrome · Windows 10',
    location: 'Sucursal Norte',
    ip: '190.85.12.44',
    started: 'Hoy, 09:03',
    current: false,
  },
  {
    id: 'ses5',
    user: 'dpena',
    device: 'Safari · macOS',
    location: 'Sede Principal',
    ip: '190.85.12.10',
    started: 'Hoy, 08:41',
    current: false,
  },
  {
    id: 'ses6',
    user: 'cvargas',
    device: 'Chrome · Windows 11',
    location: 'Sucursal Norte',
    ip: '190.85.12.48',
    started: 'Hoy, 08:30',
    current: false,
  },
]

export interface LoginAttempt {
  id: string
  user: string
  date: string
  ip: string
  result: 'exitoso' | 'fallido'
  reason?: string
}

export const loginAttempts: LoginAttempt[] = [
  { id: 'l1', user: 'lfernandez', date: '22 sep, 09:03', ip: '190.85.12.44', result: 'exitoso' },
  { id: 'l2', user: 'dpena', date: '22 sep, 08:41', ip: '190.85.12.10', result: 'exitoso' },
  { id: 'l3', user: 'cvargas', date: '22 sep, 08:30', ip: '190.85.12.48', result: 'exitoso' },
  { id: 'l4', user: 'acardona', date: '21 sep, 20:12', ip: '181.49.77.91', result: 'fallido', reason: 'Contraseña incorrecta' },
  { id: 'l5', user: 'acardona', date: '21 sep, 20:10', ip: '181.49.77.91', result: 'fallido', reason: 'Contraseña incorrecta' },
  { id: 'l6', user: 'acardona', date: '21 sep, 20:08', ip: '181.49.77.91', result: 'fallido', reason: 'Contraseña incorrecta' },
  { id: 'l7', user: 'jherrera', date: '17 sep, 09:12', ip: '190.85.44.9', result: 'fallido', reason: 'Usuario inactivo' },
  { id: 'l8', user: 'mrojas', date: '21 sep, 19:40', ip: '190.85.30.22', result: 'exitoso' },
]

export interface UsersSummary {
  total: number
  active: number
  inactive: number
  blocked: number
  activeSessions: number
}

export function getUsersSummary(list: AppUser[]): UsersSummary {
  return {
    total: list.length,
    active: list.filter((u) => u.status === 'activo').length,
    inactive: list.filter((u) => u.status === 'inactivo').length,
    blocked: list.filter((u) => u.status === 'bloqueado').length,
    activeSessions: list.reduce((sum, u) => sum + u.sessions, 0),
  }
}
