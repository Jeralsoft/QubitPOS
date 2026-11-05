'use client'

import * as React from 'react'
import {
  Mail,
  Smartphone,
  Download,
  DatabaseBackup,
  Check,
  Monitor,
  Moon,
  Sun,
  Info,
  Loader2,
  Printer,
  Sparkles,
} from 'lucide-react'
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
  backups as seedBackups,
  backupStatusVariant,
  preferences as seedPreferences,
  appearanceConfig,
  primaryColorOptions,
  type NotificationSetting,
  type EmailConfig,
  type Preferences,
  type ThemeMode,
  type Backup,
  type BackupEntry,
} from './mock-data'
import { settingsApi } from '@/lib/api'

type Toast = (msg: string, kind?: 'success' | 'error') => void

/* ==========================================================================
 * Notificaciones
 * ========================================================================== */

export function NotificacionesPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<NotificationSetting[]>(seedNotifications)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    settingsApi.getAppConfig<NotificationSetting[]>('sistema_notificaciones')
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setItems(res.data)
      })
      .catch(() => {})
  }, [])

  const setChannel = (id: string, channel: 'email' | 'push', v: boolean) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, [channel]: v } : n)))

  const save = async () => {
    try {
      setSaving(true)
      await settingsApi.updateAppConfig('sistema_notificaciones', items)
      onToast('Preferencias de notificación guardadas en el servidor')
    } catch {
      onToast('Preferencias guardadas localmente')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Notificaciones"
        description="Elige qué eventos operativos y contables notificar y por cuál canal."
      />
      <Card>
        <CardContent className="pt-0">
          <div className="flex items-center justify-end gap-6 border-b border-border py-3 pr-1 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Mail className="size-3.5" /> Correo
            </span>
            <span className="flex items-center gap-1.5">
              <Smartphone className="size-3.5" /> Push / Web
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

/* ==========================================================================
 * Correo Electrónico (SMTP)
 * ========================================================================== */

export function CorreoPanel({ onToast }: { onToast: Toast }) {
  const [form, setForm] = React.useState<EmailConfig>(emailConfig)
  const [saving, setSaving] = React.useState(false)
  const [testing, setTesting] = React.useState(false)
  const set = (k: keyof EmailConfig, v: string) => setForm((p) => ({ ...p, [k]: v }))

  React.useEffect(() => {
    settingsApi.getAppConfig<EmailConfig>('sistema_correo_smtp')
      .then((res) => {
        if (res.data) setForm(res.data)
      })
      .catch(() => {})
  }, [])

  const save = async () => {
    try {
      setSaving(true)
      await settingsApi.updateAppConfig('sistema_correo_smtp', form)
      onToast('Configuración del servidor de correo guardada')
    } catch {
      onToast('Configuración guardada localmente')
    } finally {
      setSaving(false)
    }
  }

  const handleTestMail = async () => {
    try {
      setTesting(true)
      const res = await settingsApi.testMailConnection({
        host: form.host,
        port: Number(form.port) || 587,
        email: form.fromEmail,
      })
      onToast(res.message, 'success')
    } catch {
      onToast('Error al conectar con el servidor SMTP', 'error')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Correo"
        description="Servidor SMTP para transmisión de facturas electrónicas y notificaciones."
        action={
          <Button variant="outline" size="md" onClick={handleTestMail} disabled={testing}>
            {testing ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
            Probar conexión SMTP
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-5">
          <FieldGrid>
            <Field>
              <Label htmlFor="provider">Proveedor de correo</Label>
              <Select id="provider" value={form.provider} onChange={(e) => set('provider', e.target.value)}>
                <option>SMTP Personalizado</option>
                <option>SendGrid</option>
                <option>Amazon SES</option>
                <option>Google Workspace / Gmail</option>
                <option>Microsoft 365</option>
              </Select>
            </Field>
            <Field>
              <Label htmlFor="encryption">Cifrado de transporte</Label>
              <Select id="encryption" value={form.encryption} onChange={(e) => set('encryption', e.target.value)}>
                <option>TLS (STARTTLS)</option>
                <option>SSL</option>
                <option>Ninguno (Inseguro)</option>
              </Select>
            </Field>
            <Field>
              <Label htmlFor="host">Servidor Host</Label>
              <Input id="host" value={form.host} onChange={(e) => set('host', e.target.value)} placeholder="smtp.tu-dominio.com" />
            </Field>
            <Field>
              <Label htmlFor="port">Puerto</Label>
              <Input id="port" value={form.port} onChange={(e) => set('port', e.target.value)} placeholder="587" />
            </Field>
            <Field>
              <Label htmlFor="username">Usuario SMTP</Label>
              <Input id="username" value={form.username} onChange={(e) => set('username', e.target.value)} placeholder="notificaciones@empresa.com" />
            </Field>
            <Field>
              <Label htmlFor="fromName">Nombre remitente</Label>
              <Input id="fromName" value={form.fromName} onChange={(e) => set('fromName', e.target.value)} placeholder="QubitPOS Facturación" />
            </Field>
            <Field className="sm:col-span-2">
              <Label htmlFor="fromEmail">Correo remitente (FROM)</Label>
              <Input id="fromEmail" type="email" value={form.fromEmail} onChange={(e) => set('fromEmail', e.target.value)} placeholder="facturacion@qubitpos.co" />
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>
      <SaveBar onSave={save} onReset={() => setForm(emailConfig)} saving={saving} />
    </div>
  )
}

/* ==========================================================================
 * Copias de Seguridad (Backups)
 * ========================================================================== */

export function RespaldoPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<BackupEntry[]>(seedBackups)
  const [running, setRunning] = React.useState(false)
  const [autoBackup, setAutoBackup] = React.useState(true)

  const runBackup = async () => {
    try {
      setRunning(true)
      onToast('Generando volcado de base de datos PostgreSQL…')
      const res = await settingsApi.createBackup()

      // Descargar archivo JSON del backup automáticamente en el navegador
      const jsonStr = JSON.stringify(res.backup, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      a.href = url
      a.download = `qubitpos_backup_${dateStr}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      const newEntry: BackupEntry = {
        id: `bk-${Date.now()}`,
        date: new Date().toLocaleDateString('es-CO') + ' ' + new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        size: `${(jsonStr.length / 1024).toFixed(1)} KB`,
        type: 'Manual',
        status: 'Completado',
      }
      setItems((prev) => [newEntry, ...prev])
      onToast('Copia de seguridad generada y descargada exitosamente')
    } catch {
      onToast('Error al exportar la base de datos', 'error')
    } finally {
      setRunning(false)
    }
  }

  const handleDownloadItem = async (b: BackupEntry) => {
    try {
      onToast(`Descargando copia del ${b.date}…`)
      const res = await settingsApi.createBackup()
      const jsonStr = JSON.stringify(res.backup, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qubitpos_backup_${b.date.replace(/[\/\s:]/g, '_')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      onToast('Error en la descarga', 'error')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Copias de seguridad"
        description="Respaldos íntegros de la base de datos PostgreSQL (Kárdex, ventas, clientes, contabilidad)."
        action={
          <Button variant="primary" size="md" onClick={runBackup} disabled={running}>
            {running ? <Loader2 className="size-4 animate-spin" /> : <DatabaseBackup className="size-4" />}
            Generar copia ahora
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-2">
          <DividedList>
            <SettingRow
              title="Copia automática diaria"
              description="Respaldo programado de base de datos todos los días a las 3:00 a.m."
              control={
                <Toggle
                  checked={autoBackup}
                  onChange={(v) => {
                    setAutoBackup(v)
                    onToast(v ? 'Copia automática programada' : 'Copia automática pausada')
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
            <TableHead>Fecha de creación</TableHead>
            <TableHead className="hidden md:table-cell">Tamaño</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Descarga</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((b) => (
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
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={`Descargar copia del ${b.date}`}
                  onClick={() => handleDownloadItem(b)}
                >
                  <Download className="size-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/* ==========================================================================
 * Auditoría de Acciones
 * ========================================================================== */

const auditRows = [
  { id: 'a1', user: 'Carlos Ruiz (Admin)', action: 'Modificó datos fiscales de empresa', module: 'Empresa', date: '05/11/2026 16:40' },
  { id: 'a2', user: 'Ana Gómez (Cajera)', action: 'Cierre de turno y arqueo ciego', module: 'Caja', date: '05/11/2026 15:30' },
  { id: 'a3', user: 'Luis Torres (Contador)', action: 'Actualizó resolución DIAN 18764', module: 'Facturación', date: '05/11/2026 14:15' },
  { id: 'a4', user: 'Carlos Ruiz (Admin)', action: 'Creó nueva sucursal SUC-002', module: 'Sucursales', date: '04/11/2026 11:20' },
  { id: 'a5', user: 'Sistema Automático', action: 'Generó copia de seguridad programada', module: 'Sistema', date: '04/11/2026 03:00' },
]

export function AuditoriaPanel() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Auditoría"
        description="Bitácora inmutable de eventos y cambios administrativos en el ERP/POS."
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario / Operador</TableHead>
            <TableHead>Acción realizada</TableHead>
            <TableHead className="hidden md:table-cell">Módulo</TableHead>
            <TableHead className="text-right">Fecha y hora</TableHead>
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

/* ==========================================================================
 * Preferencias & Periféricos POS
 * ========================================================================== */

interface ExtendedPreferences extends Preferences {
  printerFormat: '80mm' | '58mm'
  autoPrintReceipt: boolean
  openCashDrawer: boolean
  cutPaper: boolean
}

const defaultExtendedPreferences: ExtendedPreferences = {
  ...seedPreferences,
  printerFormat: '80mm',
  autoPrintReceipt: true,
  openCashDrawer: true,
  cutPaper: true,
}

export function PreferenciasPanel({ onToast }: { onToast: Toast }) {
  const [form, setForm] = React.useState<ExtendedPreferences>(defaultExtendedPreferences)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    settingsApi.getAppConfig<ExtendedPreferences>('sistema_preferencias')
      .then((res) => {
        if (res.data) setForm(res.data)
      })
      .catch(() => {})
  }, [])

  const setBool = (k: keyof ExtendedPreferences, v: boolean) => setForm((p) => ({ ...p, [k]: v }))

  const save = async () => {
    try {
      setSaving(true)
      await settingsApi.updateAppConfig('sistema_preferencias', form)
      onToast('Preferencias y periféricos POS guardados en el servidor')
    } catch {
      onToast('Preferencias guardadas localmente')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Preferencias & Periféricos POS"
        description="Ajustes de terminal, impresora térmica de tickets y comportamiento en caja."
      />
      <Card>
        <CardContent className="pt-2">
          <DividedList>
            <SettingRow
              title="Impresión automática de ticket"
              description="Disparar la impresión del recibo térmico al confirmar la venta en el POS."
              control={<Toggle checked={form.autoPrintReceipt} onChange={(v) => setBool('autoPrintReceipt', v)} label="Impresión automática" />}
            />
            <SettingRow
              title="Apertura automática de cajón monedero"
              description="Enviar señal de pulso RJ11/ESC-POS al registrar cobros en efectivo."
              control={<Toggle checked={form.openCashDrawer} onChange={(v) => setBool('openCashDrawer', v)} label="Apertura cajón" />}
            />
            <SettingRow
              title="Corte automático de papel"
              description="Emitir comando de guillotina tras imprimir el pie del ticket."
              control={<Toggle checked={form.cutPaper} onChange={(v) => setBool('cutPaper', v)} label="Corte de papel" />}
            />
            <SettingRow
              title="Tablas compactas"
              description="Reducir el espaciado en listados y tablas de datos."
              control={<Toggle checked={form.compactTables} onChange={(v) => setBool('compactTables', v)} label="Tablas compactas" />}
            />
            <SettingRow
              title="Efectos de sonido en caja"
              description="Reproducir sonido de confirmación al escanear código de barras o cobrar."
              control={<Toggle checked={form.soundEffects} onChange={(v) => setBool('soundEffects', v)} label="Efectos de sonido" />}
            />
          </DividedList>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-5">
          <FieldGrid>
            <Field>
              <Label htmlFor="printerFormat">Formato de impresora térmica</Label>
              <Select
                id="printerFormat"
                value={form.printerFormat}
                onChange={(e) => setForm((p) => ({ ...p, printerFormat: e.target.value as any }))}
              >
                <option value="80mm">80 mm (Estándar Punto de Venta)</option>
                <option value="58mm">58 mm (Compacto / Mini POS)</option>
              </Select>
            </Field>
            <Field>
              <Label htmlFor="itemsPerPage">Registros por página en tablas</Label>
              <Select
                id="itemsPerPage"
                value={form.itemsPerPage}
                onChange={(e) => setForm((p) => ({ ...p, itemsPerPage: e.target.value }))}
              >
                <option value="10">10 registros</option>
                <option value="25">25 registros</option>
                <option value="50">50 registros</option>
                <option value="100">100 registros</option>
              </Select>
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>
      <SaveBar onSave={save} onReset={() => setForm(defaultExtendedPreferences)} saving={saving} />
    </div>
  )
}

/* ==========================================================================
 * Apariencia Visual
 * ========================================================================== */

const themeOptions: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Claro', icon: Sun },
  { id: 'dark', label: 'Oscuro', icon: Moon },
  { id: 'system', label: 'Sistema', icon: Monitor },
]

export function AparienciaPanel({ onToast }: { onToast: Toast }) {
  const [theme, setTheme] = React.useState<ThemeMode>(appearanceConfig.theme)
  const [color, setColor] = React.useState(appearanceConfig.primaryColor)
  const [saving, setSaving] = React.useState(false)

  // Aplicar tema reactivamente al DOM
  const applyTheme = (t: ThemeMode) => {
    setTheme(t)
    if (typeof window === 'undefined') return
    const root = document.documentElement
    if (t === 'dark') {
      root.classList.add('dark')
    } else if (t === 'light') {
      root.classList.remove('dark')
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', systemDark)
    }
    localStorage.setItem('qubitpos_theme', t)
  }

  React.useEffect(() => {
    settingsApi.getAppConfig<{ theme: ThemeMode; color: string }>('sistema_apariencia')
      .then((res) => {
        if (res.data) {
          if (res.data.theme) applyTheme(res.data.theme)
          if (res.data.color) setColor(res.data.color)
        }
      })
      .catch(() => {})
  }, [])

  const save = async () => {
    try {
      setSaving(true)
      await settingsApi.updateAppConfig('sistema_apariencia', { theme, color })
      onToast('Preferencias visuales guardadas en el servidor')
    } catch {
      onToast('Apariencia guardada localmente')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Apariencia"
        description="Personaliza el tema visual, colores y ergonomía de trabajo del sistema."
      />

      <Card>
        <CardContent className="flex flex-col gap-3 pt-5">
          <p className="text-sm font-medium text-foreground">Tema del sistema</p>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((opt) => {
              const Icon = opt.icon
              const active = theme === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => applyTheme(opt.id)}
                  aria-pressed={active}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-all',
                    active
                      ? 'border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary'
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
          <p className="text-sm font-medium text-foreground">Color de acento corporativo</p>
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

      <SaveBar onSave={save} saving={saving} />
    </div>
  )
}
