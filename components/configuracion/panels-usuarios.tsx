'use client'

import * as React from 'react'
import { Plus, Pencil, Users, ChevronRight, Info } from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Badge } from '@/components/jeralpos/badge'
import { Input, Label } from '@/components/jeralpos/input'
import { Card, CardContent } from '@/components/jeralpos/card'
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

type Toast = (msg: string, kind?: 'success' | 'error') => void

/* Roles ------------------------------------------------------------- */

export function RolesPanel({ onToast }: { onToast: Toast }) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Roles"
        description="Perfiles de acceso que agrupan permisos del sistema."
        action={
          <Button variant="primary" size="md" onClick={() => onToast('Nuevo rol (demo)')}>
            <Plus />
            Nuevo rol
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {roleSummaries.map((r: RoleSummary) => (
          <Card key={r.id}>
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{r.name}</span>
                  <Badge variant={r.tone} size="sm">
                    {r.users} usuarios
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                aria-label={`Editar rol ${r.name}`}
                onClick={() => onToast(`Editar rol ${r.name} (demo)`)}
              >
                <Pencil />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <InfoNote>
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>
          La matriz completa de permisos por módulo se administra en la sección{' '}
          <span className="font-medium text-foreground">Usuarios y Seguridad → Roles y permisos</span>.
        </span>
      </InfoNote>
    </div>
  )
}

/* Permisos ---------------------------------------------------------- */

const permissionGroups = [
  { module: 'Ventas', perms: ['Crear venta', 'Anular venta', 'Aplicar descuento', 'Reimprimir factura'] },
  { module: 'Inventario', perms: ['Ver stock', 'Ajustar inventario', 'Crear productos', 'Eliminar productos'] },
  { module: 'Cobros', perms: ['Registrar abono', 'Ver cartera', 'Condonar saldo'] },
  { module: 'Reportes', perms: ['Ver reportes', 'Exportar datos'] },
]

export function PermisosPanel({ onToast }: { onToast: Toast }) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Permisos"
        description="Acciones que pueden concederse a cada rol del sistema."
      />
      <div className="flex flex-col gap-3">
        {permissionGroups.map((g) => (
          <Card key={g.module}>
            <CardContent className="py-4">
              <p className="mb-1 text-sm font-semibold text-foreground">{g.module}</p>
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
        <span>Asigna estos permisos a cada rol desde la matriz interactiva en Usuarios y Seguridad.</span>
      </InfoNote>
    </div>
  )
}

/* Seguridad --------------------------------------------------------- */

export function SeguridadPanel({ onToast }: { onToast: Toast }) {
  const [config, setConfig] = React.useState({
    require2fa: false,
    forceStrong: true,
    lockAttempts: true,
    autoLogout: true,
    passwordExpiry: '90',
    minLength: '8',
    sessionTimeout: '30',
    maxAttempts: '5',
  })
  const [saving, setSaving] = React.useState(false)
  const setBool = (k: keyof typeof config, v: boolean) => setConfig((p) => ({ ...p, [k]: v }))
  const setStr = (k: keyof typeof config, v: string) => setConfig((p) => ({ ...p, [k]: v }))
  const save = () => {
    setSaving(true)
    window.setTimeout(() => {
      setSaving(false)
      onToast('Políticas de seguridad guardadas')
    }, 700)
  }
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Seguridad"
        description="Políticas de contraseñas y control de acceso."
      />
      <Card>
        <CardContent className="pt-2">
          <DividedList>
            <SettingRow
              title="Autenticación en dos pasos"
              description="Exigir un segundo factor al iniciar sesión"
              control={<Toggle checked={config.require2fa} onChange={(v) => setBool('require2fa', v)} label="Autenticación en dos pasos" />}
            />
            <SettingRow
              title="Contraseñas robustas"
              description="Requerir mayúsculas, números y caracteres especiales"
              control={<Toggle checked={config.forceStrong} onChange={(v) => setBool('forceStrong', v)} label="Contraseñas robustas" />}
            />
            <SettingRow
              title="Bloqueo por intentos fallidos"
              description="Bloquear la cuenta tras varios accesos incorrectos"
              control={<Toggle checked={config.lockAttempts} onChange={(v) => setBool('lockAttempts', v)} label="Bloqueo por intentos fallidos" />}
            />
            <SettingRow
              title="Cierre de sesión automático"
              description="Finalizar la sesión tras un periodo de inactividad"
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
              <Label htmlFor="passwordExpiry">Expiración de contraseña (días)</Label>
              <Input id="passwordExpiry" type="number" value={config.passwordExpiry} onChange={(e) => setStr('passwordExpiry', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="sessionTimeout">Tiempo de inactividad (min)</Label>
              <Input id="sessionTimeout" type="number" value={config.sessionTimeout} onChange={(e) => setStr('sessionTimeout', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="maxAttempts">Intentos máximos de acceso</Label>
              <Input id="maxAttempts" type="number" value={config.maxAttempts} onChange={(e) => setStr('maxAttempts', e.target.value)} />
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>
      <SaveBar onSave={save} saving={saving} />
    </div>
  )
}
