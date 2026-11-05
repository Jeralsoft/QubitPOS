'use client'

import * as React from 'react'
import { Plus, Pencil, Trash2, Info, Loader2, Landmark, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Badge } from '@/components/jeralpos/badge'
import { Input, Select, Label } from '@/components/jeralpos/input'
import { Card, CardContent } from '@/components/jeralpos/card'
import { Modal } from '@/components/jeralpos/modal'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/jeralpos/table'
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
  prefixes as seedPrefixes,
  resolutions as seedResolutions,
  resolutionStatusVariant,
  dianConfig,
  sequences as seedSequences,
  type Prefix,
  type Resolution,
  type DianConfig,
} from './mock-data'
import { settingsApi, type DianResolutionRecord } from '@/lib/api'

type Toast = (msg: string, kind?: 'success' | 'error') => void

/* ==========================================================================
 * Prefijos de Facturación
 * ========================================================================== */

interface PrefixFormData {
  id?: string
  prefix: string
  description: string
  branch: string
  active: boolean
}

export function PrefijosPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<Prefix[]>(seedPrefixes)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingPrefix, setEditingPrefix] = React.useState<PrefixFormData | null>(null)

  // Cargar prefijos guardados
  React.useEffect(() => {
    settingsApi
      .getAppConfig<Prefix[]>('facturacion_prefijos')
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setItems(res.data)
        }
      })
      .catch(() => {})
  }, [])

  const persistPrefixes = async (next: Prefix[]) => {
    setItems(next)
    try {
      await settingsApi.updateAppConfig('facturacion_prefijos', next)
    } catch {
      // Local fallback
    }
  }

  const handleOpenCreate = () => {
    setEditingPrefix({
      prefix: '',
      description: '',
      branch: 'Sede Principal',
      active: true,
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (p: Prefix) => {
    setEditingPrefix({
      id: p.id,
      prefix: p.prefix,
      description: p.description,
      branch: p.branch,
      active: p.active,
    })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPrefix) return

    if (!editingPrefix.prefix.trim()) {
      onToast('El código de prefijo es requerido', 'error')
      return
    }

    let next: Prefix[]
    if (editingPrefix.id) {
      next = items.map((p) =>
        p.id === editingPrefix.id
          ? {
              ...p,
              prefix: editingPrefix.prefix.toUpperCase(),
              description: editingPrefix.description,
              branch: editingPrefix.branch,
              active: editingPrefix.active,
            }
          : p,
      )
      onToast(`Prefijo "${editingPrefix.prefix}" actualizado`)
    } else {
      const newP: Prefix = {
        id: `pref-${Date.now()}`,
        prefix: editingPrefix.prefix.toUpperCase(),
        description: editingPrefix.description,
        branch: editingPrefix.branch,
        active: editingPrefix.active,
      }
      next = [...items, newP]
      onToast(`Prefijo "${editingPrefix.prefix}" creado exitosamente`)
    }

    await persistPrefixes(next)
    setModalOpen(false)
    setEditingPrefix(null)
  }

  const toggle = async (id: string) => {
    const next = items.map((p) => {
      if (p.id !== id) return p
      onToast(`Prefijo ${p.prefix} ${!p.active ? 'activado' : 'desactivado'}`)
      return { ...p, active: !p.active }
    })
    await persistPrefixes(next)
  }

  const remove = async (id: string) => {
    const found = items.find((x) => x.id === id)
    if (found && confirm(`¿Deseas eliminar el prefijo ${found.prefix}?`)) {
      const next = items.filter((x) => x.id !== id)
      onToast(`Prefijo ${found.prefix} eliminado`, 'error')
      await persistPrefixes(next)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Prefijos"
        description="Prefijos de facturación asociados a cada sucursal y tipo de documento."
        action={
          <Button variant="primary" size="md" onClick={handleOpenCreate}>
            <Plus className="size-4" />
            Nuevo prefijo
          </Button>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prefijo</TableHead>
            <TableHead className="hidden md:table-cell">Descripción</TableHead>
            <TableHead>Sucursal</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-mono font-medium text-foreground">{p.prefix}</TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">{p.description}</TableCell>
              <TableCell className="text-muted-foreground">{p.branch}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Toggle checked={p.active} onChange={() => toggle(p.id)} size="sm" label={`Estado de ${p.prefix}`} />
                  <Badge variant={p.active ? 'success' : 'neutral'} size="sm" dot>
                    {p.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Editar ${p.prefix}`}
                    onClick={() => handleOpenEdit(p)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-danger hover:bg-danger-muted"
                    aria-label={`Eliminar ${p.prefix}`}
                    onClick={() => remove(p.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal Prefijo */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingPrefix(null)
        }}
        title={editingPrefix?.id ? 'Editar prefijo' : 'Nuevo prefijo'}
        description="Asigna un prefijo alfanumérico para folios de comprobantes."
      >
        {editingPrefix && (
          <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
            <div>
              <Label htmlFor="prefCode" required>Prefijo</Label>
              <Input
                id="prefCode"
                value={editingPrefix.prefix}
                onChange={(e) => setEditingPrefix({ ...editingPrefix, prefix: e.target.value.toUpperCase() })}
                placeholder="Ej: FE, POS, NOTA"
                required
              />
            </div>

            <div>
              <Label htmlFor="prefDesc">Descripción</Label>
              <Input
                id="prefDesc"
                value={editingPrefix.description}
                onChange={(e) => setEditingPrefix({ ...editingPrefix, description: e.target.value })}
                placeholder="Ej: Factura Electrónica de Venta"
              />
            </div>

            <div>
              <Label htmlFor="prefBranch">Sucursal</Label>
              <Select
                id="prefBranch"
                value={editingPrefix.branch}
                onChange={(e) => setEditingPrefix({ ...editingPrefix, branch: e.target.value })}
              >
                <option>Sede Principal</option>
                <option>Sucursal Norte</option>
                <option>Sucursal Poblado</option>
              </Select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Toggle
                checked={editingPrefix.active}
                onChange={(v) => setEditingPrefix({ ...editingPrefix, active: v })}
                label="Prefijo activo"
              />
              <span className="text-sm font-medium text-foreground">
                {editingPrefix.active ? 'Habilitado para emitir documentos' : 'Deshabilitado'}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setModalOpen(false)
                  setEditingPrefix(null)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {editingPrefix.id ? 'Guardar cambios' : 'Crear prefijo'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

/* ==========================================================================
 * Resoluciones DIAN
 * ========================================================================== */

interface ResolutionFormData {
  id?: number | string
  number: string
  prefix: string
  rangeFrom: number
  rangeTo: number
  currentNumber: number
  issuedAt: string
  expiresAt: string
  technicalKey: string
  status: 'Vigente' | 'Por vencer' | 'Vencida'
}

const emptyResForm: ResolutionFormData = {
  number: '',
  prefix: 'FE',
  rangeFrom: 1,
  rangeTo: 50000,
  currentNumber: 1,
  issuedAt: new Date().toISOString().split('T')[0],
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  technicalKey: 'fc8eac422eba16e22ffd8c6f94b3f40a6e38162c',
  status: 'Vigente',
}

export function ResolucionesPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<Resolution[]>(seedResolutions)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingRes, setEditingRes] = React.useState<ResolutionFormData | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  const loadResolutions = React.useCallback(async () => {
    try {
      const res = await settingsApi.getResolutions()
      if (res.data && res.data.length > 0) {
        const liveRes: Resolution[] = res.data.map((r) => ({
          id: String(r.id),
          number: r.resolution_number,
          prefix: r.prefix,
          range: `${r.range_from.toLocaleString('es-CO')} - ${r.range_to.toLocaleString('es-CO')}`,
          issuedAt: r.issued_at,
          expiresAt: r.expires_at,
          status: r.status as 'Vigente' | 'Por vencer' | 'Vencida',
        }))
        setItems(liveRes)
      }
    } catch {
      // Fallback
    }
  }, [])

  React.useEffect(() => {
    loadResolutions()
  }, [loadResolutions])

  const handleOpenCreate = () => {
    setEditingRes({
      ...emptyResForm,
      number: `1876${Date.now().toString().slice(-7)}`,
    })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRes) return

    if (!editingRes.number.trim() || !editingRes.prefix.trim()) {
      onToast('Completa los campos requeridos de la resolución', 'error')
      return
    }

    try {
      setSubmitting(true)
      await settingsApi.createResolution({
        resolution_number: editingRes.number,
        prefix: editingRes.prefix.toUpperCase(),
        range_from: Number(editingRes.rangeFrom),
        range_to: Number(editingRes.rangeTo),
        current_number: Number(editingRes.currentNumber),
        issued_at: editingRes.issuedAt,
        expires_at: editingRes.expiresAt,
        technical_key: editingRes.technicalKey,
        status: editingRes.status,
      })
      onToast(`Resolución ${editingRes.number} guardada exitosamente`)
      setModalOpen(false)
      setEditingRes(null)
      loadResolutions()
    } catch {
      onToast('Error al registrar la resolución DIAN', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, number: string) => {
    if (!confirm(`¿Eliminar la resolución ${number}?`)) return
    try {
      await settingsApi.deleteResolution(id)
      setItems((prev) => prev.filter((r) => r.id !== id))
      onToast(`Resolución ${number} eliminada`, 'error')
    } catch {
      setItems((prev) => prev.filter((r) => r.id !== id))
      onToast(`Resolución ${number} eliminada localmente`, 'error')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Resoluciones"
        description="Resoluciones de facturación electrónica y POS autorizadas por la DIAN."
        action={
          <Button variant="primary" size="md" onClick={handleOpenCreate}>
            <Plus className="size-4" />
            Nueva resolución
          </Button>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Prefijo</TableHead>
            <TableHead className="hidden md:table-cell">Rango</TableHead>
            <TableHead className="hidden lg:table-cell">Vigencia</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-sm font-medium text-foreground">{r.number}</TableCell>
              <TableCell className="font-mono text-muted-foreground">{r.prefix}</TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">{r.range}</TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {r.issuedAt} → {r.expiresAt}
              </TableCell>
              <TableCell>
                <Badge variant={resolutionStatusVariant[r.status] || 'neutral'} size="sm" dot>
                  {r.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-danger hover:bg-danger-muted"
                  aria-label={`Eliminar resolución ${r.number}`}
                  onClick={() => handleDelete(r.id, r.number)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <InfoNote tone="warning">
        <Info className="mt-0.5 size-4 shrink-0 text-warning" />
        <span>
          Mantén al día la vigencia de tus rangos de numeración para asegurar la validez fiscal ante la DIAN.
        </span>
      </InfoNote>

      {/* Modal Resolución */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingRes(null)
        }}
        title="Nueva resolución DIAN"
        description="Ingresa el formulario oficial 1876 de autorización de numeración."
      >
        {editingRes && (
          <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="resNum" required>Número de resolución</Label>
                <Input
                  id="resNum"
                  value={editingRes.number}
                  onChange={(e) => setEditingRes({ ...editingRes, number: e.target.value })}
                  placeholder="Ej: 18764000001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="resPrefix" required>Prefijo autorizado</Label>
                <Input
                  id="resPrefix"
                  value={editingRes.prefix}
                  onChange={(e) => setEditingRes({ ...editingRes, prefix: e.target.value.toUpperCase() })}
                  placeholder="Ej: FE"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="resFrom" required>Rango desde</Label>
                <Input
                  id="resFrom"
                  type="number"
                  value={editingRes.rangeFrom}
                  onChange={(e) => setEditingRes({ ...editingRes, rangeFrom: Number(e.target.value) })}
                  min={1}
                  required
                />
              </div>
              <div>
                <Label htmlFor="resTo" required>Rango hasta</Label>
                <Input
                  id="resTo"
                  type="number"
                  value={editingRes.rangeTo}
                  onChange={(e) => setEditingRes({ ...editingRes, rangeTo: Number(e.target.value) })}
                  min={editingRes.rangeFrom + 1}
                  required
                />
              </div>
              <div>
                <Label htmlFor="resCurr" required>Número inicial</Label>
                <Input
                  id="resCurr"
                  type="number"
                  value={editingRes.currentNumber}
                  onChange={(e) => setEditingRes({ ...editingRes, currentNumber: Number(e.target.value) })}
                  min={editingRes.rangeFrom}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="resIssued" required>Fecha expedición</Label>
                <Input
                  id="resIssued"
                  type="date"
                  value={editingRes.issuedAt}
                  onChange={(e) => setEditingRes({ ...editingRes, issuedAt: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="resExpires" required>Fecha vencimiento</Label>
                <Input
                  id="resExpires"
                  type="date"
                  value={editingRes.expiresAt}
                  onChange={(e) => setEditingRes({ ...editingRes, expiresAt: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="resKey">Clave técnica DIAN</Label>
              <Input
                id="resKey"
                type="password"
                value={editingRes.technicalKey}
                onChange={(e) => setEditingRes({ ...editingRes, technicalKey: e.target.value })}
                placeholder="fc8eac422eba..."
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setModalOpen(false)
                  setEditingRes(null)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Registrar resolución
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

/* ==========================================================================
 * Estado de Numeración
 * ========================================================================== */

export function NumeracionPanel({ onToast }: { onToast: Toast }) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Numeración"
        description="Estado y porcentaje de consumo de la numeración por documento electrónico."
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Documento</TableHead>
            <TableHead>Prefijo</TableHead>
            <TableHead>Consumido</TableHead>
            <TableHead className="hidden md:table-cell">Disponible</TableHead>
            <TableHead>Uso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {seedSequences.map((s) => {
            const pct = Math.round((s.current / s.end) * 100)
            return (
              <TableRow key={s.id}>
                <TableCell className="font-medium text-foreground">{s.document}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{s.prefix}</TableCell>
                <TableCell className="text-muted-foreground">{s.current.toLocaleString('es-CO')}</TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {(s.end - s.current).toLocaleString('es-CO')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className={pct > 80 ? 'h-full rounded-full bg-danger' : 'h-full rounded-full bg-primary'}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">{pct}%</span>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

/* ==========================================================================
 * Configuración Electrónica DIAN
 * ========================================================================== */

export function ElectronicaPanel({ onToast }: { onToast: Toast }) {
  const [config, setConfig] = React.useState({
    enabled: true,
    autoSend: true,
    sendEmail: true,
    contingency: false,
  })
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    settingsApi
      .getDian()
      .then((res) => {
        if (res.data) {
          setConfig({
            enabled: res.data.is_connected ?? true,
            autoSend: res.data.is_auto_send ?? true,
            sendEmail: res.data.send_email_to_customer ?? true,
            contingency: res.data.contingency_mode ?? false,
          })
        }
      })
      .catch(() => {})
  }, [])

  const setBool = (k: keyof typeof config, v: boolean) => setConfig((p) => ({ ...p, [k]: v }))

  const save = async () => {
    try {
      setSaving(true)
      await settingsApi.updateDian({
        is_connected: config.enabled,
        is_auto_send: config.autoSend,
        send_email_to_customer: config.sendEmail,
        contingency_mode: config.contingency,
      })
      onToast('Parámetros de emisión electrónica guardados en el servidor')
    } catch {
      onToast('Error guardando en el servidor, parámetros actualizados localmente', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Configuración electrónica"
        description="Comportamiento del motor de facturación electrónica DIAN UBL 2.1."
      />
      <Card>
        <CardContent className="pt-2">
          <DividedList>
            <SettingRow
              title="Facturación electrónica activa"
              description="Emitir comprobantes fiscales electrónicos válidos ante la DIAN."
              control={
                <Toggle
                  checked={config.enabled}
                  onChange={(v) => setBool('enabled', v)}
                  label="Facturación electrónica activa"
                />
              }
            />
            <SettingRow
              title="Envío automático a la DIAN"
              description="Transmitir el XML UBL 2.1 firmado inmediatamente al cerrar cada venta."
              control={
                <Toggle
                  checked={config.autoSend}
                  onChange={(v) => setBool('autoSend', v)}
                  label="Envío automático a la DIAN"
                />
              }
            />
            <SettingRow
              title="Enviar copia al cliente"
              description="Adjuntar automáticamente el PDF y XML validado al correo electrónico del adquirente."
              control={
                <Toggle
                  checked={config.sendEmail}
                  onChange={(v) => setBool('sendEmail', v)}
                  label="Enviar copia al cliente"
                />
              }
            />
            <SettingRow
              title="Modo contingencia"
              description="Permitir emisión en contingencia cuando los servidores de la DIAN presenten indisponibilidad."
              control={
                <Toggle
                  checked={config.contingency}
                  onChange={(v) => setBool('contingency', v)}
                  label="Modo contingencia"
                />
              }
            />
          </DividedList>
        </CardContent>
      </Card>
      <SaveBar onSave={save} saving={saving} />
    </div>
  )
}

/* ==========================================================================
 * Datos Técnicos DIAN
 * ========================================================================== */

export function DianPanel({ onToast }: { onToast: Toast }) {
  const [form, setForm] = React.useState<DianConfig>(dianConfig)
  const [saving, setSaving] = React.useState(false)
  const [testing, setTesting] = React.useState(false)
  const set = <K extends keyof DianConfig>(k: K, v: DianConfig[K]) => setForm((p) => ({ ...p, [k]: v }))

  React.useEffect(() => {
    settingsApi
      .getDian()
      .then((res) => {
        if (res.data) {
          setForm({
            environment: (res.data.environment as 'Pruebas' | 'Producción') || 'Pruebas',
            companyType: res.data.company_type || dianConfig.companyType,
            fiscalResponsibility: res.data.fiscal_responsibility || dianConfig.fiscalResponsibility,
            softwareId: res.data.software_id || dianConfig.softwareId,
            testSetId: res.data.test_set_id || dianConfig.testSetId,
            technicalKey: res.data.technical_key || dianConfig.technicalKey,
            connected: res.data.is_connected ?? true,
          })
        }
      })
      .catch(() => {})
  }, [])

  const save = async () => {
    try {
      setSaving(true)
      await settingsApi.updateDian({
        environment: form.environment,
        company_type: form.companyType,
        fiscal_responsibility: form.fiscalResponsibility,
        software_id: form.softwareId,
        test_set_id: form.testSetId,
        technical_key: form.technicalKey,
        is_connected: form.connected,
      })
      onToast('Credenciales técnicas DIAN guardadas en el servidor')
    } catch {
      onToast('Error al guardar en el servidor', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    try {
      setTesting(true)
      const res = await settingsApi.testDianConnection()
      onToast(`DIAN (${res.environment}): ${res.message} [${res.latency_ms}ms]`, 'success')
      set('connected', true)
    } catch {
      onToast('No fue posible contactar los servicios Web DIAN', 'error')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Datos DIAN"
        description="Credenciales y parámetros técnicos para la integración Web Service con la DIAN."
        action={
          <Badge variant={form.connected ? 'success' : 'warning'} dot>
            {form.connected ? 'Conectado a DIAN' : 'Sin conectar'}
          </Badge>
        }
      />
      <Card>
        <CardContent className="pt-5">
          <FieldGrid>
            <Field>
              <Label htmlFor="environment">Ambiente de facturación</Label>
              <Select
                id="environment"
                value={form.environment}
                onChange={(e) => set('environment', e.target.value as DianConfig['environment'])}
              >
                <option value="Pruebas">Pruebas (Habilitación)</option>
                <option value="Producción">Producción Oficial</option>
              </Select>
            </Field>
            <Field>
              <Label htmlFor="companyType">Tipo de contribuyente</Label>
              <Select id="companyType" value={form.companyType} onChange={(e) => set('companyType', e.target.value)}>
                <option>Persona jurídica</option>
                <option>Persona natural</option>
              </Select>
            </Field>
            <Field className="sm:col-span-2">
              <Label htmlFor="fiscalResponsibility">Responsabilidad fiscal</Label>
              <Input
                id="fiscalResponsibility"
                value={form.fiscalResponsibility}
                onChange={(e) => set('fiscalResponsibility', e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="softwareId">ID de software DIAN</Label>
              <Input
                id="softwareId"
                value={form.softwareId}
                onChange={(e) => set('softwareId', e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="testSetId">Set de pruebas (UUID)</Label>
              <Input
                id="testSetId"
                value={form.testSetId}
                onChange={(e) => set('testSetId', e.target.value)}
              />
            </Field>
            <Field className="sm:col-span-2">
              <Label htmlFor="technicalKey">Clave técnica DIAN</Label>
              <Input
                id="technicalKey"
                type="password"
                value={form.technicalKey}
                onChange={(e) => set('technicalKey', e.target.value)}
              />
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="md" onClick={handleTestConnection} disabled={testing}>
          {testing ? <Loader2 className="size-4 animate-spin" /> : <Landmark className="size-4" />}
          Probar conexión con DIAN
        </Button>
      </div>

      <SaveBar onSave={save} onReset={() => setForm(dianConfig)} saving={saving} />
    </div>
  )
}
