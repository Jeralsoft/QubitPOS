'use client'

import * as React from 'react'
import {
  Search,
  Plus,
  ChevronDown,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  FileText,
  Printer,
  Pencil,
  Power,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Input, Select, Label } from '@/components/jeralpos/input'
import { Badge } from '@/components/jeralpos/badge'
import { IndicatorCard } from '@/components/dashboard/indicator-card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/jeralpos/table'
import { ChartCard } from '@/components/reportes/charts'
import { cn } from '@/lib/utils'
import {
  sectionGroups,
  sectionLabelById,
  kpis,
  dashboardCharts,
  accounts as seedAccounts,
  accountTypeVariant,
  journalEntries as seedEntries,
  entryStatusVariant,
  entryTotals,
  ledgerAccounts,
  trialBalance,
  receivables,
  payables,
  agingStatusVariant,
  incomeRows,
  incomeChart,
  expenseRows,
  expenseChart,
  taxes,
  taxStatusVariant,
  closings,
  closingStatusVariant,
  contableReports,
  contableReportById,
  formatCurrency,
  formatValue,
  type SectionId,
  type Account,
  type JournalEntry,
  type ReportColumn,
  type ReportStat,
} from './mock-data'
import { JournalEntryModal, type NewEntryDraft } from './journal-entry-modal'

type ToastKind = 'success' | 'error'

const statTone: Record<NonNullable<ReportStat['tone']>, string> = {
  default: 'text-foreground',
  primary: 'text-primary',
  success: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning-foreground',
}

function formatCell(value: string | number, format?: ReportColumn['format']): string {
  if (typeof value === 'number' && format && format !== 'text') {
    return formatValue(value, format)
  }
  return String(value)
}

/* -------------------------------------------------------------------------- */
/*  Section navigation                                                        */
/* -------------------------------------------------------------------------- */

function SectionMenu({
  selected,
  onSelect,
}: {
  selected: SectionId
  onSelect: (id: SectionId) => void
}) {
  return (
    <nav aria-label="Secciones de contabilidad" className="flex flex-col gap-5">
      {sectionGroups.map((group) => (
        <div key={group.label}>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </h3>
          <ul className="flex flex-col gap-0.5">
            {group.sections.map((s) => {
              const Icon = s.icon
              const active = s.id === selected
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(s.id)}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors [&_svg]:size-4',
                      active
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-foreground hover:bg-accent',
                    )}
                  >
                    <Icon className={active ? 'text-primary' : 'text-muted-foreground'} aria-hidden />
                    <span className="truncate">{s.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

/* -------------------------------------------------------------------------- */
/*  Small reusable pieces                                                     */
/* -------------------------------------------------------------------------- */

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function ExportToolbar({ onExport }: { onExport: (kind: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => onExport('Excel')}>
        <FileSpreadsheet />
        Excel
      </Button>
      <Button variant="outline" size="sm" onClick={() => onExport('PDF')}>
        <FileText />
        PDF
      </Button>
      <Button variant="outline" size="sm" onClick={() => onExport('impresión')}>
        <Printer />
        Imprimir
      </Button>
    </div>
  )
}

function MiniStat({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: NonNullable<ReportStat['tone']>
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-xl font-bold tracking-tight tabular-nums', statTone[tone])}>
        {value}
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sections                                                                  */
/* -------------------------------------------------------------------------- */

function DashboardSection({ onExport }: { onExport: (kind: string) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          title="Dashboard contable"
          description="Resumen financiero del período — septiembre 2026."
        />
        <ExportToolbar onExport={onExport} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((ind) => (
          <IndicatorCard key={ind.id} indicator={ind} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard spec={dashboardCharts[0]} />
        <ChartCard spec={dashboardCharts[1]} />
      </div>
      <ChartCard spec={dashboardCharts[2]} />
    </div>
  )
}

function PlanSection({ onToast }: { onToast: (msg: string, kind?: ToastKind) => void }) {
  const [items, setItems] = React.useState<Account[]>(seedAccounts)
  const [query, setQuery] = React.useState('')
  const [type, setType] = React.useState<string>('all')

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((a) => {
      if (type !== 'all' && a.type !== type) return false
      if (q && !a.name.toLowerCase().includes(q) && !a.code.includes(q)) return false
      return true
    })
  }, [items, query, type])

  const toggle = (code: string) =>
    setItems((prev) => prev.map((a) => (a.code === code ? { ...a, active: !a.active } : a)))

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Plan de cuentas"
        description="Catálogo de cuentas del negocio según el Plan Único de Cuentas."
      />

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
          <div>
            <Label htmlFor="pc-search">Buscar</Label>
            <Input
              id="pc-search"
              leadingIcon={<Search />}
              placeholder="Código o nombre de cuenta"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pc-type">Tipo</Label>
            <Select id="pc-type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">Todos los tipos</option>
              {['Activo', 'Pasivo', 'Patrimonio', 'Ingreso', 'Gasto', 'Costo'].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Cuenta</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="hidden md:table-cell">Naturaleza</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((a) => (
            <TableRow key={a.code}>
              <TableCell className="font-medium tabular-nums">{a.code}</TableCell>
              <TableCell>{a.name}</TableCell>
              <TableCell>
                <Badge variant={accountTypeVariant[a.type]} size="sm">
                  {a.type}
                </Badge>
              </TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">{a.nature}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(a.balance)}</TableCell>
              <TableCell>
                <Badge variant={a.active ? 'success' : 'neutral'} size="sm" dot>
                  {a.active ? 'Activa' : 'Inactiva'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onToast(`Editar cuenta ${a.code} (demo)`)}
                    aria-label={`Editar ${a.name}`}
                    className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-4"
                  >
                    <Pencil />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toggle(a.code)
                      onToast(`Cuenta ${a.code} ${a.active ? 'inactivada' : 'activada'}`)
                    }}
                    aria-label={`${a.active ? 'Inactivar' : 'Activar'} ${a.name}`}
                    className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-4"
                  >
                    <Power />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-xs text-muted-foreground">{filtered.length} cuentas</p>
    </div>
  )
}

function AsientosSection({ onToast }: { onToast: (msg: string, kind?: ToastKind) => void }) {
  const [items, setItems] = React.useState<JournalEntry[]>(seedEntries)
  const [open, setOpen] = React.useState(false)

  const nextNumber = React.useMemo(() => {
    const n = items.length + 481
    return `CD-${String(n).padStart(6, '0')}`
  }, [items.length])

  const handleCreate = (draft: NewEntryDraft) => {
    const entry: JournalEntry = {
      id: `a-${Date.now()}`,
      number: draft.number,
      date: draft.date,
      concept: draft.concept,
      reference: draft.reference || '—',
      lines: draft.lines,
      status: 'Contabilizado',
    }
    setItems((prev) => [entry, ...prev])
    setOpen(false)
    onToast(`Asiento ${draft.number} contabilizado`)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          title="Asientos contables"
          description="Registra y consulta los movimientos de partida doble."
        />
        <Button variant="primary" size="md" onClick={() => setOpen(true)}>
          <Plus />
          Nuevo asiento
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Concepto</TableHead>
            <TableHead className="hidden lg:table-cell">Referencia</TableHead>
            <TableHead className="text-right">Débito</TableHead>
            <TableHead className="text-right">Crédito</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((e) => {
            const t = entryTotals(e.lines)
            return (
              <TableRow key={e.id}>
                <TableCell className="font-medium tabular-nums">{e.number}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">{e.date}</TableCell>
                <TableCell>{e.concept}</TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {e.reference}
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(t.debit)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(t.credit)}</TableCell>
                <TableCell>
                  <Badge variant={entryStatusVariant[e.status]} size="sm" dot>
                    {e.status}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <JournalEntryModal
        open={open}
        onClose={() => setOpen(false)}
        nextNumber={nextNumber}
        onCreate={handleCreate}
      />
    </div>
  )
}

function DiarioSection({ onExport }: { onExport: (kind: string) => void }) {
  const totals = React.useMemo(() => {
    let debit = 0
    let credit = 0
    for (const e of seedEntries) {
      for (const l of e.lines) {
        debit += l.debit
        credit += l.credit
      }
    }
    return { debit, credit }
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          title="Libro diario"
          description="Registro cronológico de todos los asientos contabilizados."
        />
        <ExportToolbar onExport={onExport} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Comprobante</TableHead>
            <TableHead>Cuenta</TableHead>
            <TableHead className="hidden lg:table-cell">Descripción</TableHead>
            <TableHead className="text-right">Débito</TableHead>
            <TableHead className="text-right">Crédito</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {seedEntries
            .filter((e) => e.status !== 'Anulado')
            .flatMap((e) =>
              e.lines.map((l, li) => (
                <TableRow key={`${e.id}-${li}`}>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {li === 0 ? e.date : ''}
                  </TableCell>
                  <TableCell className="font-medium tabular-nums">
                    {li === 0 ? e.number : ''}
                  </TableCell>
                  <TableCell>{l.account}</TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {l.description}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {l.debit ? formatCurrency(l.debit) : '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {l.credit ? formatCurrency(l.credit) : '—'}
                  </TableCell>
                </TableRow>
              )),
            )}
          <TableRow className="border-t-2 border-border bg-muted/40 font-semibold">
            <TableCell colSpan={4}>Totales</TableCell>
            <TableCell className="text-right tabular-nums">{formatCurrency(totals.debit)}</TableCell>
            <TableCell className="text-right tabular-nums">{formatCurrency(totals.credit)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

function MayorSection({ onExport }: { onExport: (kind: string) => void }) {
  const [code, setCode] = React.useState(ledgerAccounts[0].code)
  const account = ledgerAccounts.find((a) => a.code === code) ?? ledgerAccounts[0]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          title="Libro mayor"
          description="Movimientos y saldo acumulado por cuenta."
        />
        <ExportToolbar onExport={onExport} />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:max-w-sm">
        <Label htmlFor="lm-account">Cuenta</Label>
        <Select id="lm-account" value={code} onChange={(e) => setCode(e.target.value)}>
          {ledgerAccounts.map((a) => (
            <option key={a.code} value={a.code}>
              {a.code} · {a.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat label="Saldo inicial" value={formatCurrency(account.opening)} />
        <MiniStat label="Naturaleza" value={account.nature} />
        <MiniStat label="Saldo final" value={formatCurrency(account.closing)} tone="primary" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Comprobante</TableHead>
            <TableHead className="hidden lg:table-cell">Descripción</TableHead>
            <TableHead className="text-right">Débito</TableHead>
            <TableHead className="text-right">Crédito</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="bg-muted/40">
            <TableCell colSpan={5} className="font-medium text-muted-foreground">
              Saldo inicial
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {formatCurrency(account.opening)}
            </TableCell>
          </TableRow>
          {account.movements.map((m, i) => (
            <TableRow key={i}>
              <TableCell className="tabular-nums text-muted-foreground">{m.date}</TableCell>
              <TableCell className="font-medium tabular-nums">{m.entry}</TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {m.description}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {m.debit ? formatCurrency(m.debit) : '—'}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {m.credit ? formatCurrency(m.credit) : '—'}
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(m.balance)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function BalanceSection({ onExport }: { onExport: (kind: string) => void }) {
  const totals = React.useMemo(
    () =>
      trialBalance.reduce(
        (acc, r) => ({
          debitMov: acc.debitMov + r.debitMov,
          creditMov: acc.creditMov + r.creditMov,
          debitBal: acc.debitBal + r.debitBal,
          creditBal: acc.creditBal + r.creditBal,
        }),
        { debitMov: 0, creditMov: 0, debitBal: 0, creditBal: 0 },
      ),
    [],
  )
  const balanced = totals.debitBal === totals.creditBal

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          title="Balance de comprobación"
          description="Sumas y saldos de las cuentas al cierre del período."
        />
        <ExportToolbar onExport={onExport} />
      </div>

      <div>
        <Badge variant={balanced ? 'success' : 'danger'} size="md" dot>
          {balanced ? 'Balance cuadrado' : 'Balance descuadrado'}
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead className="text-right">Mov. débito</TableHead>
              <TableHead className="text-right">Mov. crédito</TableHead>
              <TableHead className="text-right">Saldo débito</TableHead>
              <TableHead className="text-right">Saldo crédito</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trialBalance.map((r) => (
              <TableRow key={r.code}>
                <TableCell className="font-medium tabular-nums">{r.code}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.debitMov ? formatCurrency(r.debitMov) : '—'}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.creditMov ? formatCurrency(r.creditMov) : '—'}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.debitBal ? formatCurrency(r.debitBal) : '—'}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.creditBal ? formatCurrency(r.creditBal) : '—'}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2 border-border bg-muted/40 font-semibold">
              <TableCell colSpan={2}>Totales</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(totals.debitMov)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(totals.creditMov)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(totals.debitBal)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(totals.creditBal)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function AgingSection({
  kind,
  onExport,
}: {
  kind: 'cxc' | 'cxp'
  onExport: (kind: string) => void
}) {
  const isCxc = kind === 'cxc'
  const data = isCxc ? receivables : payables
  const partyLabel = isCxc ? 'Cliente' : 'Proveedor'

  const totals = React.useMemo(() => {
    const balance = data.reduce((s, d) => s + d.balance, 0)
    const overdue = data.filter((d) => d.status === 'Vencida').reduce((s, d) => s + d.balance, 0)
    const current = data.filter((d) => d.status === 'Vigente').reduce((s, d) => s + d.balance, 0)
    return { balance, overdue, current }
  }, [data])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          title={isCxc ? 'Cuentas por cobrar' : 'Cuentas por pagar'}
          description={
            isCxc
              ? 'Cartera pendiente de recaudo por cliente.'
              : 'Obligaciones pendientes de pago a proveedores.'
          }
        />
        <ExportToolbar onExport={onExport} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat label="Saldo total" value={formatCurrency(totals.balance)} tone="primary" />
        <MiniStat label="Vigente" value={formatCurrency(totals.current)} tone="warning" />
        <MiniStat label="Vencida" value={formatCurrency(totals.overdue)} tone="danger" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{partyLabel}</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead className="hidden md:table-cell">Fecha</TableHead>
            <TableHead className="hidden md:table-cell">Vence</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((d) => (
            <TableRow key={d.id}>
              <TableCell className="font-medium">{d.party}</TableCell>
              <TableCell className="tabular-nums text-muted-foreground">{d.document}</TableCell>
              <TableCell className="hidden tabular-nums text-muted-foreground md:table-cell">
                {d.date}
              </TableCell>
              <TableCell className="hidden tabular-nums text-muted-foreground md:table-cell">
                {d.due}
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(d.total)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(d.balance)}</TableCell>
              <TableCell>
                <Badge variant={agingStatusVariant[d.status]} size="sm" dot>
                  {d.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function CategorySection({
  kind,
  onExport,
}: {
  kind: 'ingresos' | 'gastos'
  onExport: (kind: string) => void
}) {
  const isIncome = kind === 'ingresos'
  const rows = isIncome ? incomeRows : expenseRows
  const chart = isIncome ? incomeChart : expenseChart
  const total = rows.reduce((s, r) => s + r.amount, 0)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          title={isIncome ? 'Ingresos' : 'Gastos'}
          description={
            isIncome
              ? 'Ingresos del período agrupados por cuenta.'
              : 'Gastos y costos del período agrupados por cuenta.'
          }
        />
        <ExportToolbar onExport={onExport} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MiniStat
          label={isIncome ? 'Total ingresos' : 'Total gastos'}
          value={formatCurrency(total)}
          tone={isIncome ? 'success' : 'danger'}
        />
        <MiniStat label="Cuentas" value={String(rows.length)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard spec={chart} />
        <div className="flex flex-col gap-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cuenta</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Part.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.account}>
                  <TableCell className="font-medium tabular-nums">{r.account}</TableCell>
                  <TableCell>{r.category}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(r.amount)}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {r.share}%
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2 border-border bg-muted/40 font-semibold">
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(total)}</TableCell>
                <TableCell className="text-right tabular-nums">100%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

function ImpuestosSection({ onExport }: { onExport: (kind: string) => void }) {
  const pending = taxes
    .filter((t) => t.status !== 'Pagado')
    .reduce((s, t) => s + t.value, 0)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          title="Impuestos"
          description="Obligaciones tributarias del negocio por período."
        />
        <ExportToolbar onExport={onExport} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MiniStat label="Impuestos por pagar" value={formatCurrency(pending)} tone="danger" />
        <MiniStat label="Declaraciones" value={String(taxes.length)} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Impuesto</TableHead>
            <TableHead>Período</TableHead>
            <TableHead className="text-right">Base gravable</TableHead>
            <TableHead className="text-right">Tarifa</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="hidden md:table-cell">Vence</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {taxes.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium">{t.name}</TableCell>
              <TableCell className="text-muted-foreground">{t.period}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(t.base)}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{t.rate}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(t.value)}</TableCell>
              <TableCell className="hidden tabular-nums text-muted-foreground md:table-cell">
                {t.due}
              </TableCell>
              <TableCell>
                <Badge variant={taxStatusVariant[t.status]} size="sm" dot>
                  {t.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function CierresSection({ onToast }: { onToast: (msg: string, kind?: ToastKind) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          title="Cierres contables"
          description="Estado de los cierres mensuales y anuales."
        />
        <Button variant="primary" size="md" onClick={() => onToast('Cierre de septiembre iniciado (demo)')}>
          <Lock />
          Cerrar período
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Período</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="hidden md:table-cell">Fecha de cierre</TableHead>
            <TableHead className="hidden lg:table-cell">Responsable</TableHead>
            <TableHead className="text-right">Resultado</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {closings.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.period}</TableCell>
              <TableCell className="text-muted-foreground">{c.type}</TableCell>
              <TableCell className="hidden tabular-nums text-muted-foreground md:table-cell">
                {c.date}
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">{c.user}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(c.result)}</TableCell>
              <TableCell>
                <Badge variant={closingStatusVariant[c.status]} size="sm" dot>
                  {c.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ReportesSection({ onExport }: { onExport: (kind: string) => void }) {
  const [selected, setSelected] = React.useState(contableReports[0].id)
  const report = contableReportById[selected]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          title="Reportes contables"
          description="Estados financieros generados a partir de los movimientos."
        />
        <ExportToolbar onExport={onExport} />
      </div>

      {/* Report selector */}
      <div className="flex flex-wrap gap-2">
        {contableReports.map((r) => {
          const Icon = r.icon
          const active = r.id === selected
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelected(r.id)}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors [&_svg]:size-4',
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <Icon aria-hidden />
              {r.label}
            </button>
          )
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-base font-semibold tracking-tight text-foreground">{report.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {report.stats.map((s) => (
          <MiniStat key={s.label} label={s.label} value={s.value} tone={s.tone ?? 'default'} />
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {report.columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                )}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {report.rows.map((row, ri) => (
            <TableRow key={ri}>
              {report.columns.map((col, ci) => (
                <TableCell
                  key={col.key}
                  className={cn(
                    col.align === 'right' && 'text-right tabular-nums',
                    col.align === 'center' && 'text-center',
                    ci === 0 && 'font-medium',
                  )}
                >
                  {formatCell(row[col.key], col.format)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Main module                                                               */
/* -------------------------------------------------------------------------- */

export function Contabilidad() {
  const [section, setSection] = React.useState<SectionId>('dashboard')
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [toast, setToast] = React.useState<{ msg: string; kind: ToastKind } | null>(null)
  const toastTimer = React.useRef<number | undefined>(undefined)

  React.useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  const showToast = React.useCallback((msg: string, kind: ToastKind = 'success') => {
    setToast({ msg, kind })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2800)
  }, [])

  const handleExport = React.useCallback(
    (kind: string) => {
      if (kind === 'impresión') {
        showToast('Preparando impresión...')
        window.setTimeout(() => window.print(), 300)
        return
      }
      showToast(`Exportando "${sectionLabelById[section]}" a ${kind}...`)
    },
    [section, showToast],
  )

  const handleSelect = (id: SectionId) => {
    setSection(id)
    setMenuOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Contabilidad</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona la contabilidad, los estados financieros y las obligaciones del negocio.
        </p>
      </div>

      {/* Mobile section selector */}
      <div className="xl:hidden">
        <Button
          variant="outline"
          size="md"
          className="w-full justify-between"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
        >
          <span>{sectionLabelById[section]}</span>
          <ChevronDown className={cn('transition-transform', menuOpen && 'rotate-180')} />
        </Button>
        {menuOpen && (
          <div className="mt-2 rounded-xl border border-border bg-card p-4 shadow-sm">
            <SectionMenu selected={section} onSelect={handleSelect} />
          </div>
        )}
      </div>

      {/* Body: menu + workspace */}
      <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
        <aside className="hidden xl:block">
          <div className="sticky top-4 rounded-xl border border-border bg-card p-4 shadow-sm">
            <SectionMenu selected={section} onSelect={handleSelect} />
          </div>
        </aside>

        <div className="min-w-0">
          {section === 'dashboard' && <DashboardSection onExport={handleExport} />}
          {section === 'plan' && <PlanSection onToast={showToast} />}
          {section === 'asientos' && <AsientosSection onToast={showToast} />}
          {section === 'diario' && <DiarioSection onExport={handleExport} />}
          {section === 'mayor' && <MayorSection onExport={handleExport} />}
          {section === 'balance' && <BalanceSection onExport={handleExport} />}
          {section === 'cxc' && <AgingSection kind="cxc" onExport={handleExport} />}
          {section === 'cxp' && <AgingSection kind="cxp" onExport={handleExport} />}
          {section === 'ingresos' && <CategorySection kind="ingresos" onExport={handleExport} />}
          {section === 'gastos' && <CategorySection kind="gastos" onExport={handleExport} />}
          {section === 'impuestos' && <ImpuestosSection onExport={handleExport} />}
          {section === 'cierres' && <CierresSection onToast={showToast} />}
          {section === 'reportes' && <ReportesSection onExport={handleExport} />}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2',
            toast.kind === 'success'
              ? 'border-success/30 bg-success-muted text-success'
              : 'border-danger/30 bg-danger-muted text-danger',
          )}
        >
          {toast.kind === 'success' ? (
            <CheckCircle2 className="size-4" aria-hidden />
          ) : (
            <XCircle className="size-4" aria-hidden />
          )}
          {toast.msg}
        </div>
      )}
    </div>
  )
}
