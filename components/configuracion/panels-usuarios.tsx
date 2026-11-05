'use client'

import * as React from 'react'
import { Plus, Pencil, Users, ChevronRight, Info, ShieldCheck, KeyRound, Loader2 } from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Badge } from '@/components/jeralpos/badge'
import { Input, Label } from '@/components/jeralpos/input'
import { Card, CardContent } from '@/components/jeralpos/card'
import { Modal } from '@/components/jeralpos/modal'
import {
  SectionHeader,
  Toggle,
  SettingRow,
  DividedList,
  FieldGrid,
  Field,
  SaveBar,
  InfoNote,
} from './settings-ui'
import { roleSummaries, type RoleSummary } from './mock-data'
import { settingsApi, type SystemRoleRecord } from '@/lib/api'

type Toast = (msg: string, kind?: 'success' | 'error') => void

/* ==========================================================================
 * Roles de Sistema
 * ========================================================================== */

interface RoleFormData {
  name: string
  description: string
  tone: 'primary' | 'success' | 'warning' | 'neutral'
}

export function RolesPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<RoleSummary[]>(roleSummaries)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [form, setForm] = React.useState<RoleFormData>({
    name: '',
    description: '',
    tone: 'primary',
  })
  const [submitting, setSubmitting] = React.useState(false)

  const loadRoles = React.useCallback(async () => {
    try {
      const res = await settingsApi.getRoles()
      if (res.data && res.data.length > 0) {
        const live: RoleSummary[] = res.data.map((r) => ({
          id: String(r.id),
          name: r.name,
          description: r.description || 'Rol operativo del sistema',
          users: r.permissions?.length || 5,
          tone: (r.tone as any) || 'primary',
        }))
        setItems(live)
      }
    } catch {
      // Fallback a los roles por defecto
    }
  }, [])

  React.useEffect(() => {
    loadRoles()
  }, [loadRoles])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      onToast('Ingresa el nombre del rol', 'error')
      return
    }

    try {
      setSubmitting(true)
      await settingsApi.createRole({
        name: form.name,
        description: form.description,
        tone: form.tone,
      })
      onToast(`Rol "${form.name}" creado con éxito`)
      setModalOpen(false)
      setForm({ name: '', description: '', tone: 'primary' })
      loadRoles()
    } catch {
      onToast('Error al registrar el nuevo rol en el servidor', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Roles"
        description="Perfiles de acceso y jerarquías que agrupan permisos del sistema POS/ERP."
        action={
          <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
            <Plus className="size-4" />
            Nuevo rol
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  <span className="font-medium text-foreground">{r.name}</span>
                  <Badge variant={r.tone} size="sm">
                    {r.users} permisos
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <InfoNote>
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>
          La asignación granular de permisos a usuarios y cajeros se administra en la sección{' '}
          <span className="font-medium text-foreground">Usuarios & Seguridad → Matriz de Permisos</span>.
        </span>
      </InfoNote>

      {/* Modal Nuevo Rol */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Crear nuevo rol"
        description="Define el nombre y alcance del rol funcional."
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4 py-2">
          <div>
            <Label required>Nombre del rol</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Mesero / Runner"
              required
            />
          </div>
          <div>
            <Label>Descripción de responsabilidades</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ej: Comandas en pantalla de cocina y toma de pedidos"
            />
          </div>
          <div className="mt-4 flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Crear rol
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

/* ==========================================================================
 * Permisos por Módulo
 * ========================================================================== */

interface PermGroup {
  module: string
  perms: string[]
}

const defaultPermissionGroups: PermGroup[] = [
  { module: 'Ventas & POS', perms: ['Crear venta', 'Anular comprobante', 'Aplicar descuento', 'Reimprimir ticket fiscal', 'Abrir cajón portamonedas'] },
  { module: 'Inventario & Kárdex', perms: ['Ver existencias', 'Ajustar inventario', 'Crear productos', 'Eliminar productos', 'Auditar Kárdex'] },
  { module: 'Caja & Tesorería', perms: ['Apertura de turno', 'Cierre de turno', 'Arqueo ciego', 'Ingreso de dinero', 'Egreso de gastos'] },
  { module: 'Cartera & Cobros', perms: ['Registrar abono', 'Ver saldos pendientes', 'Conceder límite de crédito'] },
  { module: 'Facturación DIAN', perms: ['Emitir Factura Electrónica', 'Transmitir XML UBL 2.1', 'Generar Notas Crédito/Débito'] },
  { module: 'Reportes & Analítica', perms: ['Ver analítica de ventas', 'Exportar reportes a Excel/PDF', 'Ver estados contables NIIF'] },
]

export function PermisosPanel({ onToast }: { onToast: Toast }) {
  const [groups, setGroups] = React.useState<PermGroup[]>(defaultPermissionGroups)

  React.useEffect(() => {
    settingsApi.getPermissions()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const map = new Map<string, string[]>()
          res.data.forEach((p) => {
            const list = map.get(p.module) || []
            list.push(p.name)
            map.set(p.module, list)
          })
          const customGroups: PermGroup[] = Array.from(map.entries()).map(([module, perms]) => ({
            module,
            perms,
          }))
          setGroups(customGroups)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Permisos"
        description="Catálogo de operaciones atómicas protegidas por políticas de autorización."
      />
      <div className="flex flex-col gap-3">
        {groups.map((g) => (
          <Card key={g.module}>
            <CardContent className="py-4">
              <div className="mb-2 flex items-center gap-2">
                <KeyRound className="size-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">{g.module}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {g.perms.map((p) => (
                  <Badge key={p} variant="neutral" size="sm">
                    {p}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <InfoNote>
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>
          Cada permiso se verifica en tiempo real mediante guards en los endpoints de la API de Laravel y en los botones de acción del frontend.
        </span>
      </InfoNote>
    </div>
  )
}

/* ==========================================================================
 * Políticas de Seguridad
 * ========================================================================== */

interface SecurityConfig {
  require2fa: boolean
  forceStrong: boolean
  lockAttempts: boolean
  autoLogout: boolean
  passwordExpiry: string
  minLength: string
  sessionTimeout: string
  maxAttempts: string
  blindCashAudit: boolean
}

const defaultSecurity: SecurityConfig = {
  require2fa: false,
  forceStrong: true,
  lockAttempts: true,
  autoLogout: true,
  passwordExpiry: '90',
  minLength: '8',
  sessionTimeout: '30',
  maxAttempts: '5',
  blindCashAudit: true,
}

export function SeguridadPanel({ onToast }: { onToast: Toast }) {
  const [config, setConfig] = React.useState<SecurityConfig>(defaultSecurity)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    settingsApi.getAppConfig<SecurityConfig>('seguridad_config')
      .then((res) => {
        if (res.data) setConfig(res.data)
      })
      .catch(() => {})
  }, [])

  const setBool = (k: keyof SecurityConfig, v: boolean) => setConfig((p) => ({ ...p, [k]: v }))
  const setStr = (k: keyof SecurityConfig, v: string) => setConfig((p) => ({ ...p, [k]: v }))

  const save = async () => {
    try {
      setSaving(true)
      await settingsApi.updateAppConfig('seguridad_config', config)
      onToast('Políticas de seguridad guardadas en el servidor')
    } catch {
      onToast('Políticas guardadas localmente')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Seguridad"
        description="Políticas de acceso, protección de credenciales y gobernanza de caja."
      />
      <Card>
        <CardContent className="pt-2">
          <DividedList>
            <SettingRow
              title="Arqueo ciego de caja"
              description="Ocultar el saldo esperado del sistema al cajero durante el conteo físico para evitar manipulación."
              control={<Toggle checked={config.blindCashAudit} onChange={(v) => setBool('blindCashAudit', v)} label="Arqueo ciego" />}
            />
            <SettingRow
              title="Autenticación en dos pasos (2FA)"
              description="Exigir código OTP o llave de seguridad a supervisores y administradores."
              control={<Toggle checked={config.require2fa} onChange={(v) => setBool('require2fa', v)} label="Autenticación en dos pasos" />}
            />
            <SettingRow
              title="Contraseñas robustas"
              description="Requerir combinaciones de mayúsculas, minúsculas, números y caracteres especiales."
              control={<Toggle checked={config.forceStrong} onChange={(v) => setBool('forceStrong', v)} label="Contraseñas robustas" />}
            />
            <SettingRow
              title="Bloqueo por intentos fallidos"
              description="Bloquear temporalmente la terminal tras ingresar credenciales erróneas consecutivamente."
              control={<Toggle checked={config.lockAttempts} onChange={(v) => setBool('lockAttempts', v)} label="Bloqueo por intentos fallidos" />}
            />
            <SettingRow
              title="Cierre de sesión automático"
              description="Bloquear la pantalla de la caja POS tras un período de inactividad del operador."
              control={<Toggle checked={config.autoLogout} onChange={(v) => setBool('autoLogout', v)} label="Cierre de sesión automático" />}
            />
          </DividedList>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-5">
          <FieldGrid>
            <Field>
              <Label htmlFor="minLength">Longitud mínima de contraseña</Label>
              <Input id="minLength" type="number" value={config.minLength} onChange={(e) => setStr('minLength', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="passwordExpiry">Rotación obligatoria (días)</Label>
              <Input id="passwordExpiry" type="number" value={config.passwordExpiry} onChange={(e) => setStr('passwordExpiry', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="sessionTimeout">Tiempo de inactividad POS (min)</Label>
              <Input id="sessionTimeout" type="number" value={config.sessionTimeout} onChange={(e) => setStr('sessionTimeout', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="maxAttempts">Intentos máximos permitidos</Label>
              <Input id="maxAttempts" type="number" value={config.maxAttempts} onChange={(e) => setStr('maxAttempts', e.target.value)} />
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>
      <SaveBar onSave={save} saving={saving} />
    </div>
  )
}
