'use client'

import * as React from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Badge } from '@/components/jeralpos/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/jeralpos/table'
import { SectionHeader, Toggle } from './settings-ui'
import { branches as seedBranches, registers as seedRegisters, type Branch, type Register } from './mock-data'

type Toast = (msg: string, kind?: 'success' | 'error') => void

export function SucursalesPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<Branch[]>(seedBranches)
  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        onToast(`${b.name} ${!b.active ? 'activada' : 'desactivada'}`)
        return { ...b, active: !b.active }
      }),
    )

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Sucursales"
        description="Puntos de operación de la empresa con su información de contacto."
        action={
          <Button variant="primary" size="md" onClick={() => onToast('Formulario de sucursal (demo)')}>
            <Plus />
            Nueva sucursal
          </Button>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Código</TableHead>
            <TableHead className="hidden md:table-cell">Dirección</TableHead>
            <TableHead className="hidden lg:table-cell">Teléfono</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((b) => (
            <TableRow key={b.id}>
              <TableCell className="font-medium text-foreground">{b.name}</TableCell>
              <TableCell className="text-muted-foreground">{b.code}</TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">{b.address}</TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">{b.phone}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Toggle checked={b.active} onChange={() => toggle(b.id)} size="sm" label={`Estado de ${b.name}`} />
                  <Badge variant={b.active ? 'success' : 'neutral'} size="sm" dot>
                    {b.active ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="size-8" aria-label={`Editar ${b.name}`} onClick={() => onToast(`Editar ${b.name} (demo)`)}>
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-danger hover:bg-danger-muted"
                    aria-label={`Eliminar ${b.name}`}
                    onClick={() => {
                      setItems((prev) => prev.filter((x) => x.id !== b.id))
                      onToast(`${b.name} eliminada`, 'error')
                    }}
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

export function CajasPanel({ onToast }: { onToast: Toast }) {
  const [items, setItems] = React.useState<Register[]>(seedRegisters)
  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        onToast(`${c.name} ${!c.active ? 'activada' : 'desactivada'}`)
        return { ...c, active: !c.active }
      }),
    )

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Cajas"
        description="Terminales de venta asociadas a cada sucursal."
        action={
          <Button variant="primary" size="md" onClick={() => onToast('Formulario de caja (demo)')}>
            <Plus />
            Nueva caja
          </Button>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Sucursal</TableHead>
            <TableHead className="hidden md:table-cell">Terminal</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium text-foreground">{c.name}</TableCell>
              <TableCell className="text-muted-foreground">{c.branch}</TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">{c.terminal}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Toggle checked={c.active} onChange={() => toggle(c.id)} size="sm" label={`Estado de ${c.name}`} />
                  <Badge variant={c.active ? 'success' : 'neutral'} size="sm" dot>
                    {c.active ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="size-8" aria-label={`Editar ${c.name}`} onClick={() => onToast(`Editar ${c.name} (demo)`)}>
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-danger hover:bg-danger-muted"
                    aria-label={`Eliminar ${c.name}`}
                    onClick={() => {
                      setItems((prev) => prev.filter((x) => x.id !== c.id))
                      onToast(`${c.name} eliminada`, 'error')
                    }}
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
