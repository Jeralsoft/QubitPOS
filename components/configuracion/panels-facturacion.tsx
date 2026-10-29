'use client'

import * as React from 'react'
import { Plus, Pencil, Trash2, Info } from 'lucide-react'
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
  resolutions,
  resolutionStatusVariant,
  dianConfig,
  sequences as seedSequences,
  type Prefix,
  type DianConfig,
} from './mock-data'

type Toast = (msg: string, kind?: 'success' | 'error') => void

/* Prefijos ---------------------------------------------------------- */

export function PrefijosPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<Prefix[]>(seedPrefixes)
  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        onToast(`Prefijo ${p.prefix} ${!p.active ? 'activado' : 'desactivado'}`)
        return { ...p, active: !p.active }
      }),
    )
  const remove = (id: string) =>
    setItems((prev) => {
      const found = prev.find((x) => x.id === id)
      if (found) onToast(`Prefijo ${found.prefix} eliminado`, 'error')
      return prev.filter((x) => x.id !== id)
    })
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Prefijos"
        description="Prefijos de facturación asociados a cada sucursal."
        action={
          <Button variant="primary" size="md" onClick={() => onToast('Nuevo prefijo (demo)')}>
            <Plus />
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
                  <Button variant="ghost" size="icon" className="size-8" aria-label={`Editar ${p.prefix}`} onClick={() => onToast(`Editar ${p.prefix} (demo)`)}>
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-danger hover:bg-danger-muted"
                    aria-label={`Eliminar ${p.prefix}`}
                    onClick={() => remove(p.id)}
                  >
                    <Trash2 />
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

/* Resoluciones ------------------------------------------------------ */

export function ResolucionesPanel({ onToast }: { onToast: Toast }) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Resoluciones"
        description="Resoluciones de facturación autorizadas por la DIAN."
        action={
          <Button variant="primary" size="md" onClick={() => onToast('Nueva resolución (demo)')}>
            <Plus />
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {resolutions.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-sm font-medium text-foreground">{r.number}</TableCell>
              <TableCell className="text-muted-foreground">{r.prefix}</TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">{r.range}</TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {r.issuedAt} → {r.expiresAt}
              </TableCell>
              <TableCell>
                <Badge variant={resolutionStatusVariant[r.status]} size="sm" dot>
                  {r.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <InfoNote tone="warning">
        <Info className="mt-0.5 size-4 shrink-0 text-warning" />
        <span>Una resolución está por vencer. Solicita la renovación ante la DIAN antes de la fecha límite.</span>
      </InfoNote>
    </div>
  )
}

/* Numeración -------------------------------------------------------- */

export function NumeracionPanel({ onToast }: { onToast: Toast }) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Numeración"
        description="Estado actual de la numeración por documento electrónico."
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
                <TableCell className="text-muted-foreground">{s.prefix}</TableCell>
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

/* Configuración electrónica ----------------------------------------- */

export function ElectronicaPanel({ onToast }: { onToast: Toast }) {
  const [config, setConfig] = React.useState({
    enabled: true,
    autoSend: true,
    sendEmail: true,
    contingency: false,
  })
  const [saving, setSaving] = React.useState(false)
  const setBool = (k: keyof typeof config, v: boolean) => setConfig((p) => ({ ...p, [k]: v }))
  const save = () => {
    setSaving(true)
    window.setTimeout(() => {
      setSaving(false)
      onToast('Configuración electrónica guardada')
    }, 700)
  }
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Configuración electrónica"
        description="Comportamiento de la facturación electrónica DIAN."
      />
      <Card>
        <CardContent className="pt-2">
          <DividedList>
            <SettingRow
              title="Facturación electrónica activa"
              description="Emitir documentos electrónicos válidos ante la DIAN"
              control={<Toggle checked={config.enabled} onChange={(v) => setBool('enabled', v)} label="Facturación electrónica activa" />}
            />
            <SettingRow
              title="Envío automático a la DIAN"
              description="Transmitir cada factura al validar la venta"
              control={<Toggle checked={config.autoSend} onChange={(v) => setBool('autoSend', v)} label="Envío automático a la DIAN" />}
            />
            <SettingRow
              title="Enviar copia al cliente"
              description="Adjuntar el PDF y XML al correo del cliente"
              control={<Toggle checked={config.sendEmail} onChange={(v) => setBool('sendEmail', v)} label="Enviar copia al cliente" />}
            />
            <SettingRow
              title="Modo contingencia"
              description="Permitir emisión offline cuando la DIAN no responde"
              control={<Toggle checked={config.contingency} onChange={(v) => setBool('contingency', v)} label="Modo contingencia" />}
            />
          </DividedList>
        </CardContent>
      </Card>
      <SaveBar onSave={save} saving={saving} />
    </div>
  )
}

/* Datos DIAN -------------------------------------------------------- */

export function DianPanel({ onToast }: { onToast: Toast }) {
  const [form, setForm] = React.useState<DianConfig>(dianConfig)
  const [saving, setSaving] = React.useState(false)
  const set = <K extends keyof DianConfig>(k: K, v: DianConfig[K]) => setForm((p) => ({ ...p, [k]: v }))
  const save = () => {
    setSaving(true)
    window.setTimeout(() => {
      setSaving(false)
      onToast('Datos DIAN guardados')
    }, 700)
  }
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Datos DIAN"
        description="Credenciales técnicas para la integración con la DIAN."
        action={
          <Badge variant={form.connected ? 'success' : 'warning'} dot>
            {form.connected ? 'Conectado' : 'Sin conectar'}
          </Badge>
        }
      />
      <Card>
        <CardContent className="pt-5">
          <FieldGrid>
            <Field>
              <Label htmlFor="environment">Ambiente</Label>
              <Select
                id="environment"
                value={form.environment}
                onChange={(e) => set('environment', e.target.value as DianConfig['environment'])}
              >
                <option value="Pruebas">Pruebas (Habilitación)</option>
                <option value="Producción">Producción</option>
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
              <Input id="fiscalResponsibility" value={form.fiscalResponsibility} onChange={(e) => set('fiscalResponsibility', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="softwareId">ID de software</Label>
              <Input id="softwareId" value={form.softwareId} onChange={(e) => set('softwareId', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="testSetId">Set de pruebas</Label>
              <Input id="testSetId" value={form.testSetId} onChange={(e) => set('testSetId', e.target.value)} />
            </Field>
            <Field className="sm:col-span-2">
              <Label htmlFor="technicalKey">Clave técnica</Label>
              <Input id="technicalKey" type="password" value={form.technicalKey} onChange={(e) => set('technicalKey', e.target.value)} />
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="md" onClick={() => onToast('Probando conexión con la DIAN…')}>
          Probar conexión
        </Button>
      </div>
      <SaveBar onSave={save} onReset={() => setForm(dianConfig)} saving={saving} />
    </div>
  )
}
