'use client'

import * as React from 'react'
import { Mail, Smartphone, Download, DatabaseBackup, Check, Monitor, Moon, Sun, Info } from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Badge } from '@/components/jeralpos/badge'
import { Input, Select, Label } from '@/components/jeralpos/input'
import { Card, CardContent } from '@/components/jeralpos/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/jeralpos/table'
import { cn } from '@/lib/utils'
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
import {
  notificationSettings as seedNotifications,
  emailConfig,
  backups,
  backupStatusVariant,
  preferences as seedPreferences,
  appearanceConfig,
  primaryColorOptions,
  type NotificationSetting,
  type EmailConfig,
  type Preferences,
  type ThemeMode,
} from './mock-data'

type Toast = (msg: string, kind?: 'success' | 'error') => void

/* Notificaciones ---------------------------------------------------- */

export function NotificacionesPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<NotificationSetting[]>(seedNotifications)
  const [saving, setSaving] = React.useState(false)
  const setChannel = (id: string, channel: 'email' | 'push', v: boolean) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, [channel]: v } : n)))
  const save = () => {
    setSaving(true)
    window.setTimeout(() => {
      setSaving(false)
      onToast('Preferencias de notificación guardadas')
    }, 700)
  }
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Notificaciones"
        description="Elige qué eventos notificar y por cuál canal."
      />
      <Card>
        <CardContent className="pt-0">
          <div className="flex items-center justify-end gap-6 border-b border-border py-3 pr-1 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Mail className="size-3.5" /> Correo
            </span>
            <span className="flex items-center gap-1.5">
              <Smartphone className="size-3.5" /> Push
            </span>
          </div>
          <DividedList>
            {items.map((n) => (
              <div key={n.id} className="flex items-center justify-between gap-4 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.description}</p>
                </div>
                <div className="flex items-center gap-6 pr-0.5">
                  <Toggle checked={n.email} onChange={(v) => setChannel(n.id, 'email', v)} size="sm" label={`Correo para ${n.title}`} />
                  <Toggle checked={n.push} onChange={(v) => setChannel(n.id, 'push', v)} size="sm" label={`Push para ${n.title}`} />
                </div>
              </div>
            ))}
          </DividedList>
        </CardContent>
      </Card>
      <SaveBar onSave={save} saving={saving} />
    </div>
  )
}

/* Correo ------------------------------------------------------------ */

export function CorreoPanel({ onToast }: { onToast: Toast }) {
  const [form, setForm] = React.useState<EmailConfig>(emailConfig)
  const [saving, setSaving] = React.useState(false)
  const set = (k: keyof EmailConfig, v: string) => setForm((p) => ({ ...p, [k]: v }))
  const save = () => {
    setSaving(true)
    window.setTimeout(() => {
      setSaving(false)
      onToast('Configuración de correo guardada')
    }, 700)
  }
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Correo"
        description="Servidor SMTP usado para enviar correos del sistema."
        action={
          <Button variant="outline" size="md" onClick={() => onToast('Enviando correo de prueba…')}>
            Enviar prueba
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-5">
          <FieldGrid>
            <Field>
              <Label htmlFor="provider">Proveedor</Label>
              <Select id="provider" value={form.provider} onChange={(e) => set('provider', e.target.value)}>
                <option>SMTP</option>
                <option>SendGrid</option>
                <option>Amazon SES</option>
                <option>Resend</option>
              </Select>
            </Field>
            <Field>
              <Label htmlFor="encryption">Cifrado</Label>
              <Select id="encryption" value={form.encryption} onChange={(e) => set('encryption', e.target.value)}>
                <option>TLS</option>
                <option>SSL</option>
                <option>Ninguno</option>
              </Select>
            </Field>
            <Field>
              <Label htmlFor="host">Servidor</Label>
              <Input id="host" value={form.host} onChange={(e) => set('host', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="port">Puerto</Label>
              <Input id="port" value={form.port} onChange={(e) => set('port', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" value={form.username} onChange={(e) => set('username', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="fromName">Nombre remitente</Label>
              <Input id="fromName" value={form.fromName} onChange={(e) => set('fromName', e.target.value)} />
            </Field>
            <Field className="sm:col-span-2">
              <Label htmlFor="fromEmail">Correo remitente</Label>
              <Input id="fromEmail" type="email" value={form.fromEmail} onChange={(e) => set('fromEmail', e.target.value)} />
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>
      <SaveBar onSave={save} onReset={() => setForm(emailConfig)} saving={saving} />
    </div>
  )
}

/* Copias de seguridad ----------------------------------------------- */

export function RespaldoPanel({ onToast }: { onToast: Toast }) {
  const [running, setRunning] = React.useState(false)
  const [autoBackup, setAutoBackup] = React.useState(true)
  const runBackup = () => {
    setRunning(true)
    onToast('Generando copia de seguridad…')
    window.setTimeout(() => {
      setRunning(false)
      onToast('Copia de seguridad completada')
    }, 1600)
  }
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Copias de seguridad"
        description="Respaldos automáticos y manuales de la base de datos."
        action={
          <Button variant="primary" size="md" onClick={runBackup} loading={running}>
            {!running && <DatabaseBackup />}
            Generar copia
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-2">
          <DividedList>
            <SettingRow
              title="Copia automática diaria"
              description="Respaldo programado todos los días a las 3:00 a.m."
              control={
                <Toggle
                  checked={autoBackup}
                  onChange={(v) => {
                    setAutoBackup(v)
                    onToast(v ? 'Copia automática activada' : 'Copia automática desactivada')
                  }}
                  label="Copia automática diaria"
                />
              }
            />
          </DividedList>
        </CardContent>
      </Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead className="hidden md:table-cell">Tamaño</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {backups.map((b) => (
            <TableRow key={b.id}>
              <TableCell className="font-medium text-foreground">{b.date}</TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">{b.size}</TableCell>
              <TableCell>
                <Badge variant={b.type === 'Automático' ? 'primary' : 'neutral'} size="sm">
                  {b.type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={backupStatusVariant[b.status]} size="sm" dot>
                  {b.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Descargar copia del ${b.date}`}
                    onClick={() => onToast('Descarga iniciada (demo)')}
                  >
                    <Download />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/* Auditoría --------------------------------------------------------- */

const auditRows = [
  { id: 'a1', user: 'Carlos Ruiz', action: 'Modificó configuración regional', module: 'Configuración', date: '22/09/2026 10:14' },
  { id: 'a2', user: 'Ana Gómez', action: 'Creó la sucursal “Sucursal Norte”', module: 'Sucursales', date: '22/09/2026 09:02' },
  { id: 'a3', user: 'Luis Torres', action: 'Actualizó resolución DIAN', module: 'Facturación', date: '21/09/2026 16:48' },
  { id: 'a4', user: 'Carlos Ruiz', action: 'Desactivó el método de pago “Otros”', module: 'Ventas', date: '21/09/2026 14:20' },
  { id: 'a5', user: 'Marta Díaz', action: 'Generó copia de seguridad manual', module: 'Sistema', date: '20/09/2026 15:42' },
]

export function AuditoriaPanel() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Auditoría"
        description="Registro de cambios recientes en la configuración."
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Acción</TableHead>
            <TableHead className="hidden md:table-cell">Módulo</TableHead>
            <TableHead className="text-right">Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auditRows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium text-foreground">{r.user}</TableCell>
              <TableCell className="text-muted-foreground">{r.action}</TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="neutral" size="sm">
                  {r.module}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{r.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/* Preferencias ------------------------------------------------------ */

export function PreferenciasPanel({ onToast }: { onToast: Toast }) {
  const [form, setForm] = React.useState<Preferences>(seedPreferences)
  const [saving, setSaving] = React.useState(false)
  const setBool = (k: keyof Preferences, v: boolean) => setForm((p) => ({ ...p, [k]: v }))
  const save = () => {
    setSaving(true)
    window.setTimeout(() => {
      setSaving(false)
      onToast('Preferencias guardadas')
    }, 700)
  }
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Preferencias" description="Ajustes personales de uso del sistema." />
      <Card>
        <CardContent className="pt-2">
          <DividedList>
            <SettingRow
              title="Tablas compactas"
              description="Reducir el espaciado en listados y tablas"
              control={<Toggle checked={form.compactTables} onChange={(v) => setBool('compactTables', v)} label="Tablas compactas" />}
            />
            <SettingRow
              title="Mostrar consejos"
              description="Ver sugerencias contextuales dentro de la interfaz"
              control={<Toggle checked={form.showTips} onChange={(v) => setBool('showTips', v)} label="Mostrar consejos" />}
            />
            <SettingRow
              title="Confirmar antes de eliminar"
              description="Pedir confirmación en acciones destructivas"
              control={<Toggle checked={form.confirmDelete} onChange={(v) => setBool('confirmDelete', v)} label="Confirmar antes de eliminar" />}
            />
            <SettingRow
              title="Efectos de sonido"
              description="Reproducir sonidos al completar acciones en caja"
              control={<Toggle checked={form.soundEffects} onChange={(v) => setBool('soundEffects', v)} label="Efectos de sonido" />}
            />
          </DividedList>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-5">
          <FieldGrid>
            <Field>
              <Label htmlFor="itemsPerPage">Registros por página</Label>
              <Select id="itemsPerPage" value={form.itemsPerPage} onChange={(e) => setForm((p) => ({ ...p, itemsPerPage: e.target.value }))}>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Select>
            </Field>
            <Field>
              <Label htmlFor="defaultBranch">Sucursal predeterminada</Label>
              <Select id="defaultBranch" value={form.defaultBranch} onChange={(e) => setForm((p) => ({ ...p, defaultBranch: e.target.value }))}>
                <option>Sede Principal</option>
                <option>Sucursal Norte</option>
                <option>Sucursal Poblado</option>
              </Select>
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>
      <SaveBar onSave={save} onReset={() => setForm(seedPreferences)} saving={saving} />
    </div>
  )
}

/* Apariencia -------------------------------------------------------- */

const themeOptions: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Claro', icon: Sun },
  { id: 'dark', label: 'Oscuro', icon: Moon },
  { id: 'system', label: 'Sistema', icon: Monitor },
]

const sidebarOptions: { id: AppearanceSize; label: string; hint: string }[] = [
  { id: 'compact', label: 'Compacta', hint: 'Solo iconos' },
  { id: 'comfortable', label: 'Cómoda', hint: 'Iconos y texto' },
  { id: 'wide', label: 'Amplia', hint: 'Texto y descripciones' },
]

type AppearanceSize = 'compact' | 'comfortable' | 'wide'

export function AparienciaPanel({ onToast }: { onToast: Toast }) {
  const [theme, setTheme] = React.useState<ThemeMode>(appearanceConfig.theme)
  const [color, setColor] = React.useState(appearanceConfig.primaryColor)
  const [size, setSize] = React.useState<AppearanceSize>(appearanceConfig.sidebarSize)
  const [saving, setSaving] = React.useState(false)
  const save = () => {
    setSaving(true)
    window.setTimeout(() => {
      setSaving(false)
      onToast('Apariencia guardada')
    }, 700)
  }
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Apariencia" description="Personaliza el tema visual del sistema." />

      <Card>
        <CardContent className="flex flex-col gap-3 pt-5">
          <p className="text-sm font-medium text-foreground">Tema</p>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((opt) => {
              const Icon = opt.icon
              const active = theme === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  aria-pressed={active}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-colors',
                    active
                      ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary/40'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                  )}
                >
                  <Icon className="size-5" />
                  {opt.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-5">
          <p className="text-sm font-medium text-foreground">Color principal</p>
          <div className="flex flex-wrap gap-3">
            {primaryColorOptions.map((c) => {
              const active = color === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  aria-pressed={active}
                  aria-label={c.label}
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full transition-transform hover:scale-105',
                    active ? 'ring-2 ring-offset-2 ring-offset-background' : '',
                  )}
                  style={{ backgroundColor: c.swatch, ...(active ? { boxShadow: `0 0 0 2px ${c.swatch}` } : {}) }}
                >
                  {active && <Check className="size-5 text-white" />}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-5">
          <p className="text-sm font-medium text-foreground">Barra lateral</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {sidebarOptions.map((opt) => {
              const active = size === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSize(opt.id)}
                  aria-pressed={active}
                  className={cn(
                    'flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors',
                    active
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/40'
                      : 'border-border hover:border-primary/40',
                  )}
                >
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.hint}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <InfoNote>
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>El sistema respeta el modo claro/oscuro del dispositivo. La selección se aplicará al conectar la API de preferencias.</span>
      </InfoNote>

      <SaveBar onSave={save} saving={saving} />
    </div>
  )
}
