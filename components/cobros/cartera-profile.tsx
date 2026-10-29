'use client'

import * as React from 'react'
import {
  X,
  Mail,
  Phone,
  MapPin,
  FileText,
  CircleDollarSign,
  Wallet,
  CalendarClock,
  Receipt,
} from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Badge } from '@/components/jeralpos/badge'
import { cn } from '@/lib/utils'
import {
  type CustomerCartera,
  type Receivable,
  formatCurrency,
  balance,
  statusOf,
  statusLabel,
  statusVariant,
  daysOverdue,
} from './mock-data'

function Stat({
  icon: Icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ElementType
  label: string
  value: string
  tone?: 'default' | 'primary' | 'danger' | 'success'
}) {
  const toneText =
    tone === 'primary'
      ? 'text-primary'
      : tone === 'danger'
        ? 'text-danger'
        : tone === 'success'
          ? 'text-success'
          : 'text-foreground'
  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" aria-hidden />
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p className={cn('mt-1.5 text-lg font-semibold tabular-nums', toneText)}>{value}</p>
    </div>
  )
}

export function CarteraProfile({
  cartera,
  onClose,
  onRegisterPayment,
}: {
  cartera: CustomerCartera
  onClose: () => void
  onRegisterPayment: (r: Receivable) => void
}) {
  const initials = cartera.customerName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Cartera de ${cartera.customerName}`}
        className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
              {initials}
            </div>
            <div>
              <h2 className="text-base font-semibold leading-tight text-foreground">
                {cartera.customerName}
              </h2>
              <p className="text-xs text-muted-foreground">
                {cartera.documentType} {cartera.document}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-4"
          >
            <X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Contact */}
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            {cartera.email && (
              <div className="flex items-center gap-2">
                <Mail className="size-4" aria-hidden />
                <span className="truncate">{cartera.email}</span>
              </div>
            )}
            {cartera.phone && (
              <div className="flex items-center gap-2">
                <Phone className="size-4" aria-hidden />
                {cartera.phone}
              </div>
            )}
            {cartera.city && (
              <div className="flex items-center gap-2">
                <MapPin className="size-4" aria-hidden />
                {cartera.city}
              </div>
            )}
          </div>

          {/* KPIs */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Stat
              icon={FileText}
              label="Total facturado"
              value={formatCurrency(cartera.totalInvoiced)}
            />
            <Stat
              icon={CircleDollarSign}
              label="Total pagado"
              value={formatCurrency(cartera.totalPaid)}
              tone="success"
            />
            <Stat
              icon={Wallet}
              label="Saldo"
              value={formatCurrency(cartera.balance)}
              tone={cartera.balance > 0 ? 'primary' : 'default'}
            />
            <Stat
              icon={CalendarClock}
              label="Último pago"
              value={cartera.lastPayment ? cartera.lastPayment.date : '—'}
            />
          </div>

          {cartera.overdue > 0 && (
            <div className="mt-3 rounded-lg border border-danger/30 bg-danger-muted px-3 py-2 text-sm text-danger">
              Saldo vencido: <span className="font-semibold">{formatCurrency(cartera.overdue)}</span>
            </div>
          )}

          {/* Outstanding invoices */}
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Facturas</h3>
            <div className="flex flex-col gap-2">
              {cartera.receivables.map((r) => {
                const bal = balance(r)
                const st = statusOf(r)
                const od = daysOverdue(r)
                return (
                  <div
                    key={r.id}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-medium text-foreground">
                        {r.invoice}
                      </span>
                      <Badge variant={statusVariant[st]} size="sm">
                        {statusLabel[st]}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Vence {r.dueDate}</span>
                      {od > 0 && st !== 'pagada' && (
                        <span className="font-medium text-danger">{od} días</span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Saldo{' '}
                        <span className="font-semibold tabular-nums text-foreground">
                          {formatCurrency(bal)}
                        </span>
                      </span>
                      {bal > 0 && st !== 'anulada' && (
                        <Button size="sm" variant="outline" onClick={() => onRegisterPayment(r)}>
                          <CircleDollarSign />
                          Cobrar
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Payment history */}
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Historial de abonos</h3>
            {cartera.payments.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
                Sin abonos registrados.
              </p>
            ) : (
              <ol className="relative flex flex-col gap-4 border-l border-border pl-5">
                {cartera.payments.map((p) => (
                  <li key={p.id} className="relative">
                    <span className="absolute -left-[26px] top-1 flex size-4 items-center justify-center rounded-full bg-success/15">
                      <Receipt className="size-2.5 text-success" aria-hidden />
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold tabular-nums text-success">
                        {formatCurrency(p.amount)}
                      </span>
                      <span className="text-xs text-muted-foreground">{p.date}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {p.method}
                      {p.reference && ` · ${p.reference}`}
                    </p>
                    {p.notes && <p className="mt-0.5 text-xs text-muted-foreground">{p.notes}</p>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
