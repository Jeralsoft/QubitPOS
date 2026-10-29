'use client'

import * as React from 'react'
import { Eye, EyeOff, Check, X } from 'lucide-react'
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
}

const emptyDraft: NewUserDraft = {
  employee: '',
  username: '',
  email: '',
  password: '',
  roleId: 'cajero',
  branch: branches[0],
  status: 'activo',
}

function passwordChecks(pw: string) {
  return [
    { label: 'Mínimo 8 caracteres', ok: pw.length >= 8 },
    { label: 'Una mayúscula', ok: /[A-Z]/.test(pw) },
    { label: 'Un número', ok: /[0-9]/.test(pw) },
    { label: 'Un símbolo', ok: /[^A-Za-z0-9]/.test(pw) },
  ]
}

export function CreateUserModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (draft: NewUserDraft) => void
}) {
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
    return `${parts[0][0]}${parts[parts.length - 2]}`.replace(/[^a-z]/g, '')
  }

  const valid =
    draft.employee !== '' &&
    draft.username.trim() !== '' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email) &&
    pwStrong &&
    confirmMatches

  const submit = () => {
    setTouched(true)
    if (!valid) return
    onCreate(draft)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Crear usuario"
      description="Registra un nuevo acceso al sistema y asigna su rol."
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="nu-employee" required>
            Empleado
          </Label>
          <Select
            id="nu-employee"
            value={draft.employee}
            invalid={touched && draft.employee === ''}
            onChange={(e) => {
              const emp = e.target.value
              set('employee', emp)
              if (emp && draft.username === '') set('username', suggestUsername(emp))
            }}
          >
            <option value="">Selecciona un empleado</option>
            {employees.map((emp) => (
              <option key={emp} value={emp}>
                {emp}
              </option>
            ))}
          </Select>
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
            onChange={(e) => set('username', e.target.value.toLowerCase())}
          />
        </div>

        <div>
          <Label htmlFor="nu-email" required>
            Correo
          </Label>
          <Input
            id="nu-email"
            type="email"
            placeholder="usuario@jeralpos.co"
            value={draft.email}
            invalid={touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)}
            onChange={(e) => set('email', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="nu-password" required>
            Contraseña
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
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {checks.map((c) => (
                <span
                  key={c.label}
                  className={cn(
                    'inline-flex items-center gap-1.5 text-xs',
                    c.ok ? 'text-success' : 'text-muted-foreground',
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

        <div>
          <Label htmlFor="nu-role" required>
            Rol
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
        </div>

        <div>
          <Label htmlFor="nu-branch" required>
            Sucursal
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
        </div>

        <div className="sm:col-span-2">
          <Label>Estado</Label>
          <div className="flex flex-wrap gap-2">
            {(['activo', 'inactivo'] as UserStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set('status', s)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors',
                  draft.status === s
                    ? 'border-primary bg-info-muted text-primary'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent',
                )}
              >
                <span
                  className={cn(
                    'size-2 rounded-full',
                    s === 'activo' ? 'bg-success' : 'bg-muted-foreground',
                  )}
                  aria-hidden
                />
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
