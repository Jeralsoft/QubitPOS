'use client'

import * as React from 'react'
import { Search, XCircle, FileX, Download } from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Input, Select, Label } from '@/components/jeralpos/input'
import { Badge } from '@/components/jeralpos/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/jeralpos/table'
import {
  auditLog,
  auditActionConfig,
  type AuditAction,
} from './mock-data'

const moduleOptions = Array.from(new Set(auditLog.map((a) => a.module))).sort()

export function AuditTable({ onToast }: { onToast: (msg: string) => void }) {
  const [query, setQuery] = React.useState('')
  const [action, setAction] = React.useState<AuditAction | 'all'>('all')
  const [moduleFilter, setModuleFilter] = React.useState<string>('all')

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return auditLog.filter((a) => {
      if (action !== 'all' && a.action !== action) return false
      if (moduleFilter !== 'all' && a.module !== moduleFilter) return false
      if (
        q &&
        !a.user.toLowerCase().includes(q) &&
        !a.description.toLowerCase().includes(q) &&
        !a.record.toLowerCase().includes(q) &&
        !a.ip.includes(q)
      )
        return false
      return true
    })
  }, [query, action, moduleFilter])

  const hasFilters = query !== '' || action !== 'all' || moduleFilter !== 'all'
  const clear = () => {
    setQuery('')
    setAction('all')
    setModuleFilter('all')
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-2">
            <Label htmlFor="au-search">Buscar</Label>
            <Input
              id="au-search"
              leadingIcon={<Search />}
              placeholder="Usuario, registro, IP o descripción"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="au-action">Acción</Label>
            <Select
              id="au-action"
              value={action}
              onChange={(e) => setAction(e.target.value as AuditAction | 'all')}
            >
              <option value="all">Todas las acciones</option>
              {(Object.keys(auditActionConfig) as AuditAction[]).map((a) => (
                <option key={a} value={a}>
                  {auditActionConfig[a].label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="au-module">Módulo</Label>
            <Select
              id="au-module"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
            >
              <option value="all">Todos los módulos</option>
              {moduleOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
          </span>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clear}>
                <XCircle />
                Limpiar filtros
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onToast('Exportando auditoría...')}>
              <Download />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <FileX className="size-6 text-muted-foreground" aria-hidden />
          </div>
          <div>
            <p className="font-medium text-foreground">Sin registros de auditoría</p>
            <p className="text-sm text-muted-foreground">Ajusta los filtros para ver otros resultados.</p>
          </div>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clear}>
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead className="hidden md:table-cell">Módulo</TableHead>
              <TableHead className="hidden lg:table-cell">Registro</TableHead>
              <TableHead className="hidden xl:table-cell">IP</TableHead>
              <TableHead>Descripción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((a) => {
              const cfg = auditActionConfig[a.action]
              return (
                <TableRow key={a.id}>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {a.date}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{a.user}</TableCell>
                  <TableCell>
                    <Badge variant={cfg.variant} size="sm">
                      {cfg.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {a.module}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                      {a.record}
                    </span>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground xl:table-cell">
                    {a.ip}
                  </TableCell>
                  <TableCell className="max-w-[280px] text-sm text-muted-foreground">
                    {a.description}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
