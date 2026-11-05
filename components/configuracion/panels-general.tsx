'use client'

import * as React from 'react'
import { Building2, Upload, Trash2, Info, Loader2, Image as ImageIcon } from 'lucide-react'
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
import { settingsApi } from '@/lib/api'

type Toast = (msg: string, kind?: 'success' | 'error') => void

/* ==========================================================================
 * Información de Empresa
 * ========================================================================== */

export function EmpresaPanel({ onToast }: { onToast: Toast }) {
  const [form, setForm] = React.useState<CompanyInfo>(companyInfo)
  const [saving, setSaving] = React.useState(false)
  const set = (k: keyof CompanyInfo, v: string) => setForm((p) => ({ ...p, [k]: v }))

  React.useEffect(() => {
    settingsApi
      .getCompany()
      .then((res) => {
        if (res.data) {
          setForm({
            tradeName: res.data.trade_name || companyInfo.tradeName,
            legalName: res.data.legal_name || companyInfo.legalName,
            nit: res.data.nit || companyInfo.nit,
            phone: res.data.phone || companyInfo.phone,
            email: res.data.email || companyInfo.email,
            address: res.data.address || companyInfo.address,
            city: res.data.city || companyInfo.city,
            department: res.data.department || companyInfo.department,
            website: res.data.website || companyInfo.website,
          })
        }
      })
      .catch(() => {})
  }, [])

  const save = async () => {
    try {
      setSaving(true)
      await settingsApi.updateCompany({
        trade_name: form.tradeName,
        legal_name: form.legalName,
        nit: form.nit,
        phone: form.phone,
        email: form.email,
        address: form.address,
        city: form.city,
        department: form.department,
        website: form.website,
      })
      onToast('Información de empresa guardada en el servidor')
    } catch {
      onToast('Error guardando en el servidor, cambio local mantenido', 'error')
    } finally {
      setSaving(false)
    }
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
                NIT / Identificación
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
              <Label htmlFor="address">Dirección principal</Label>
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

/* ==========================================================================
 * Logo Corporativo
 * ========================================================================== */

export function LogoPanel({ onToast }: { onToast: Toast }) {
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    settingsApi
      .getAppConfig<string>('company_logo')
      .then((res) => {
        if (res.data) setLogoUrl(res.data)
      })
      .catch(() => {})
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      onToast('El archivo supera el límite de 2 MB', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      setLogoUrl(dataUrl)
      try {
        await settingsApi.updateAppConfig('company_logo', dataUrl)
        onToast('Logo corporativo actualizado y guardado')
      } catch {
        onToast('Logo actualizado localmente')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = async () => {
    setLogoUrl(null)
    try {
      await settingsApi.updateAppConfig('company_logo', null)
      onToast('Logo corporativo eliminado')
    } catch {
      onToast('Logo removido')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Logo"
        description="Imagen institucional visible en la cabecera del sistema, tickets térmicos y facturas."
      />
      <Card>
        <CardContent className="flex flex-col gap-6 pt-5 sm:flex-row sm:items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/svg+xml"
            className="hidden"
          />

          <div
            className="relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/40 text-primary"
            aria-hidden
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo empresa" className="size-full object-contain p-2" />
            ) : (
              <Building2 className="size-10" />
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Logo principal de la empresa</p>
              <p className="text-xs text-muted-foreground">
                Formatos permitidos: PNG, JPG o SVG. Tamaño recomendado 512×512px, máximo 2 MB.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-3.5" />
                Subir nuevo logo
              </Button>
              {logoUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger hover:bg-danger-muted"
                  onClick={handleRemove}
                >
                  <Trash2 className="size-3.5" />
                  Quitar logo
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <InfoNote>
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>
          El logo configurado se imprime automáticamente en los encabezados de los tickets térmicos de 80mm y 58mm.
        </span>
      </InfoNote>
    </div>
  )
}

/* ==========================================================================
 * Datos de Contacto
 * ========================================================================== */

interface ContactForm {
  salesPhone: string
  supportPhone: string
  salesEmail: string
  supportEmail: string
  whatsapp: string
  schedule: string
}

export function ContactoPanel({ onToast }: { onToast: Toast }) {
  const [form, setForm] = React.useState<ContactForm>({
    salesPhone: '+57 604 444 8899',
    supportPhone: '+57 320 555 1234',
    salesEmail: 'ventas@qubitpos.co',
    supportEmail: 'soporte@qubitpos.co',
    whatsapp: '+57 320 555 1234',
    schedule: 'Lunes a sábado, 8:00 a.m. - 8:00 p.m.',
  })
  const [saving, setSaving] = React.useState(false)
  const set = (k: keyof ContactForm, v: string) => setForm((p) => ({ ...p, [k]: v }))

  React.useEffect(() => {
    settingsApi
      .getAppConfig<ContactForm>('company_contact')
      .then((res) => {
        if (res.data) setForm(res.data)
      })
      .catch(() => {})
  }, [])

  const save = async () => {
    try {
      setSaving(true)
      await settingsApi.updateAppConfig('company_contact', form)
      onToast('Datos de contacto guardados en el servidor')
    } catch {
      onToast('Datos de contacto guardados localmente')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Datos de contacto"
        description="Canales de atención al cliente y soporte impresos en facturas y recibos."
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
              <Label htmlFor="whatsapp">WhatsApp oficial</Label>
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

/* ==========================================================================
 * Configuración Regional
 * ========================================================================== */

export function RegionalPanel({ onToast }: { onToast: Toast }) {
  const [form, setForm] = React.useState<RegionalConfig>(regionalConfig)
  const [saving, setSaving] = React.useState(false)
  const set = (k: keyof RegionalConfig, v: string) => setForm((p) => ({ ...p, [k]: v }))

  React.useEffect(() => {
    Promise.all([
      settingsApi.getCompany().catch(() => null),
      settingsApi.getAppConfig<RegionalConfig>('regional_config').catch(() => null),
    ]).then(([compRes, appRes]) => {
      if (appRes?.data) {
        setForm(appRes.data)
      } else if (compRes?.data) {
        setForm((prev) => ({
          ...prev,
          currency: compRes.data.currency || 'COP',
          timezone: compRes.data.timezone || 'America/Bogota',
        }))
      }
    })
  }, [])

  const save = async () => {
    try {
      setSaving(true)
      await Promise.all([
        settingsApi.updateCompany({
          currency: form.currency,
          timezone: form.timezone,
        }),
        settingsApi.updateAppConfig('regional_config', form),
      ])
      onToast('Configuración regional guardada en el servidor')
    } catch {
      onToast('Configuración regional guardada localmente')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Configuración regional"
        description="Define la moneda base, huso horario y formatos numéricos del sistema."
      />
      <Card>
        <CardContent className="pt-5">
          <FieldGrid>
            <Field>
              <Label htmlFor="country">País de operación</Label>
              <Select id="country" value={form.country} onChange={(e) => set('country', e.target.value)}>
                <option>Colombia</option>
                <option>México</option>
                <option>Perú</option>
                <option>Ecuador</option>
                <option>Chile</option>
                <option>Estados Unidos</option>
              </Select>
            </Field>
            <Field>
              <Label htmlFor="currency">Moneda de facturación</Label>
              <Select id="currency" value={form.currency} onChange={(e) => set('currency', e.target.value)}>
                <option value="COP">Peso colombiano (COP)</option>
                <option value="USD">Dólar estadounidense (USD)</option>
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
                <option value="en-US">English (United States)</option>
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
              <Label htmlFor="numberFormat">Formato numérico</Label>
              <Select id="numberFormat" value={form.numberFormat} onChange={(e) => set('numberFormat', e.target.value)}>
                <option value="1.234.567,89">1.234.567,89 (Estándar Colombia)</option>
                <option value="1,234,567.89">1,234,567.89 (Estándar US)</option>
              </Select>
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>
      <SaveBar onSave={save} onReset={() => setForm(regionalConfig)} saving={saving} />
    </div>
  )
}
