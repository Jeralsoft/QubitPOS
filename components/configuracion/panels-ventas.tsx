'use client'

import * as React from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Badge } from '@/components/jeralpos/badge'
import { Card, CardContent } from '@/components/jeralpos/card'
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

type Toast = (msg: string, kind?: 'success' | 'error') => void

/* Métodos de pago --------------------------------------------------- */

export function MetodosPagoPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<PaymentMethod[]>(seedPayment)
  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        onToast(`${m.name} ${!m.active ? 'activado' : 'desactivado'}`)
        return { ...m, active: !m.active }
      }),
    )
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Métodos de pago"
        description="Formas de pago aceptadas en el punto de venta."
        action={
          <Button variant="primary" size="md" onClick={() => onToast('Nuevo método de pago (demo)')}>
            <Plus />
            Nuevo método
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-2">
          <DividedList>
            {items.map((m) => (
              <SettingRow
                key={m.id}
                title={m.name}
                description={m.description}
                control={<Toggle checked={m.active} onChange={() => toggle(m.id)} label={`Estado de ${m.name}`} />}
              />
            ))}
          </DividedList>
        </CardContent>
      </Card>
    </div>
  )
}

/* Tipos de venta ---------------------------------------------------- */

export function TiposVentaPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<SaleType[]>(seedSaleTypes)
  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        onToast(`${s.name} ${!s.active ? 'activado' : 'desactivado'}`)
        return { ...s, active: !s.active }
      }),
    )
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Tipos de venta"
        description="Modalidades de venta disponibles para los cajeros."
        action={
          <Button variant="primary" size="md" onClick={() => onToast('Nuevo tipo de venta (demo)')}>
            <Plus />
            Nuevo tipo
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-2">
          <DividedList>
            {items.map((s) => (
              <SettingRow
                key={s.id}
                title={s.name}
                description={s.description}
                control={<Toggle checked={s.active} onChange={() => toggle(s.id)} label={`Estado de ${s.name}`} />}
              />
            ))}
          </DividedList>
        </CardContent>
      </Card>
    </div>
  )
}

/* Descuentos -------------------------------------------------------- */

export function DescuentosPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<Discount[]>(seedDiscounts)
  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d
        onToast(`${d.name} ${!d.active ? 'activado' : 'desactivado'}`)
        return { ...d, active: !d.active }
      }),
    )
  const remove = (id: string) =>
    setItems((prev) => {
      const found = prev.find((x) => x.id === id)
      if (found) onToast(`${found.name} eliminado`, 'error')
      return prev.filter((x) => x.id !== id)
    })
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Descuentos"
        description="Reglas de descuento aplicables en ventas."
        action={
          <Button variant="primary" size="md" onClick={() => onToast('Nuevo descuento (demo)')}>
            <Plus />
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
                  <Button variant="ghost" size="icon" className="size-8" aria-label={`Editar ${d.name}`} onClick={() => onToast(`Editar ${d.name} (demo)`)}>
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-danger hover:bg-danger-muted"
                    aria-label={`Eliminar ${d.name}`}
                    onClick={() => remove(d.id)}
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

/* Impuestos (ventas) ------------------------------------------------ */

export function ImpuestosVentasPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<Tax[]>(seedTaxes)
  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        onToast(`${t.name} ${!t.active ? 'activado' : 'desactivado'}`)
        return { ...t, active: !t.active }
      }),
    )
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Impuestos en ventas"
        description="Impuestos que se aplican al total de las facturas."
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

/* Consecutivos ------------------------------------------------------ */

export function ConsecutivosPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<Sequence[]>(seedSequences)
  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        onToast(`Consecutivo ${s.document} ${!s.active ? 'activado' : 'desactivado'}`)
        return { ...s, active: !s.active }
      }),
    )
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Consecutivos"
        description="Numeración automática por tipo de documento."
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Documento</TableHead>
            <TableHead>Prefijo</TableHead>
            <TableHead className="hidden md:table-cell">Actual</TableHead>
            <TableHead className="hidden lg:table-cell">Rango</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium text-foreground">{s.document}</TableCell>
              <TableCell className="text-muted-foreground">{s.prefix}</TableCell>
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
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="size-8" aria-label={`Editar ${s.document}`} onClick={() => onToast(`Editar ${s.document} (demo)`)}>
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
