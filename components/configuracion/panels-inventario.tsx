'use client'

import * as React from 'react'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
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
} from './settings-ui'
import {
  units as seedUnits,
  categories as seedCategories,
  brands as seedBrands,
  taxes as seedTaxes,
  priceLists as seedPriceLists,
  stockConfig,
  type UnitOfMeasure,
  type Category,
  type Brand,
  type Tax,
  type PriceList,
  type StockConfig,
} from './mock-data'

type Toast = (msg: string, kind?: 'success' | 'error') => void

/* Generic active toggle + delete helpers ---------------------------- */

function useToggleList<T extends { id: string; active: boolean; name: string }>(seed: T[], onToast: Toast) {
  const [items, setItems] = React.useState<T[]>(seed)
  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it
        onToast(`${it.name} ${!it.active ? 'activado' : 'desactivado'}`)
        return { ...it, active: !it.active }
      }),
    )
  const remove = (id: string) =>
    setItems((prev) => {
      const found = prev.find((x) => x.id === id)
      if (found) onToast(`${found.name} eliminado`, 'error')
      return prev.filter((x) => x.id !== id)
    })
  return { items, toggle, remove, setItems }
}

function RowActions({ label, onEdit, onDelete }: { label: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" className="size-8" aria-label={`Editar ${label}`} onClick={onEdit}>
        <Pencil />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-danger hover:bg-danger-muted"
        aria-label={`Eliminar ${label}`}
        onClick={onDelete}
      >
        <Trash2 />
      </Button>
    </div>
  )
}

function StatusToggle({ active, name, onToggle }: { active: boolean; name: string; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-2.5">
      <Toggle checked={active} onChange={onToggle} size="sm" label={`Estado de ${name}`} />
      <Badge variant={active ? 'success' : 'neutral'} size="sm" dot>
        {active ? 'Activo' : 'Inactivo'}
      </Badge>
    </div>
  )
}

/* Unidades de medida ------------------------------------------------ */

export function UnidadesPanel({ onToast }: { onToast: Toast }) {
  const { items, toggle, remove } = useToggleList<UnitOfMeasure>(seedUnits, onToast)
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Unidades de medida"
        description="Unidades disponibles para productos e inventario."
        action={
          <Button variant="primary" size="md" onClick={() => onToast('Nueva unidad (demo)')}>
            <Plus />
            Nueva unidad
          </Button>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Abreviatura</TableHead>
            <TableHead className="hidden md:table-cell">Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium text-foreground">{u.name}</TableCell>
              <TableCell className="text-muted-foreground">{u.abbr}</TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="neutral" size="sm">
                  {u.type}
                </Badge>
              </TableCell>
              <TableCell>
                <StatusToggle active={u.active} name={u.name} onToggle={() => toggle(u.id)} />
              </TableCell>
              <TableCell>
                <RowActions label={u.name} onEdit={() => onToast(`Editar ${u.name} (demo)`)} onDelete={() => remove(u.id)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/* Categorías -------------------------------------------------------- */

export function CategoriasPanel({ onToast }: { onToast: Toast }) {
  const { items, toggle, remove } = useToggleList<Category>(seedCategories, onToast)
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Categorías"
        description="Clasificación de productos para organizar el catálogo."
        action={
          <Button variant="primary" size="md" onClick={() => onToast('Nueva categoría (demo)')}>
            <Plus />
            Nueva categoría
          </Button>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Productos</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium text-foreground">{c.name}</TableCell>
              <TableCell className="text-muted-foreground">{c.products}</TableCell>
              <TableCell>
                <StatusToggle active={c.active} name={c.name} onToggle={() => toggle(c.id)} />
              </TableCell>
              <TableCell>
                <RowActions label={c.name} onEdit={() => onToast(`Editar ${c.name} (demo)`)} onDelete={() => remove(c.id)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/* Marcas ------------------------------------------------------------ */

export function MarcasPanel({ onToast }: { onToast: Toast }) {
  const { items, toggle, remove } = useToggleList<Brand>(seedBrands, onToast)
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Marcas"
        description="Fabricantes y marcas asociadas a los productos."
        action={
          <Button variant="primary" size="md" onClick={() => onToast('Nueva marca (demo)')}>
            <Plus />
            Nueva marca
          </Button>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Productos</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((b) => (
            <TableRow key={b.id}>
              <TableCell className="font-medium text-foreground">{b.name}</TableCell>
              <TableCell className="text-muted-foreground">{b.products}</TableCell>
              <TableCell>
                <StatusToggle active={b.active} name={b.name} onToggle={() => toggle(b.id)} />
              </TableCell>
              <TableCell>
                <RowActions label={b.name} onEdit={() => onToast(`Editar ${b.name} (demo)`)} onDelete={() => remove(b.id)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/* Impuestos (inventario) -------------------------------------------- */

export function ImpuestosInvPanel({ onToast }: { onToast: Toast }) {
  const { items, toggle, remove } = useToggleList<Tax>(seedTaxes, onToast)
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Impuestos"
        description="Tarifas de impuestos aplicables a los productos."
        action={
          <Button variant="primary" size="md" onClick={() => onToast('Nuevo impuesto (demo)')}>
            <Plus />
            Nuevo impuesto
          </Button>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tarifa</TableHead>
            <TableHead className="hidden md:table-cell">Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium text-foreground">{t.name}</TableCell>
              <TableCell className="text-muted-foreground">{t.rate}%</TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="neutral" size="sm">
                  {t.type}
                </Badge>
              </TableCell>
              <TableCell>
                <StatusToggle active={t.active} name={t.name} onToggle={() => toggle(t.id)} />
              </TableCell>
              <TableCell>
                <RowActions label={t.name} onEdit={() => onToast(`Editar ${t.name} (demo)`)} onDelete={() => remove(t.id)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/* Listas de precios ------------------------------------------------- */

export function ListasPreciosPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<PriceList[]>(seedPriceLists)
  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        onToast(`${p.name} ${!p.active ? 'activada' : 'desactivada'}`)
        return { ...p, active: !p.active }
      }),
    )
  const makeDefault = (id: string) =>
    setItems((prev) => {
      const found = prev.find((x) => x.id === id)
      if (found) onToast(`${found.name} definida como predeterminada`)
      return prev.map((p) => ({ ...p, isDefault: p.id === id }))
    })

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Listas de precios"
        description="Define distintos niveles de precio para clientes y canales."
        action={
          <Button variant="primary" size="md" onClick={() => onToast('Nueva lista de precios (demo)')}>
            <Plus />
            Nueva lista
          </Button>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Ajuste</TableHead>
            <TableHead className="hidden md:table-cell">Moneda</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{p.name}</span>
                  {p.isDefault && (
                    <Badge variant="primary" size="sm">
                      Predeterminada
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{p.adjustment}</TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">{p.currency}</TableCell>
              <TableCell>
                <StatusToggle active={p.active} name={p.name} onToggle={() => toggle(p.id)} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Definir ${p.name} como predeterminada`}
                    disabled={p.isDefault}
                    onClick={() => makeDefault(p.id)}
                  >
                    <Star className={p.isDefault ? 'fill-primary text-primary' : ''} />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8" aria-label={`Editar ${p.name}`} onClick={() => onToast(`Editar ${p.name} (demo)`)}>
                    <Pencil />
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

/* Configuración de stock -------------------------------------------- */

export function StockPanel({ onToast }: { onToast: Toast }) {
  const [form, setForm] = React.useState<StockConfig>(stockConfig)
  const [saving, setSaving] = React.useState(false)
  const setBool = (k: keyof StockConfig, v: boolean) => setForm((p) => ({ ...p, [k]: v }))
  const save = () => {
    setSaving(true)
    window.setTimeout(() => {
      setSaving(false)
      onToast('Configuración de stock guardada')
    }, 700)
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Configuración de stock"
        description="Reglas de control de inventario y alertas de existencias."
      />
      <Card>
        <CardContent className="pt-2">
          <DividedList>
            <SettingRow
              title="Controlar inventario"
              description="Descontar existencias automáticamente en cada venta"
              control={<Toggle checked={form.trackStock} onChange={(v) => setBool('trackStock', v)} label="Controlar inventario" />}
            />
            <SettingRow
              title="Permitir stock negativo"
              description="Vender productos aunque no haya existencias registradas"
              control={<Toggle checked={form.allowNegative} onChange={(v) => setBool('allowNegative', v)} label="Permitir stock negativo" />}
            />
            <SettingRow
              title="Alertas de stock bajo"
              description="Notificar cuando un producto llegue al mínimo definido"
              control={<Toggle checked={form.lowStockAlerts} onChange={(v) => setBool('lowStockAlerts', v)} label="Alertas de stock bajo" />}
            />
            <SettingRow
              title="Descuento automático de kits"
              description="Descontar componentes al vender productos compuestos"
              control={<Toggle checked={form.autoDiscount} onChange={(v) => setBool('autoDiscount', v)} label="Descuento automático de kits" />}
            />
          </DividedList>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-5">
          <FieldGrid>
            <Field>
              <Label htmlFor="lowStockThreshold">Umbral de stock bajo</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                value={String(form.lowStockThreshold)}
                onChange={(e) => setForm((p) => ({ ...p, lowStockThreshold: Number(e.target.value) }))}
              />
            </Field>
            <Field>
              <Label htmlFor="costingMethod">Método de costeo</Label>
              <Select
                id="costingMethod"
                value={form.costingMethod}
                onChange={(e) => setForm((p) => ({ ...p, costingMethod: e.target.value }))}
              >
                <option>Promedio ponderado</option>
                <option>PEPS (FIFO)</option>
                <option>UEPS (LIFO)</option>
                <option>Costo estándar</option>
              </Select>
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>
      <SaveBar onSave={save} onReset={() => setForm(stockConfig)} saving={saving} />
    </div>
  )
}
