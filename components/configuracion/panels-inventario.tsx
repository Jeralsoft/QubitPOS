'use client'

import * as React from 'react'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
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
import { settingsApi } from '@/lib/api'

type Toast = (msg: string, kind?: 'success' | 'error') => void

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

/* ==========================================================================
 * Unidades de Medida
 * ========================================================================== */

export function UnidadesPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<UnitOfMeasure[]>(seedUnits)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<UnitOfMeasure | null>(null)

  React.useEffect(() => {
    settingsApi.getAppConfig<UnitOfMeasure[]>('inventario_unidades')
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setItems(res.data)
      })
      .catch(() => {})
  }, [])

  const persist = async (next: UnitOfMeasure[]) => {
    setItems(next)
    try {
      await settingsApi.updateAppConfig('inventario_unidades', next)
    } catch {}
  }

  const handleOpenCreate = () => {
    setEditingItem({
      id: `unit-${Date.now()}`,
      name: '',
      abbr: '',
      type: 'Unidad',
      active: true,
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (u: UnitOfMeasure) => {
    setEditingItem({ ...u })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !editingItem.name.trim() || !editingItem.abbr.trim()) {
      onToast('Completa todos los campos', 'error')
      return
    }

    const exists = items.some((x) => x.id === editingItem.id)
    const next = exists
      ? items.map((x) => (x.id === editingItem.id ? editingItem : x))
      : [...items, editingItem]

    await persist(next)
    onToast(`Unidad "${editingItem.name}" guardada con éxito`)
    setModalOpen(false)
    setEditingItem(null)
  }

  const toggle = async (id: string) => {
    const next = items.map((x) => {
      if (x.id !== id) return x
      onToast(`${x.name} ${!x.active ? 'activada' : 'desactivada'}`)
      return { ...x, active: !x.active }
    })
    await persist(next)
  }

  const remove = async (id: string) => {
    const found = items.find((x) => x.id === id)
    if (found && confirm(`¿Eliminar la unidad ${found.name}?`)) {
      const next = items.filter((x) => x.id !== id)
      onToast(`Unidad ${found.name} eliminada`, 'error')
      await persist(next)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Unidades de medida"
        description="Unidades físicas disponibles para control de inventario y venta."
        action={
          <Button variant="primary" size="md" onClick={handleOpenCreate}>
            <Plus className="size-4" />
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
              <TableCell className="font-mono text-muted-foreground">{u.abbr}</TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="neutral" size="sm">
                  {u.type}
                </Badge>
              </TableCell>
              <TableCell>
                <StatusToggle active={u.active} name={u.name} onToggle={() => toggle(u.id)} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => handleOpenEdit(u)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8 text-danger" onClick={() => remove(u.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={items.some((x) => x.id === editingItem?.id) ? 'Editar unidad' : 'Nueva unidad'}
      >
        {editingItem && (
          <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
            <div>
              <Label required>Nombre de la unidad</Label>
              <Input
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                placeholder="Ej: Kilogramo"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Abreviatura</Label>
                <Input
                  value={editingItem.abbr}
                  onChange={(e) => setEditingItem({ ...editingItem, abbr: e.target.value })}
                  placeholder="Ej: kg"
                  required
                />
              </div>
              <div>
                <Label>Tipo de magnitud</Label>
                <Select
                  value={editingItem.type}
                  onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as any })}
                >
                  <option value="Unidad">Unidad (Conteo)</option>
                  <option value="Peso">Peso (Masa)</option>
                  <option value="Volumen">Volumen (Líquidos)</option>
                  <option value="Longitud">Longitud</option>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="primary">Guardar</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

/* ==========================================================================
 * Categorías de Productos
 * ========================================================================== */

export function CategoriasPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<Category[]>(seedCategories)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<Category | null>(null)

  React.useEffect(() => {
    settingsApi.getAppConfig<Category[]>('inventario_categorias')
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setItems(res.data)
      })
      .catch(() => {})
  }, [])

  const persist = async (next: Category[]) => {
    setItems(next)
    try {
      await settingsApi.updateAppConfig('inventario_categorias', next)
    } catch {}
  }

  const handleOpenCreate = () => {
    setEditingItem({
      id: `cat-${Date.now()}`,
      name: '',
      products: 0,
      active: true,
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (c: Category) => {
    setEditingItem({ ...c })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !editingItem.name.trim()) {
      onToast('Ingresa el nombre de la categoría', 'error')
      return
    }

    const exists = items.some((x) => x.id === editingItem.id)
    const next = exists
      ? items.map((x) => (x.id === editingItem.id ? editingItem : x))
      : [...items, editingItem]

    await persist(next)
    onToast(`Categoría "${editingItem.name}" guardada con éxito`)
    setModalOpen(false)
    setEditingItem(null)
  }

  const toggle = async (id: string) => {
    const next = items.map((x) => {
      if (x.id !== id) return x
      onToast(`${x.name} ${!x.active ? 'activada' : 'desactivada'}`)
      return { ...x, active: !x.active }
    })
    await persist(next)
  }

  const remove = async (id: string) => {
    const found = items.find((x) => x.id === id)
    if (found && confirm(`¿Eliminar la categoría "${found.name}"?`)) {
      const next = items.filter((x) => x.id !== id)
      onToast(`Categoría "${found.name}" eliminada`, 'error')
      await persist(next)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Categorías"
        description="Clasificación de productos para organizar el catálogo en el POS y reportes."
        action={
          <Button variant="primary" size="md" onClick={handleOpenCreate}>
            <Plus className="size-4" />
            Nueva categoría
          </Button>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Productos asociados</TableHead>
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
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => handleOpenEdit(c)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8 text-danger" onClick={() => remove(c.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={items.some((x) => x.id === editingItem?.id) ? 'Editar categoría' : 'Nueva categoría'}
      >
        {editingItem && (
          <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
            <div>
              <Label required>Nombre de la categoría</Label>
              <Input
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                placeholder="Ej: Bebidas y Cafés"
                required
              />
            </div>
            <div className="mt-4 flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="primary">Guardar</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

/* ==========================================================================
 * Marcas
 * ========================================================================== */

export function MarcasPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<Brand[]>(seedBrands)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<Brand | null>(null)

  React.useEffect(() => {
    settingsApi.getAppConfig<Brand[]>('inventario_marcas')
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setItems(res.data)
      })
      .catch(() => {})
  }, [])

  const persist = async (next: Brand[]) => {
    setItems(next)
    try {
      await settingsApi.updateAppConfig('inventario_marcas', next)
    } catch {}
  }

  const handleOpenCreate = () => {
    setEditingItem({
      id: `brand-${Date.now()}`,
      name: '',
      products: 0,
      active: true,
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (b: Brand) => {
    setEditingItem({ ...b })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !editingItem.name.trim()) {
      onToast('Ingresa el nombre de la marca', 'error')
      return
    }

    const exists = items.some((x) => x.id === editingItem.id)
    const next = exists
      ? items.map((x) => (x.id === editingItem.id ? editingItem : x))
      : [...items, editingItem]

    await persist(next)
    onToast(`Marca "${editingItem.name}" guardada con éxito`)
    setModalOpen(false)
    setEditingItem(null)
  }

  const toggle = async (id: string) => {
    const next = items.map((x) => {
      if (x.id !== id) return x
      onToast(`${x.name} ${!x.active ? 'activada' : 'desactivada'}`)
      return { ...x, active: !x.active }
    })
    await persist(next)
  }

  const remove = async (id: string) => {
    const found = items.find((x) => x.id === id)
    if (found && confirm(`¿Eliminar la marca "${found.name}"?`)) {
      const next = items.filter((x) => x.id !== id)
      onToast(`Marca "${found.name}" eliminada`, 'error')
      await persist(next)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Marcas"
        description="Fabricantes y marcas comerciales para enriquecer los productos del catálogo."
        action={
          <Button variant="primary" size="md" onClick={handleOpenCreate}>
            <Plus className="size-4" />
            Nueva marca
          </Button>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Productos asociados</TableHead>
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
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => handleOpenEdit(b)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8 text-danger" onClick={() => remove(b.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={items.some((x) => x.id === editingItem?.id) ? 'Editar marca' : 'Nueva marca'}
      >
        {editingItem && (
          <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
            <div>
              <Label required>Nombre de la marca</Label>
              <Input
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                placeholder="Ej: Nestlé"
                required
              />
            </div>
            <div className="mt-4 flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="primary">Guardar</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

/* ==========================================================================
 * Impuestos (Inventario / Ventas)
 * ========================================================================== */

interface TaxFormState {
  id: string
  name: string
  rate: string
  type: 'IVA' | 'INC' | 'Retención' | 'Exento'
  active: boolean
}

export function ImpuestosInvPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<Tax[]>(seedTaxes)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<TaxFormState | null>(null)

  React.useEffect(() => {
    settingsApi.getAppConfig<Tax[]>('inventario_impuestos')
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setItems(res.data)
      })
      .catch(() => {})
  }, [])

  const persist = async (next: Tax[]) => {
    setItems(next)
    try {
      await settingsApi.updateAppConfig('inventario_impuestos', next)
    } catch {}
  }

  const handleOpenCreate = () => {
    setEditingItem({
      id: `tax-${Date.now()}`,
      name: '',
      rate: '19.00',
      type: 'IVA',
      active: true,
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (t: Tax) => {
    setEditingItem({
      id: t.id,
      name: t.name,
      rate: String(t.rate),
      type: t.type,
      active: t.active,
    })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !editingItem.name.trim()) {
      onToast('Completa el nombre de la tarifa', 'error')
      return
    }

    const savedTax: Tax = {
      id: editingItem.id,
      name: editingItem.name,
      rate: Number(editingItem.rate) || 0,
      type: editingItem.type,
      active: editingItem.active,
    }

    const exists = items.some((x) => x.id === savedTax.id)
    const next = exists
      ? items.map((x) => (x.id === savedTax.id ? savedTax : x))
      : [...items, savedTax]

    await persist(next)
    onToast(`Tarifa "${savedTax.name}" guardada`)
    setModalOpen(false)
    setEditingItem(null)
  }

  const toggle = async (id: string) => {
    const next = items.map((x) => {
      if (x.id !== id) return x
      onToast(`${x.name} ${!x.active ? 'activado' : 'desactivado'}`)
      return { ...x, active: !x.active }
    })
    await persist(next)
  }

  const remove = async (id: string) => {
    const found = items.find((x) => x.id === id)
    if (found && confirm(`¿Eliminar la tarifa ${found.name}?`)) {
      const next = items.filter((x) => x.id !== id)
      onToast(`Tarifa ${found.name} eliminada`, 'error')
      await persist(next)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Impuestos"
        description="Tarifas fiscales (IVA, Impoconsumo, Exentos) aplicables a productos."
        action={
          <Button variant="primary" size="md" onClick={handleOpenCreate}>
            <Plus className="size-4" />
            Nuevo impuesto
          </Button>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tarifa (%)</TableHead>
            <TableHead className="hidden md:table-cell">Tipo fiscal</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium text-foreground">{t.name}</TableCell>
              <TableCell className="font-mono text-muted-foreground">{t.rate}%</TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="neutral" size="sm">
                  {t.type}
                </Badge>
              </TableCell>
              <TableCell>
                <StatusToggle active={t.active} name={t.name} onToggle={() => toggle(t.id)} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => handleOpenEdit(t)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8 text-danger" onClick={() => remove(t.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={items.some((x) => x.id === editingItem?.id) ? 'Editar impuesto' : 'Nuevo impuesto'}
      >
        {editingItem && (
          <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
            <div>
              <Label required>Nombre del impuesto</Label>
              <Input
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                placeholder="Ej: IVA 19%"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Porcentaje / Tarifa</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingItem.rate}
                  onChange={(e) => setEditingItem({ ...editingItem, rate: e.target.value })}
                  placeholder="19.00"
                  required
                />
              </div>
              <div>
                <Label>Tipo fiscal</Label>
                <Select
                  value={editingItem.type}
                  onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as any })}
                >
                  <option value="IVA">IVA (Valor Agregado)</option>
                  <option value="INC">INC (Consumo / Restaurante)</option>
                  <option value="Retención">Retención en la fuente</option>
                  <option value="Exento">Exento (Tarifa 0%)</option>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="primary">Guardar</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

/* ==========================================================================
 * Listas de Precios
 * ========================================================================== */

export function ListasPreciosPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<PriceList[]>(seedPriceLists)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<PriceList | null>(null)

  React.useEffect(() => {
    settingsApi.getAppConfig<PriceList[]>('inventario_listas_precios')
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setItems(res.data)
      })
      .catch(() => {})
  }, [])

  const persist = async (next: PriceList[]) => {
    setItems(next)
    try {
      await settingsApi.updateAppConfig('inventario_listas_precios', next)
    } catch {}
  }

  const handleOpenCreate = () => {
    setEditingItem({
      id: `pl-${Date.now()}`,
      name: '',
      adjustment: '-10%',
      currency: 'COP',
      isDefault: false,
      active: true,
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (pl: PriceList) => {
    setEditingItem({ ...pl })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !editingItem.name.trim()) {
      onToast('Ingresa el nombre de la lista de precios', 'error')
      return
    }

    const exists = items.some((x) => x.id === editingItem.id)
    let next = exists
      ? items.map((x) => (x.id === editingItem.id ? editingItem : x))
      : [...items, editingItem]

    if (editingItem.isDefault) {
      next = next.map((x) => ({ ...x, isDefault: x.id === editingItem.id }))
    }

    await persist(next)
    onToast(`Lista "${editingItem.name}" guardada con éxito`)
    setModalOpen(false)
    setEditingItem(null)
  }

  const toggle = async (id: string) => {
    const next = items.map((x) => {
      if (x.id !== id) return x
      onToast(`${x.name} ${!x.active ? 'activada' : 'desactivada'}`)
      return { ...x, active: !x.active }
    })
    await persist(next)
  }

  const remove = async (id: string) => {
    const found = items.find((x) => x.id === id)
    if (found && confirm(`¿Eliminar la lista "${found.name}"?`)) {
      const next = items.filter((x) => x.id !== id)
      onToast(`Lista "${found.name}" eliminada`, 'error')
      await persist(next)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Listas de precios"
        description="Estructuras de precio diferenciadas (Detal, Mayorista, VIP, Distribuidores)."
        action={
          <Button variant="primary" size="md" onClick={handleOpenCreate}>
            <Plus className="size-4" />
            Nueva lista
          </Button>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Ajuste / Margen</TableHead>
            <TableHead>Moneda</TableHead>
            <TableHead>Por defecto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((pl) => (
            <TableRow key={pl.id}>
              <TableCell className="font-medium text-foreground">{pl.name}</TableCell>
              <TableCell className="text-muted-foreground">{pl.adjustment}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{pl.currency}</TableCell>
              <TableCell>
                {pl.isDefault ? (
                  <Badge variant="primary" size="sm">
                    <Star className="size-3 fill-primary" /> Predeterminada
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <StatusToggle active={pl.active} name={pl.name} onToggle={() => toggle(pl.id)} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => handleOpenEdit(pl)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8 text-danger" onClick={() => remove(pl.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={items.some((x) => x.id === editingItem?.id) ? 'Editar lista de precios' : 'Nueva lista de precios'}
      >
        {editingItem && (
          <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
            <div>
              <Label required>Nombre de la lista</Label>
              <Input
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                placeholder="Ej: Mayorista VIP"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ajuste o Descuento (%)</Label>
                <Input
                  value={editingItem.adjustment}
                  onChange={(e) => setEditingItem({ ...editingItem, adjustment: e.target.value })}
                  placeholder="Ej: -12%"
                />
              </div>
              <div>
                <Label>Moneda</Label>
                <Input
                  value={editingItem.currency}
                  onChange={(e) => setEditingItem({ ...editingItem, currency: e.target.value })}
                  placeholder="COP"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Toggle
                checked={editingItem.isDefault}
                onChange={(v) => setEditingItem({ ...editingItem, isDefault: v })}
                label="Lista por defecto"
              />
              <span className="text-sm font-medium text-foreground">
                Establecer como lista de precios predeterminada en el POS
              </span>
            </div>
            <div className="mt-4 flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="primary">Guardar</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

/* ==========================================================================
 * Configuración de Stock e Inventarios
 * ========================================================================== */

export function StockPanel({ onToast }: { onToast: Toast }) {
  const [form, setForm] = React.useState<StockConfig>(stockConfig)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    settingsApi.getAppConfig<StockConfig>('inventario_stock_config')
      .then((res) => {
        if (res.data) setForm(res.data)
      })
      .catch(() => {})
  }, [])

  const setBool = (k: keyof StockConfig, v: boolean) => setForm((p) => ({ ...p, [k]: v }))
  const setNum = (k: keyof StockConfig, v: number) => setForm((p) => ({ ...p, [k]: v }))
  const setStr = (k: keyof StockConfig, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const save = async () => {
    try {
      setSaving(true)
      await settingsApi.updateAppConfig('inventario_stock_config', form)
      onToast('Políticas de inventario y stock guardadas en el servidor')
    } catch {
      onToast('Configuración guardada localmente')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Configuración de stock"
        description="Reglas de valuación de Kárdex, venta sin existencias y alertas de inventario."
      />
      <Card>
        <CardContent className="pt-2">
          <DividedList>
            <SettingRow
              title="Permitir venta en negativo"
              description="Vender productos aunque no existan unidades físicas registradas en el Kárdex."
              control={<Toggle checked={form.allowNegative} onChange={(v) => setBool('allowNegative', v)} label="Permitir venta en negativo" />}
            />
            <SettingRow
              title="Alertar stock mínimo"
              description="Mostrar advertencias en la caja POS cuando el stock caiga por debajo del umbral de seguridad."
              control={<Toggle checked={form.lowStockAlerts} onChange={(v) => setBool('lowStockAlerts', v)} label="Alertar stock mínimo" />}
            />
            <SettingRow
              title="Descontar stock automáticamente al vender"
              description="Ejecutar bloqueo pesimista lockForUpdate() y asentar el movimiento Kárdex de forma atómica."
              control={<Toggle checked={form.autoDiscount} onChange={(v) => setBool('autoDiscount', v)} label="Descontar stock" />}
            />
          </DividedList>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-5">
          <FieldGrid>
            <Field>
              <Label htmlFor="lowStockThreshold">Umbral de stock mínimo global (unidades)</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                value={form.lowStockThreshold}
                onChange={(e) => setNum('lowStockThreshold', Number(e.target.value) || 0)}
              />
            </Field>
            <Field>
              <Label htmlFor="costingMethod">Método de valuación Kárdex</Label>
              <Select id="costingMethod" value={form.costingMethod} onChange={(e) => setStr('costingMethod', e.target.value)}>
                <option value="Promedio ponderado">Promedio Ponderado (Recomendado NIIF/DIAN)</option>
                <option value="PEPS / FIFO">Primeras en Entrar, Primeras en Salir (PEPS/FIFO)</option>
                <option value="UEPS / LIFO">Últimas en Entrar, Primeras en Salir (UEPS)</option>
              </Select>
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>
      <SaveBar onSave={save} onReset={() => setForm(stockConfig)} saving={saving} />
    </div>
  )
}
