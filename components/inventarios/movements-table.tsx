'use client'

import * as React from 'react'
import { Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/jeralpos/card'
import { Badge } from '@/components/jeralpos/badge'
import { Input, Select } from '@/components/jeralpos/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/jeralpos/table'
import {
  movements,
  movementTypeMeta,
  formatMovementDate,
  type MovementType,
} from './mock-data'
import { cn } from '@/lib/utils'

const typeOptions: Array<{ value: MovementType | 'all'; label: string }> = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'entrada', label: 'Entrada' },
  { value: 'salida', label: 'Salida' },
  { value: 'ajuste', label: 'Ajuste' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'devolucion', label: 'Devolución' },
]

export function MovementsTable() {
  const [query, setQuery] = React.useState('')
  const [type, setType] = React.useState<MovementType | 'all'>('all')

  const filtered = movements.filter((m) => {
    const matchesType = type === 'all' || m.type === type
    const q = query.trim().toLowerCase()
    const matchesQuery =
      q === '' ||
      m.productName.toLowerCase().includes(q) ||
      m.productCode.toLowerCase().includes(q) ||
      m.user.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q)
    return matchesType && matchesQuery
  })

  return (
    <Card>
      <CardHeader className="gap-4 border-b border-border sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Movimientos de inventario</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Historial de entradas, salidas y ajustes
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="sm:w-64">
            <Input
              placeholder="Buscar producto, usuario o folio..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              leadingIcon={<Search />}
              aria-label="Buscar movimiento"
            />
          </div>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as MovementType | 'all')}
            aria-label="Filtrar por tipo"
            className="sm:w-48"
          >
            {typeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Observación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => {
              const meta = movementTypeMeta[m.type]
              const signed =
                meta.sign === 0
                  ? m.quantity
                  : meta.sign * Math.abs(m.quantity)
              return (
                <TableRow key={m.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    <span className="block font-medium text-foreground">
                      {formatMovementDate(m.date)}
                    </span>
                    <span className="text-xs">{m.id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="block font-medium">{m.productName}</span>
                    <span className="text-xs text-muted-foreground">{m.productCode}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={meta.variant} dot>
                      {meta.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        'font-semibold tabular-nums',
                        signed > 0 && 'text-success',
                        signed < 0 && 'text-danger',
                        signed === 0 && 'text-foreground',
                      )}
                    >
                      {signed > 0 ? '+' : ''}
                      {signed}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{m.user}</TableCell>
                  <TableCell className="max-w-xs text-sm text-muted-foreground">{m.note}</TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No se encontraron movimientos con los filtros aplicados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
