'use client'

import * as React from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
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
import { SectionHeader, Toggle, SettingRow, DividedList } from './settings-ui'
import {
  paymentMethods as seedPayment,
  saleTypes as seedSaleTypes,
  discounts as seedDiscounts,
  taxes as seedTaxes,
  sequences as seedSequences,
  type PaymentMethod,
  type SaleType,
  type Discount,
  type Tax,
  type Sequence,
} from './mock-data'
import { settingsApi } from '@/lib/api'

type Toast = (msg: string, kind?: 'success' | 'error') => void

/* ==========================================================================
 * Métodos de Pago
 * ========================================================================== */

export function MetodosPagoPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<PaymentMethod[]>(seedPayment)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<PaymentMethod | null>(null)

  React.useEffect(() => {
    settingsApi.getAppConfig<PaymentMethod[]>('ventas_metodos_pago')
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setItems(res.data)
      })
      .catch(() => {})
  }, [])

  const persist = async (next: PaymentMethod[]) => {
    setItems(next)
    try {
      await settingsApi.updateAppConfig('ventas_metodos_pago', next)
    } catch {}
  }

  const handleOpenCreate = () => {
    setEditingItem({
      id: `pay-${Date.now()}`,
      name: '',
      description: '',
      active: true,
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (m: PaymentMethod) => {
    setEditingItem({ ...m })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !editingItem.name.trim()) {
      onToast('Ingresa el nombre del método de pago', 'error')
      return
    }

    const exists = items.some((x) => x.id === editingItem.id)
    const next = exists
      ? items.map((x) => (x.id === editingItem.id ? editingItem : x))
      : [...items, editingItem]

    await persist(next)
    onToast(`Método de pago "${editingItem.name}" guardado`)
    setModalOpen(false)
    setEditingItem(null)
  }

  const toggle = async (id: string) => {
    const next = items.map((m) => {
      if (m.id !== id) return m
      onToast(`${m.name} ${!m.active ? 'activado' : 'desactivado'}`)
      return { ...m, active: !m.active }
    })
    await persist(next)
  }

  const remove = async (id: string) => {
    const found = items.find((x) => x.id === id)
    if (found && confirm(`¿Eliminar el método ${found.name}?`)) {
      const next = items.filter((x) => x.id !== id)
      onToast(`Método ${found.name} eliminado`, 'error')
      await persist(next)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Métodos de pago"
        description="Formas de pago aceptadas en el punto de venta (Efectivo, Tarjetas, QR, Crédito)."
        action={
          <Button variant="primary" size="md" onClick={handleOpenCreate}>
            <Plus className="size-4" />
            Nuevo método
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-2">
          <DividedList>
            {items.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Toggle checked={m.active} onChange={() => toggle(m.id)} label={`Estado de ${m.name}`} />
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => handleOpenEdit(m)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8 text-danger" onClick={() => remove(m.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </DividedList>
        </CardContent>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={items.some((x) => x.id === editingItem?.id) ? 'Editar método de pago' : 'Nuevo método de pago'}
      >
        {editingItem && (
          <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
            <div>
              <Label required>Nombre del método</Label>
              <Input
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                placeholder="Ej: Daviplata QR"
                required
              />
            </div>
            <div>
              <Label>Descripción / Instrucciones</Label>
              <Input
                value={editingItem.description}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                placeholder="Ej: Pago móvil mediante código QR"
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
 * Tipos de Venta
 * ========================================================================== */

export function TiposVentaPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<SaleType[]>(seedSaleTypes)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<SaleType | null>(null)

  React.useEffect(() => {
    settingsApi.getAppConfig<SaleType[]>('ventas_tipos_venta')
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setItems(res.data)
      })
      .catch(() => {})
  }, [])

  const persist = async (next: SaleType[]) => {
    setItems(next)
    try {
      await settingsApi.updateAppConfig('ventas_tipos_venta', next)
    } catch {}
  }

  const handleOpenCreate = () => {
    setEditingItem({
      id: `st-${Date.now()}`,
      name: '',
      description: '',
      active: true,
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (s: SaleType) => {
    setEditingItem({ ...s })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !editingItem.name.trim()) {
      onToast('Ingresa el nombre del tipo de venta', 'error')
      return
    }

    const exists = items.some((x) => x.id === editingItem.id)
    const next = exists
      ? items.map((x) => (x.id === editingItem.id ? editingItem : x))
      : [...items, editingItem]

    await persist(next)
    onToast(`Tipo de venta "${editingItem.name}" guardado`)
    setModalOpen(false)
    setEditingItem(null)
  }

  const toggle = async (id: string) => {
    const next = items.map((s) => {
      if (s.id !== id) return s
      onToast(`${s.name} ${!s.active ? 'activado' : 'desactivado'}`)
      return { ...s, active: !s.active }
    })
    await persist(next)
  }

  const remove = async (id: string) => {
    const found = items.find((x) => x.id === id)
    if (found && confirm(`¿Eliminar el tipo de venta "${found.name}"?`)) {
      const next = items.filter((x) => x.id !== id)
      onToast(`Tipo de venta ${found.name} eliminado`, 'error')
      await persist(next)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Tipos de venta"
        description="Modalidades comerciales disponibles en el POS (Contado, Crédito, Preventa, Consignación)."
        action={
          <Button variant="primary" size="md" onClick={handleOpenCreate}>
            <Plus className="size-4" />
            Nuevo tipo
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-2">
          <DividedList>
            {items.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Toggle checked={s.active} onChange={() => toggle(s.id)} label={`Estado de ${s.name}`} />
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => handleOpenEdit(s)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8 text-danger" onClick={() => remove(s.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </DividedList>
        </CardContent>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={items.some((x) => x.id === editingItem?.id) ? 'Editar tipo de venta' : 'Nuevo tipo de venta'}
      >
        {editingItem && (
          <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
            <div>
              <Label required>Nombre del tipo de venta</Label>
              <Input
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                placeholder="Ej: Domicilio / Rappi"
                required
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Input
                value={editingItem.description}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                placeholder="Ej: Pedidos a través de plataformas externas"
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
 * Descuentos Comerciales
 * ========================================================================== */

export function DescuentosPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<Discount[]>(seedDiscounts)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<Discount | null>(null)

  React.useEffect(() => {
    settingsApi.getAppConfig<Discount[]>('ventas_descuentos')
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setItems(res.data)
      })
      .catch(() => {})
  }, [])

  const persist = async (next: Discount[]) => {
    setItems(next)
    try {
      await settingsApi.updateAppConfig('ventas_descuentos', next)
    } catch {}
  }

  const handleOpenCreate = () => {
    setEditingItem({
      id: `disc-${Date.now()}`,
      name: '',
      type: 'Porcentaje',
      value: '10%',
      scope: 'Ticket completo',
      active: true,
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (d: Discount) => {
    setEditingItem({ ...d })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !editingItem.name.trim() || !editingItem.value.trim()) {
      onToast('Completa los campos requeridos', 'error')
      return
    }

    const exists = items.some((x) => x.id === editingItem.id)
    const next = exists
      ? items.map((x) => (x.id === editingItem.id ? editingItem : x))
      : [...items, editingItem]

    await persist(next)
    onToast(`Descuento "${editingItem.name}" guardado`)
    setModalOpen(false)
    setEditingItem(null)
  }

  const toggle = async (id: string) => {
    const next = items.map((d) => {
      if (d.id !== id) return d
      onToast(`${d.name} ${!d.active ? 'activado' : 'desactivado'}`)
      return { ...d, active: !d.active }
    })
    await persist(next)
  }

  const remove = async (id: string) => {
    const found = items.find((x) => x.id === id)
    if (found && confirm(`¿Eliminar el descuento ${found.name}?`)) {
      const next = items.filter((x) => x.id !== id)
      onToast(`Descuento ${found.name} eliminado`, 'error')
      await persist(next)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Descuentos"
        description="Reglas de descuento comerciales aplicables en ventas por ticket o por ítem."
        action={
          <Button variant="primary" size="md" onClick={handleOpenCreate}>
            <Plus className="size-4" />
            Nuevo descuento
          </Button>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden md:table-cell">Tipo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead className="hidden lg:table-cell">Alcance</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((d) => (
            <TableRow key={d.id}>
              <TableCell className="font-medium text-foreground">{d.name}</TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="neutral" size="sm">
                  {d.type}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{d.value}</TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">{d.scope}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Toggle checked={d.active} onChange={() => toggle(d.id)} size="sm" label={`Estado de ${d.name}`} />
                  <Badge variant={d.active ? 'success' : 'neutral'} size="sm" dot>
                    {d.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => handleOpenEdit(d)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8 text-danger" onClick={() => remove(d.id)}>
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
        title={items.some((x) => x.id === editingItem?.id) ? 'Editar descuento' : 'Nuevo descuento'}
      >
        {editingItem && (
          <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
            <div>
              <Label required>Nombre del descuento</Label>
              <Input
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                placeholder="Ej: Descuento Empleados"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <Select
                  value={editingItem.type}
                  onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as any })}
                >
                  <option value="Porcentaje">Porcentaje (%)</option>
                  <option value="Monto fijo">Monto fijo ($)</option>
                </Select>
              </div>
              <div>
                <Label required>Valor</Label>
                <Input
                  value={editingItem.value}
                  onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                  placeholder="Ej: 15% o $10.000"
                  required
                />
              </div>
            </div>
            <div>
              <Label>Alcance</Label>
              <Select
                value={editingItem.scope}
                onChange={(e) => setEditingItem({ ...editingItem, scope: e.target.value as any })}
              >
                <option value="Ticket completo">Ticket completo</option>
                <option value="Por producto">Por producto o ítem</option>
                <option value="Cliente específico">Cliente registrado</option>
              </Select>
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
 * Impuestos en Ventas
 * ========================================================================== */

export function ImpuestosVentasPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<Tax[]>(seedTaxes)

  React.useEffect(() => {
    settingsApi.getAppConfig<Tax[]>('inventario_impuestos')
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setItems(res.data)
      })
      .catch(() => {})
  }, [])

  const toggle = async (id: string) => {
    const next = items.map((t) => {
      if (t.id !== id) return t
      onToast(`${t.name} ${!t.active ? 'activado' : 'desactivado'}`)
      return { ...t, active: !t.active }
    })
    setItems(next)
    await settingsApi.updateAppConfig('inventario_impuestos', next).catch(() => {})
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Impuestos en ventas"
        description="Impuestos fiscales aplicables a las ventas y facturación de la empresa."
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tarifa</TableHead>
            <TableHead className="hidden md:table-cell">Tipo</TableHead>
            <TableHead>Estado</TableHead>
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
                <div className="flex items-center gap-2.5">
                  <Toggle checked={t.active} onChange={() => toggle(t.id)} size="sm" label={`Estado de ${t.name}`} />
                  <Badge variant={t.active ? 'success' : 'neutral'} size="sm" dot>
                    {t.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/* ==========================================================================
 * Consecutivos de Venta
 * ========================================================================== */

export function ConsecutivosPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<Sequence[]>(seedSequences)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<Sequence | null>(null)

  React.useEffect(() => {
    settingsApi.getAppConfig<Sequence[]>('ventas_consecutivos')
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) setItems(res.data)
      })
      .catch(() => {})
  }, [])

  const persist = async (next: Sequence[]) => {
    setItems(next)
    try {
      await settingsApi.updateAppConfig('ventas_consecutivos', next)
    } catch {}
  }

  const handleOpenEdit = (s: Sequence) => {
    setEditingItem({ ...s })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    const next = items.map((x) => (x.id === editingItem.id ? editingItem : x))
    await persist(next)
    onToast(`Consecutivo para "${editingItem.document}" actualizado`)
    setModalOpen(false)
    setEditingItem(null)
  }

  const toggle = async (id: string) => {
    const next = items.map((s) => {
      if (s.id !== id) return s
      onToast(`Consecutivo ${s.document} ${!s.active ? 'activado' : 'desactivado'}`)
      return { ...s, active: !s.active }
    })
    await persist(next)
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Consecutivos"
        description="Control de numeración automática para comprobantes de venta, turnos y remisiones."
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Documento</TableHead>
            <TableHead>Prefijo</TableHead>
            <TableHead className="hidden md:table-cell">Actual</TableHead>
            <TableHead className="hidden lg:table-cell">Rango autorizado</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium text-foreground">{s.document}</TableCell>
              <TableCell className="font-mono text-muted-foreground">{s.prefix}</TableCell>
              <TableCell className="hidden font-mono text-muted-foreground md:table-cell">
                {s.prefix}-{String(s.current).padStart(5, '0')}
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {s.start.toLocaleString('es-CO')} - {s.end.toLocaleString('es-CO')}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Toggle checked={s.active} onChange={() => toggle(s.id)} size="sm" label={`Estado de ${s.document}`} />
                  <Badge variant={s.active ? 'success' : 'neutral'} size="sm" dot>
                    {s.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={`Editar ${s.document}`}
                  onClick={() => handleOpenEdit(s)}
                >
                  <Pencil className="size-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Editar consecutivo"
      >
        {editingItem && (
          <form onSubmit={handleSave} className="flex flex-col gap-4 py-2">
            <div>
              <Label>Documento</Label>
              <Input value={editingItem.document} disabled />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Prefijo</Label>
                <Input
                  value={editingItem.prefix}
                  onChange={(e) => setEditingItem({ ...editingItem, prefix: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div>
                <Label required>Número actual</Label>
                <Input
                  type="number"
                  value={editingItem.current}
                  onChange={(e) => setEditingItem({ ...editingItem, current: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Rango inicio</Label>
                <Input
                  type="number"
                  value={editingItem.start}
                  onChange={(e) => setEditingItem({ ...editingItem, start: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label required>Rango fin</Label>
                <Input
                  type="number"
                  value={editingItem.end}
                  onChange={(e) => setEditingItem({ ...editingItem, end: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="primary">Guardar cambios</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
