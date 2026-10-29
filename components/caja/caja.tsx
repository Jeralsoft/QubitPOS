'use client'

import * as React from 'react'
import {
  Wallet,
  LockOpen,
  Lock,
  ArrowDownCircle,
  ArrowUpCircle,
  ClipboardCheck,
  Printer,
  Download,
  Calendar,
  PiggyBank,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Scale,
  Coins,
  CircleDollarSign,
  Clock,
  User,
  CheckCircle2,
  History,
} from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Input } from '@/components/jeralpos/input'
import { Badge } from '@/components/jeralpos/badge'
import { Card } from '@/components/jeralpos/card'
import { Modal } from '@/components/jeralpos/modal'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/jeralpos/table'
import { cn } from '@/lib/utils'
import { usePOSSession } from '@/context/pos-session-context'
import {
  currentSession,
  seedMovements,
  closingHistory,
  computeSummary,
  formatCurrency,
  formatSignedCurrency,
  closingStatusFromDiff,
  closingStatusLabel,
  closingStatusVariant,
  type CashMovement,
  type CajaSession,
  type ClosingStatus,
} from './mock-data'
import { MovementsTable } from './movements-table'
import { OpenCashModal, type OpenPayload } from './open-modal'
import { CashMovementModal, type MovementPayload } from './cash-movement-modal'
import { ArqueoModal, type ArqueoResult } from './arqueo-modal'
import { CloseCashModal } from './close-modal'

type ToastKind = 'success' | 'error'

/* -------------------------------------------------------------------------- */
/*  Financial KPI card                                                        */
/* -------------------------------------------------------------------------- */

type KpiTone = 'neutral' | 'primary' | 'success' | 'danger' | 'warning' | 'accent'

const kpiTone: Record<KpiTone, { wrap: string; value: string }> = {
  neutral: { wrap: 'bg-muted text-muted-foreground', value: 'text-foreground' },
  primary: { wrap: 'bg-info-muted text-primary', value: 'text-foreground' },
  success: { wrap: 'bg-success-muted text-success', value: 'text-success' },
  danger: { wrap: 'bg-danger-muted text-danger', value: 'text-danger' },
  warning: { wrap: 'bg-warning-muted text-warning-foreground', value: 'text-warning-foreground' },
  accent: { wrap: 'bg-primary text-primary-foreground', value: 'text-foreground' },
}

function KpiCard({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
  hint,
}: {
  icon: typeof Wallet
  label: string
  value: string
  tone?: KpiTone
  hint?: string
}) {
  const t = kpiTone[tone]
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', t.wrap)} aria-hidden>
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={cn('mt-1 text-xl font-bold tabular-nums', t.value)}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*  Toast                                                                     */
/* -------------------------------------------------------------------------- */

function Toast({ msg, kind }: { msg: string; kind: ToastKind }) {
  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-in fade-in slide-in-from-bottom-2">
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-lg',
          kind === 'success'
            ? 'border-success/30 bg-card text-foreground'
            : 'border-danger/30 bg-card text-foreground',
        )}
      >
        <CheckCircle2
          className={cn('size-4', kind === 'success' ? 'text-success' : 'text-danger')}
          aria-hidden
        />
        {msg}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Main screen                                                               */
/* -------------------------------------------------------------------------- */

export function Caja() {
  const { isRegisterOpen, openRegister, closeRegister } = usePOSSession()
  const [loading, setLoading] = React.useState(true)
  const [isOpen, setIsOpen] = React.useState(isRegisterOpen)
  const [session, setSession] = React.useState<CajaSession>(currentSession)
  const [movements, setMovements] = React.useState<CashMovement[]>(seedMovements)
  const [countedCash, setCountedCash] = React.useState<number | null>(null)
  const [history, setHistory] = React.useState(closingHistory)

  const [openModal, setOpenModal] = React.useState(false)
  const [movementModal, setMovementModal] = React.useState<null | 'ingreso' | 'egreso'>(null)
  const [arqueoModal, setArqueoModal] = React.useState(false)
  const [closeModal, setCloseModal] = React.useState(false)
  const [historyModal, setHistoryModal] = React.useState(false)
  const [toast, setToast] = React.useState<{ msg: string; kind: ToastKind } | null>(null)

  React.useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 700)
    return () => window.clearTimeout(t)
  }, [])

  const showToast = React.useCallback((msg: string, kind: ToastKind = 'success') => {
    setToast({ msg, kind })
    window.setTimeout(() => setToast(null), 2800)
  }, [])

  const summary = React.useMemo(() => computeSummary(session, movements), [session, movements])

  const realBalance = countedCash ?? summary.cashExpected
  const difference = realBalance - summary.cashExpected
  const diffStatus: ClosingStatus = closingStatusFromDiff(difference)

  const nextId = React.useRef(1000)
  const nowTime = () =>
    new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })

  /* --- handlers --- */

  const handleOpen = (payload: OpenPayload) => {
    openRegister(payload.openingBalance, payload.register, payload.branch)
    setSession({
      id: `sess-${Date.now()}`,
      register: payload.register,
      branch: payload.branch,
      user: payload.user,
      openedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      openingBalance: payload.openingBalance,
    })
    setMovements([])
    setCountedCash(null)
    setIsOpen(true)
    setOpenModal(false)
    showToast(`${payload.register} abierta con ${formatCurrency(payload.openingBalance)}`)
  }

  const handleMovement = (payload: MovementPayload) => {
    const id = `m-${nextId.current++}`
    const value = payload.kind === 'ingreso' ? payload.amount : -payload.amount
    const mv: CashMovement = {
      id,
      time: nowTime(),
      type: payload.kind,
      concept: payload.concept,
      reference: `${payload.kind === 'ingreso' ? 'ING' : 'EG'}-${nextId.current}`,
      method: payload.method,
      user: session.user,
      value,
    }
    setMovements((prev) => [mv, ...prev])
    setMovementModal(null)
    showToast(
      `${payload.kind === 'ingreso' ? 'Ingreso' : 'Egreso'} de ${formatCurrency(payload.amount)} registrado`,
    )
  }

  const handleArqueo = (result: ArqueoResult) => {
    setCountedCash(result.cash)
    setArqueoModal(false)
    showToast(
      `Arqueo registrado: ${closingStatusLabel[result.status]}${
        result.difference !== 0 ? ` (${formatSignedCurrency(result.difference)})` : ''
      }`,
    )
  }

  const handleClose = () => {
    setHistory((prev) => [
      {
        id: `c-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        register: session.register,
        branch: session.branch,
        user: session.user,
        openingBalance: summary.openingBalance,
        sales: summary.sales,
        income: summary.income,
        expense: summary.expense,
        refunds: summary.refunds,
        expected: summary.cashExpected,
        counted: realBalance,
        difference,
        status: diffStatus,
      },
      ...prev,
    ])
    setIsOpen(false)
    closeRegister()
    setCloseModal(false)
    showToast('Caja cerrada correctamente')
  }

  /* --- KPI grid --- */

  const kpis = (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      <KpiCard icon={PiggyBank} label="Saldo inicial" value={formatCurrency(summary.openingBalance)} tone="neutral" />
      <KpiCard icon={ShoppingCart} label="Ventas" value={formatCurrency(summary.sales)} tone="primary" />
      <KpiCard icon={TrendingUp} label="Ingresos" value={formatCurrency(summary.income)} tone="success" />
      <KpiCard icon={TrendingDown} label="Egresos" value={formatCurrency(summary.expense)} tone="danger" />
      <KpiCard icon={Scale} label="Saldo esperado" value={formatCurrency(summary.cashExpected)} tone="neutral" hint="Efectivo en caja" />
      <KpiCard icon={Coins} label="Saldo real" value={formatCurrency(realBalance)} tone="neutral" hint={countedCash === null ? 'Pendiente de arqueo' : 'Según arqueo'} />
      <KpiCard
        icon={CircleDollarSign}
        label="Diferencia"
        value={formatSignedCurrency(difference)}
        tone={difference > 0 ? 'warning' : difference < 0 ? 'danger' : 'success'}
        hint={closingStatusLabel[diffStatus]}
      />
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Control de Caja
            </h1>
            <StatusPill isOpen={isOpen} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Administra el dinero y movimientos de tus cajas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-1 hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground sm:flex">
            <Calendar className="size-4" aria-hidden />
            <input
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="bg-transparent text-foreground outline-none [color-scheme:dark]"
              aria-label="Filtrar por fecha"
            />
          </div>
          <Button variant="outline" size="md" onClick={() => setHistoryModal(true)}>
            <History />
            Historial
          </Button>
          <Button variant="outline" size="md" onClick={() => showToast('Preparando impresión...')}>
            <Printer />
            Imprimir
          </Button>
          <Button variant="outline" size="md" onClick={() => showToast('Exportando reporte...')}>
            <Download />
            Exportar
          </Button>
        </div>
      </div>

      {loading ? (
        <CajaSkeleton />
      ) : isOpen ? (
        <>
          {/* Open session bar */}
          <Card className="overflow-hidden">
            <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
                <SessionFact icon={Wallet} label="Caja" value={session.register} />
                <SessionFact icon={User} label="Responsable" value={session.user} />
                <SessionFact icon={Clock} label="Apertura" value={session.openedAt.slice(-5)} />
                <SessionFact
                  icon={PiggyBank}
                  label="Saldo inicial"
                  value={formatCurrency(session.openingBalance)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="success" size="md" onClick={() => setMovementModal('ingreso')}>
                  <ArrowDownCircle />
                  Ingreso
                </Button>
                <Button variant="danger" size="md" onClick={() => setMovementModal('egreso')}>
                  <ArrowUpCircle />
                  Egreso
                </Button>
                <Button variant="outline" size="md" onClick={() => setArqueoModal(true)}>
                  <ClipboardCheck />
                  Arqueo
                </Button>
                <Button variant="primary" size="md" onClick={() => setCloseModal(true)}>
                  <Lock />
                  Cerrar caja
                </Button>
              </div>
            </div>
          </Card>

          {/* KPIs */}
          {kpis}

          {/* Movements */}
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  Movimientos del día
                </h2>
                <p className="text-sm text-muted-foreground">
                  {movements.length} {movements.length === 1 ? 'movimiento' : 'movimientos'} registrados
                </p>
              </div>
            </div>
            <MovementsTable movements={movements} loading={false} />
          </div>
        </>
      ) : (
        <ClosedState onOpen={() => setOpenModal(true)} />
      )}

      {/* Modals */}
      <OpenCashModal open={openModal} onClose={() => setOpenModal(false)} onConfirm={handleOpen} />
      {movementModal && (
        <CashMovementModal
          open={movementModal !== null}
          kind={movementModal}
          onClose={() => setMovementModal(null)}
          onConfirm={handleMovement}
        />
      )}
      <ArqueoModal
        open={arqueoModal}
        expectedCash={summary.cashExpected}
        onClose={() => setArqueoModal(false)}
        onConfirm={handleArqueo}
      />
      <CloseCashModal
        open={closeModal}
        session={session}
        summary={summary}
        countedCash={countedCash}
        status={diffStatus}
        onClose={() => setCloseModal(false)}
        onConfirm={handleClose}
      />
      <HistoryModal open={historyModal} onClose={() => setHistoryModal(false)} records={history} />

      {toast && <Toast msg={toast.msg} kind={toast.kind} />}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function StatusPill({ isOpen }: { isOpen: boolean }) {
  return (
    <Badge variant={isOpen ? 'success' : 'danger'} dot>
      {isOpen ? 'Caja abierta' : 'Caja cerrada'}
    </Badge>
  )
}

function SessionFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground" aria-hidden>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}

function ClosedState({ onOpen }: { onOpen: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-5 border-dashed py-16 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-danger-muted text-danger" aria-hidden>
        <Lock className="size-8" />
      </span>
      <div>
        <p className="text-lg font-semibold tracking-tight text-foreground">CAJA CERRADA</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No hay una caja abierta en este momento. Abre una caja para registrar ventas y movimientos.
        </p>
      </div>
      <Button variant="primary" size="lg" onClick={onOpen}>
        <LockOpen />
        Abrir caja
      </Button>
    </Card>
  )
}

function CajaSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-24 animate-pulse rounded-xl border border-border bg-card" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl border border-border bg-card" />
    </div>
  )
}

function HistoryModal({
  open,
  onClose,
  records,
}: {
  open: boolean
  onClose: () => void
  records: typeof closingHistory
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Historial de cierres"
      description="Cierres de caja registrados recientemente."
      className="max-w-4xl"
      footer={
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <div className="max-h-[60vh] overflow-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Caja</TableHead>
              <TableHead className="hidden md:table-cell">Usuario</TableHead>
              <TableHead className="text-right">Esperado</TableHead>
              <TableHead className="text-right">Real</TableHead>
              <TableHead className="text-right">Diferencia</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="tabular-nums text-muted-foreground">{r.date}</TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{r.register}</p>
                  <p className="text-xs text-muted-foreground">{r.branch}</p>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">{r.user}</TableCell>
                <TableCell className="text-right tabular-nums text-foreground">
                  {formatCurrency(r.expected)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-foreground">
                  {formatCurrency(r.counted)}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-semibold tabular-nums',
                    r.difference > 0
                      ? 'text-warning-foreground'
                      : r.difference < 0
                        ? 'text-danger'
                        : 'text-success',
                  )}
                >
                  {formatSignedCurrency(r.difference)}
                </TableCell>
                <TableCell>
                  <Badge variant={closingStatusVariant[r.status]} size="sm">
                    {closingStatusLabel[r.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Modal>
  )
}
