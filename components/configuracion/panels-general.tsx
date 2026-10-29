'use client'

import * as React from 'react'
import { Building2, Upload, Trash2, Info } from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Input, Select, Label, Textarea } from '@/components/jeralpos/input'
import { Card, CardContent } from '@/components/jeralpos/card'
import {
  SectionHeader,
  FieldGrid,
  Field,
  SaveBar,
  InfoNote,
} from './settings-ui'
import {
  companyInfo,
  regionalConfig,
  colombiaDepartments,
  type CompanyInfo,
  type RegionalConfig,
} from './mock-data'

type Toast = (msg: string, kind?: 'success' | 'error') => void

/* Información de empresa -------------------------------------------- */

export function EmpresaPanel({ onToast }: { onToast: Toast }) {
  const [form, setForm] = React.useState<CompanyInfo>(companyInfo)
  const [saving, setSaving] = React.useState(false)
  const set = (k: keyof CompanyInfo, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const save = () => {
    setSaving(true)
    window.setTimeout(() => {
      setSaving(false)
      onToast('Información de empresa guardada')
    }, 700)
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Información de empresa"
        description="Datos legales y comerciales que aparecerán en documentos y facturas."
      />
      <Card>
        <CardContent className="pt-5">
          <FieldGrid>
            <Field>
              <Label htmlFor="tradeName" required>
                Nombre comercial
              </Label>
              <Input id="tradeName" value={form.tradeName} onChange={(e) => set('tradeName', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="legalName" required>
                Razón social
              </Label>
              <Input id="legalName" value={form.legalName} onChange={(e) => set('legalName', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="nit" required>
                NIT
              </Label>
              <Input id="nit" value={form.nit} onChange={(e) => set('nit', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="email">Correo</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="website">Sitio web</Label>
              <Input id="website" value={form.website} onChange={(e) => set('website', e.target.value)} />
            </Field>
            <Field className="sm:col-span-2">
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                rows={2}
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" value={form.city} onChange={(e) => set('city', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="department">Departamento</Label>
              <Select id="department" value={form.department} onChange={(e) => set('department', e.target.value)}>
                {colombiaDepartments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>
      <SaveBar onSave={save} onReset={() => setForm(companyInfo)} saving={saving} />
    </div>
  )
}

/* Logo -------------------------------------------------------------- */

export function LogoPanel({ onToast }: { onToast: Toast }) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Logo"
        description="Imagen que representa tu empresa en la interfaz y los documentos."
      />
      <Card>
        <CardContent className="flex flex-col gap-6 pt-5 sm:flex-row sm:items-center">
          <div
            className="grid size-28 shrink-0 place-items-center rounded-2xl border border-dashed border-border bg-muted/40 text-primary"
            aria-hidden
          >
            <Building2 className="size-10" />
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Logo principal</p>
              <p className="text-xs text-muted-foreground">
                PNG o SVG con fondo transparente. Tamaño recomendado 512×512px, máximo 2 MB.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => onToast('Selector de archivo (demo)')}>
                <Upload />
                Subir logo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:bg-danger-muted"
                onClick={() => onToast('Logo eliminado', 'error')}
              >
                <Trash2 />
                Quitar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <InfoNote>
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>
          La carga real de archivos se habilitará al conectar el almacenamiento desde la API de Laravel.
        </span>
      </InfoNote>
    </div>
  )
}

/* Datos de contacto ------------------------------------------------- */

export function ContactoPanel({ onToast }: { onToast: Toast }) {
  const [form, setForm] = React.useState({
    salesPhone: '+57 604 444 8899',
    supportPhone: '+57 320 555 1234',
    salesEmail: 'ventas@jeralpos.co',
    supportEmail: 'soporte@jeralpos.co',
    whatsapp: '+57 320 555 1234',
    schedule: 'Lunes a sábado, 8:00 a.m. - 8:00 p.m.',
  })
  const [saving, setSaving] = React.useState(false)
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }))
  const save = () => {
    setSaving(true)
    window.setTimeout(() => {
      setSaving(false)
      onToast('Datos de contacto guardados')
    }, 700)
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Datos de contacto"
        description="Canales de atención visibles para clientes y usuarios del sistema."
      />
      <Card>
        <CardContent className="pt-5">
          <FieldGrid>
            <Field>
              <Label htmlFor="salesPhone">Teléfono de ventas</Label>
              <Input id="salesPhone" value={form.salesPhone} onChange={(e) => set('salesPhone', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="supportPhone">Teléfono de soporte</Label>
              <Input id="supportPhone" value={form.supportPhone} onChange={(e) => set('supportPhone', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="salesEmail">Correo de ventas</Label>
              <Input id="salesEmail" type="email" value={form.salesEmail} onChange={(e) => set('salesEmail', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="supportEmail">Correo de soporte</Label>
              <Input id="supportEmail" type="email" value={form.supportEmail} onChange={(e) => set('supportEmail', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="schedule">Horario de atención</Label>
              <Input id="schedule" value={form.schedule} onChange={(e) => set('schedule', e.target.value)} />
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>
      <SaveBar onSave={save} saving={saving} />
    </div>
  )
}

/* Configuración regional -------------------------------------------- */

export function RegionalPanel({ onToast }: { onToast: Toast }) {
  const [form, setForm] = React.useState<RegionalConfig>(regionalConfig)
  const [saving, setSaving] = React.useState(false)
  const set = (k: keyof RegionalConfig, v: string) => setForm((p) => ({ ...p, [k]: v }))
  const save = () => {
    setSaving(true)
    window.setTimeout(() => {
      setSaving(false)
      onToast('Configuración regional guardada')
    }, 700)
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Configuración regional"
        description="Define moneda, zona horaria y formatos usados en todo el sistema."
      />
      <Card>
        <CardContent className="pt-5">
          <FieldGrid>
            <Field>
              <Label htmlFor="country">País</Label>
              <Select id="country" value={form.country} onChange={(e) => set('country', e.target.value)}>
                <option>Colombia</option>
                <option>México</option>
                <option>Perú</option>
                <option>Ecuador</option>
                <option>Chile</option>
              </Select>
            </Field>
            <Field>
              <Label htmlFor="currency">Moneda</Label>
              <Select id="currency" value={form.currency} onChange={(e) => set('currency', e.target.value)}>
                <option value="COP">Peso colombiano (COP)</option>
                <option value="USD">Dólar (USD)</option>
                <option value="MXN">Peso mexicano (MXN)</option>
                <option value="PEN">Sol peruano (PEN)</option>
              </Select>
            </Field>
            <Field>
              <Label htmlFor="timezone">Zona horaria</Label>
              <Select id="timezone" value={form.timezone} onChange={(e) => set('timezone', e.target.value)}>
                <option value="America/Bogota">América/Bogotá (GMT-5)</option>
                <option value="America/Mexico_City">América/Ciudad de México (GMT-6)</option>
                <option value="America/Lima">América/Lima (GMT-5)</option>
                <option value="America/Santiago">América/Santiago (GMT-3)</option>
              </Select>
            </Field>
            <Field>
              <Label htmlFor="language">Idioma</Label>
              <Select id="language" value={form.language} onChange={(e) => set('language', e.target.value)}>
                <option value="es-CO">Español (Colombia)</option>
                <option value="es-MX">Español (México)</option>
                <option value="en-US">Inglés (EE. UU.)</option>
              </Select>
            </Field>
            <Field>
              <Label htmlFor="dateFormat">Formato de fecha</Label>
              <Select id="dateFormat" value={form.dateFormat} onChange={(e) => set('dateFormat', e.target.value)}>
                <option value="DD/MM/YYYY">DD/MM/AAAA</option>
                <option value="MM/DD/YYYY">MM/DD/AAAA</option>
                <option value="YYYY-MM-DD">AAAA-MM-DD</option>
              </Select>
            </Field>
            <Field>
              <Label htmlFor="numberFormat">Formato de número</Label>
              <Select id="numberFormat" value={form.numberFormat} onChange={(e) => set('numberFormat', e.target.value)}>
                <option value="1.234.567,89">1.234.567,89</option>
                <option value="1,234,567.89">1,234,567.89</option>
              </Select>
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>
      <SaveBar onSave={save} onReset={() => setForm(regionalConfig)} saving={saving} />
    </div>
  )
}
