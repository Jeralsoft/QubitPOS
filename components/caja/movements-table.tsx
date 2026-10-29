'use client'

import * as React from 'react'
import { Search, Receipt, XCircle } from 'lucide-react'
import { Input, Select } from '@/components/jeralpos/input'
import { Badge } from '@/components/jeralpos/badge'
import { Button } from '@/components/jeralpos/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/jeralpos/table'
import { cn } from '@/lib/utils'
import {
  formatSignedCurrency,
  movementTypeLabel,
  movementTypeVariant,
  type CashMovement,
  type MovementType,
} from './mock-data'

function TableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({ length: 7 }).map((_, i) => (
            <TableHead key={i}>
              <span className="sr-only">Cargando</span>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 6 }).map((_, r) => (
          <TableRow key={r}>
            {Array.from({ length: 7 }).map((_, c) => (
              <TableCell key={c}>
                <div className="h-4 w-full max-w-[110px] animate-pulse rounded bg-muted" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function MovementsTable({
  movements,
  loading,
}: {
  movements: CashMovement[]
  loading: boolean
}) {
  const [query, setQuery] = React.useState('')
  const [type, setType] = React.useState<MovementType | 'all'>('all')
  const [method, setMethod] = React.useState('all')

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return movements.filter((m) => {
      if (q) {
        const hit =
          m.concept.toLowerCase().includes(q) ||
          m.reference.toLowerCase().includes(q) ||
          m.user.toLowerCase().includes(q)
        if (!hit) return false
      }
      if (type !== 'all' && m.type !== type) return false
      if (method !== 'all' && m.method !== method) return false
      return true
    })
  }, [movements, query, type, method])

  const hasFilters = query !== '' || type !== 'all' || method !== 'all'

  const clear = () => {
    setQuery('')
    setType('all')
    setMethod('all')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="lg:max-w-sm lg:flex-1">
          <Input
            leadingIcon={<Search />}
            placeholder="Buscar por concepto, referencia o usuario..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar movimientos"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:ml-auto lg:flex lg:items-center">
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as MovementType | 'all')}
            aria-label="Filtrar por tipo"
          >
            <option value="all">Tipo</option>
            {(Object.keys(movementTypeLabel) as MovementType[]).map((t) => (
              <option key={t} value={t}>
                {movementTypeLabel[t]}
              </option>
            ))}
          </Select>
          <Select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            aria-label="Filtrar por método de pago"
          >
            <option value="all">Método</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Otro">Otro</option>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="md" onClick={clear} className="sm:col-auto">
              <XCircle />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <Receipt className="size-8 text-muted-foreground" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">Sin movimientos</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasFilters
                ? 'Ajusta los filtros para ver otros movimientos.'
                : 'Aún no se han registrado movimientos en esta caja.'}
            </p>
          </div>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clear}>
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead className="hidden md:table-cell">Referencia</TableHead>
                <TableHead className="hidden lg:table-cell">Método de pago</TableHead>
                <TableHead className="hidden xl:table-cell">Usuario</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium tabular-nums text-muted-foreground">
                    {m.time}
                  </TableCell>
                  <TableCell>
                    <Badge variant={movementTypeVariant[m.type]} size="sm">
                      {movementTypeLabel[m.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{m.concept}</TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                    {m.reference}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {m.method}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground xl:table-cell">
                    {m.user}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-semibold tabular-nums',
                      m.value > 0 ? 'text-success' : m.value < 0 ? 'text-danger' : 'text-foreground',
                    )}
                  >
                    {formatSignedCurrency(m.value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
