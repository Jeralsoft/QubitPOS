'use client'

import * as React from 'react'
import {
  Eye,
  EyeOff,
  Check,
  X,
  User,
  ShieldCheck,
  KeyRound,
  Store,
  Sparkles,
} from 'lucide-react'
import { Modal } from '@/components/jeralpos/modal'
import { Button } from '@/components/jeralpos/button'
import { Input, Select, Label, FieldHint } from '@/components/jeralpos/input'
import { cn } from '@/lib/utils'
import { branches, employees, roles, type RoleId, type UserStatus } from './mock-data'

export interface NewUserDraft {
  employee: string
  username: string
  email: string
  password: string
  roleId: RoleId
  branch: string
  status: UserStatus
  posPin?: string
  maxDiscountPct?: number
}

const emptyDraft: NewUserDraft = {
  employee: '',
  username: '',
  email: '',
  password: '',
  roleId: 'cajero',
  branch: branches[0] ?? 'Principal',
  status: 'activo',
  posPin: '1234',
  maxDiscountPct: 10,
}

function passwordChecks(pw: string) {
  return [
    { label: 'Mínimo 8 caracteres', ok: pw.length >= 8 },
    { label: 'Una mayúscula', ok: /[A-Z]/.test(pw) },
    { label: 'Un número', ok: /[0-9]/.test(pw) },
    { label: 'Un símbolo', ok: /[^A-Za-z0-9]/.test(pw) },
  ]
}

const STATUS_OPTIONS: {
  id: UserStatus
  label: string
  desc: string
  dotColor: string
  selectedClass: string
  unselectedHover: string
  badgeClass: string
}[] = [
  {
    id: 'activo',
    label: 'Activo',
    desc: 'Acceso total permitido al sistema',
    dotColor: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]',
    selectedClass: 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30 shadow-xs',
    unselectedHover: 'hover:border-emerald-500/40 hover:bg-emerald-500/5',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'inactivo',
    label: 'Inactivo',
    desc: 'Inicio de sesión temporalmente deshabilitado',
    dotColor: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]',
    selectedClass: 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30 shadow-xs',
    unselectedHover: 'hover:border-amber-500/40 hover:bg-amber-500/5',
    badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  },
  {
    id: 'bloqueado',
    label: 'Bloqueado',
    desc: 'Bloqueado por intentos o directiva de seguridad',
    dotColor: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]',
    selectedClass: 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30 shadow-xs',
    unselectedHover: 'hover:border-rose-500/40 hover:bg-rose-500/5',
    badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  },
]

export function CreateUserModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (draft: NewUserDraft) => void
}) {
  const [activeTab, setActiveTab] = React.useState<'acceso' | 'rol' | 'estado'>('acceso')
  const [draft, setDraft] = React.useState<NewUserDraft>(emptyDraft)
  const [confirm, setConfirm] = React.useState('')
  const [showPw, setShowPw] = React.useState(false)
  const [touched, setTouched] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setDraft(emptyDraft)
      setConfirm('')
      setShowPw(false)
      setTouched(false)
      setActiveTab('acceso')
    }
  }, [open])

  const checks = passwordChecks(draft.password)
  const pwStrong = checks.every((c) => c.ok)
  const confirmMatches = confirm.length > 0 && confirm === draft.password

  const set = <K extends keyof NewUserDraft>(key: K, value: NewUserDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const suggestUsername = (employee: string) => {
    const parts = employee.trim().toLowerCase().split(/\s+/)
    if (parts.length < 2) return parts[0] ?? ''
    return `${parts[0][0]}${parts[parts.length - 1]}`.replace(/[^a-z0-9]/g, '')
  }

  const valid =
    draft.employee !== '' &&
    draft.username.trim() !== '' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email) &&
    pwStrong &&
    confirmMatches

  const submit = () => {
    setTouched(true)
    if (!valid) {
      setActiveTab('acceso')
      return
    }
    onCreate(draft)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Crear nuevo usuario"
      description="Registra un nuevo usuario con credenciales, rol y directivas de seguridad para el sistema y el punto de venta."
      className="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={submit} disabled={touched && !valid}>
            <Check />
            Crear usuario
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Modal Subtabs */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab('acceso')}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors',
              activeTab === 'acceso'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <User className="size-4" />
            Acceso y Credenciales
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rol')}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors',
              activeTab === 'rol'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <ShieldCheck className="size-4" />
            Rol y Sucursal POS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('estado')}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors',
              activeTab === 'estado'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Sparkles className="size-4" />
            Estado de cuenta
          </button>
        </div>

        {/* Tab 1: Acceso */}
        {activeTab === 'acceso' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="nu-employee" required>
                Vincular a Empleado
              </Label>
              <Select
                id="nu-employee"
                value={draft.employee}
                invalid={touched && draft.employee === ''}
                onChange={(e) => {
                  const emp = e.target.value
                  set('employee', emp)
                  if (emp && draft.username === '') set('username', suggestUsername(emp))
                  if (emp && draft.email === '')
                    set('email', `${suggestUsername(emp)}@qubitpos.com`)
                }}
              >
                <option value="">Selecciona un colaborador de nómina</option>
                {employees.map((emp) => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </Select>
              {touched && draft.employee === '' && (
                <FieldHint invalid>Debes vincular el usuario a un empleado.</FieldHint>
              )}
            </div>

            <div>
              <Label htmlFor="nu-username" required>
                Nombre de usuario
              </Label>
              <Input
                id="nu-username"
                placeholder="ej. cruiz"
                value={draft.username}
                invalid={touched && draft.username.trim() === ''}
                onChange={(e) => set('username', e.target.value.toLowerCase().replace(/\s+/g, ''))}
              />
            </div>

            <div>
              <Label htmlFor="nu-email" required>
                Correo electrónico
              </Label>
              <Input
                id="nu-email"
                type="email"
                placeholder="usuario@qubitpos.com"
                value={draft.email}
                invalid={touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)}
                onChange={(e) => set('email', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="nu-password" required>
                Contraseña inicial
              </Label>
              <div className="relative">
                <Input
                  id="nu-password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pr-10"
                  value={draft.password}
                  invalid={touched && !pwStrong}
                  onChange={(e) => set('password', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground [&_svg]:size-4"
                  aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPw ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="nu-confirm" required>
                Confirmar contraseña
              </Label>
              <Input
                id="nu-confirm"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirm}
                invalid={confirm.length > 0 && !confirmMatches}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {confirm.length > 0 && !confirmMatches && (
                <FieldHint invalid>Las contraseñas no coinciden.</FieldHint>
              )}
            </div>

            {draft.password.length > 0 && (
              <div className="sm:col-span-2 rounded-lg border border-border bg-muted/40 p-3">
                <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Requisitos de seguridad
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {checks.map((c) => (
                    <span
                      key={c.label}
                      className={cn(
                        'inline-flex items-center gap-1.5 text-xs',
                        c.ok ? 'text-success font-medium' : 'text-muted-foreground'
                      )}
                    >
                      {c.ok ? (
                        <Check className="size-3.5" aria-hidden />
                      ) : (
                        <X className="size-3.5" aria-hidden />
                      )}
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Rol y POS */}
        {activeTab === 'rol' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="nu-role" required>
                Rol en el sistema
              </Label>
              <Select
                id="nu-role"
                value={draft.roleId}
                onChange={(e) => set('roleId', e.target.value as RoleId)}
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
              <FieldHint>Determina los módulos y permisos accesibles en el sistema.</FieldHint>
            </div>

            <div>
              <Label htmlFor="nu-branch" required>
                Sucursal asignada
              </Label>
              <Select
                id="nu-branch"
                value={draft.branch}
                onChange={(e) => set('branch', e.target.value)}
              >
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Select>
              <FieldHint>Punto de venta físico asociado por defecto a las transacciones.</FieldHint>
            </div>

            <div>
              <Label htmlFor="nu-pin">PIN de acceso rápido POS (4 dígitos)</Label>
              <div className="relative">
                <Input
                  id="nu-pin"
                  type="password"
                  maxLength={4}
                  placeholder="1234"
                  value={draft.posPin ?? ''}
                  onChange={(e) => set('posPin', e.target.value.replace(/\D/g, '').slice(0, 4))}
                />
                <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              </div>
              <FieldHint>Permite al cajero desbloquear la caja registradora al instante.</FieldHint>
            </div>

            <div>
              <Label htmlFor="nu-max-disc">Límite máx. de descuento en venta (%)</Label>
              <Input
                id="nu-max-disc"
                type="number"
                min={0}
                max={100}
                placeholder="10"
                value={draft.maxDiscountPct ?? ''}
                onChange={(e) => set('maxDiscountPct', Number(e.target.value))}
              />
              <FieldHint>Porcentaje máximo que puede otorgar sin requerir clave de supervisor.</FieldHint>
            </div>
          </div>
        )}

        {/* Tab 3: Estado con Semáforo */}
        {activeTab === 'estado' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Estado de la cuenta
                </Label>
                <p className="text-xs text-muted-foreground">
                  Semáforo de acceso para inicio de sesión en plataforma web y terminal POS.
                </p>
              </div>
              {(() => {
                const cur = STATUS_OPTIONS.find((s) => s.id === draft.status) ?? STATUS_OPTIONS[0]
                return (
                  <div
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all',
                      cur.badgeClass
                    )}
                  >
                    <span className={cn('size-2 rounded-full animate-pulse', cur.dotColor)} />
                    <span>{cur.label}</span>
                  </div>
                )
              })()}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
              {STATUS_OPTIONS.map((s) => {
                const isSelected = draft.status === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => set('status', s.id)}
                    className={cn(
                      'relative flex flex-col items-start gap-1.5 rounded-2xl border p-3.5 text-left transition-all select-none',
                      isSelected
                        ? s.selectedClass
                        : cn('border-border/80 bg-card text-foreground/80', s.unselectedHover)
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'size-2.5 rounded-full transition-all',
                            s.dotColor,
                            !isSelected && 'opacity-60 scale-90'
                          )}
                        />
                        <span className="text-xs font-semibold text-foreground">{s.label}</span>
                      </div>
                      {isSelected && <Check className="size-3.5 stroke-[2.5]" aria-hidden />}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">{s.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
