'use client'

import * as React from 'react'
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Eye,
  Printer,
  Download,
  Send,
  Ban,
  ShieldCheck,
  Clock,
  Fingerprint,
  FileCheck2,
  AlertTriangle,
  CircleSlash,
} from 'lucide-react'
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
  company,
  computeTotals,
  formatCurrency,
  lineNet,
  statusLabel,
  statusVariant,
  dianStatusLabel,
  dianStatusVariant,
  type Invoice,
  type DianStatus,
} from './mock-data'

const dianIcon: Record<DianStatus, typeof ShieldCheck> = {
  no_enviado: CircleSlash,
  en_proceso: Clock,
  aceptado: ShieldCheck,
  rechazado: AlertTriangle,
}

const dianAccent: Record<DianStatus, string> = {
  no_enviado: 'border-border bg-muted/40',
  en_proceso: 'border-warning/30 bg-warning-muted',
  aceptado: 'border-success/30 bg-success-muted',
  rechazado: 'border-danger/30 bg-danger-muted',
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <span className="mt-0.5 text-muted-foreground [&_svg]:size-4">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value || '—'}</p>
      </div>
    </div>
  )
}

function ElectronicField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn('text-sm font-medium text-foreground', mono && 'break-all font-mono text-xs')}>
        {value}
      </span>
    </div>
  )
}

export function InvoiceDetail({
  invoice,
  onPreview,
  onPrint,
  onDownload,
  onSend,
  onVoid,
}: {
  invoice: Invoice
  onPreview: () => void
  onPrint: () => void
  onDownload: () => void
  onSend: () => void
  onVoid: () => void
}) {
  const totals = React.useMemo(() => computeTotals(invoice.items), [invoice.items])
  const e = invoice.electronic
  const DianIcon = dianIcon[e.dianStatus]

  const canSend = e.dianStatus === 'no_enviado' || e.dianStatus === 'rechazado'
  const canVoid = invoice.status !== 'anulada'

  return (
    <div className="flex max-h-[82vh] flex-col">
      {/* Identity header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground" aria-hidden>
            <Building2 className="size-6" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {invoice.number}
              </h2>
              <Badge variant={statusVariant[invoice.status]} size="sm" dot>
                {statusLabel[invoice.status]}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {company.name} · {invoice.date} {invoice.time}
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-muted-foreground">Total factura</p>
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {formatCurrency(totals.total)}
          </p>
          <p className="text-xs text-muted-foreground">{invoice.paymentMethod}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-5">
        <div className="flex flex-col gap-6">
          {/* Issuer + customer */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Building2 className="size-4 text-muted-foreground" aria-hidden />
                Emisor
              </h3>
              <div className="mt-2 divide-y divide-border">
                <InfoRow icon={<Building2 />} label="Razón social" value={company.name} />
                <InfoRow icon={<Fingerprint />} label="NIT" value={company.nit} />
                <InfoRow icon={<MapPin />} label="Dirección" value={`${company.address}, ${company.city}`} />
                <InfoRow icon={<Phone />} label="Teléfono" value={company.phone} />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <User className="size-4 text-muted-foreground" aria-hidden />
                Cliente
              </h3>
              <div className="mt-2 divide-y divide-border">
                <InfoRow icon={<User />} label="Nombre / Razón social" value={invoice.customer.name} />
                <InfoRow
                  icon={<Fingerprint />}
                  label="Documento"
                  value={`${invoice.customer.documentType} ${invoice.customer.document}`}
                />
                <InfoRow icon={<Mail />} label="Correo" value={invoice.customer.email} />
                <InfoRow
                  icon={<MapPin />}
                  label="Dirección"
                  value={
                    invoice.customer.address
                      ? `${invoice.customer.address}, ${invoice.customer.city}`
                      : invoice.customer.city
                  }
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden sm:table-cell">Código</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Cant.</TableHead>
                  <TableHead className="hidden text-right md:table-cell">Precio</TableHead>
                  <TableHead className="hidden text-right md:table-cell">Desc.</TableHead>
                  <TableHead className="hidden text-right lg:table-cell">IVA</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                      {item.code}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{item.description}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums text-muted-foreground md:table-cell">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums text-muted-foreground md:table-cell">
                      {item.discount > 0 ? `${item.discount}%` : '—'}
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums text-muted-foreground lg:table-cell">
                      {item.taxRate}%
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium text-foreground">
                      {formatCurrency(lineNet(item))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals + notes */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">Observaciones</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {invoice.notes || 'Sin observaciones registradas.'}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
                <span className="text-muted-foreground">Vendedor</span>
                <span className="font-medium text-foreground">{invoice.seller}</span>
              </div>
              <div className="flex items-center justify-between pt-2 text-sm">
                <span className="text-muted-foreground">Forma de pago</span>
                <span className="font-medium text-foreground">{invoice.paymentMethod}</span>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <dl className="flex flex-col gap-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Subtotal bruto</dt>
                  <dd className="tabular-nums text-foreground">{formatCurrency(totals.gross)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Descuentos</dt>
                  <dd className="tabular-nums text-danger">- {formatCurrency(totals.discount)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Base gravable</dt>
                  <dd className="tabular-nums text-foreground">{formatCurrency(totals.subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Impuestos (IVA)</dt>
                  <dd className="tabular-nums text-foreground">{formatCurrency(totals.tax)}</dd>
                </div>
                <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
                  <dt className="text-base font-semibold text-foreground">Total a pagar</dt>
                  <dd className="text-lg font-bold tabular-nums text-foreground">
                    {formatCurrency(totals.total)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Electronic invoicing status (DIAN) */}
          <div className={cn('rounded-xl border p-4', dianAccent[e.dianStatus])}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileCheck2 className="size-4 text-muted-foreground" aria-hidden />
                Facturación electrónica
              </h3>
              <Badge variant={dianStatusVariant[e.dianStatus]} size="sm" dot>
                <DianIcon className="mr-1 size-3.5" aria-hidden />
                {dianStatusLabel[e.dianStatus]}
              </Badge>
            </div>

            {e.dianStatus === 'no_enviado' ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Esta factura aún no ha sido transmitida a la DIAN. Usa el botón{' '}
                <span className="font-medium text-foreground">Enviar</span> para iniciar la validación
                electrónica.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <ElectronicField label="Estado DIAN" value={dianStatusLabel[e.dianStatus]} />
                <ElectronicField label="CUFE" value={e.cufe ?? 'Pendiente de asignación'} mono />
                <ElectronicField label="Fecha de envío" value={e.sentAt ?? '—'} />
                <ElectronicField label="Fecha de respuesta" value={e.respondedAt ?? 'En espera'} />
                <div className="sm:col-span-2">
                  <ElectronicField label="Mensaje de respuesta" value={e.message ?? '—'} />
                </div>
              </div>
            )}
            <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
              Preparado para integración con proveedor tecnológico autorizado por la DIAN. La transmisión
              real se habilitará al conectar la API de facturación electrónica.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-1 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onPreview}>
          <Eye />
          Ver
        </Button>
        <Button type="button" variant="outline" onClick={onPrint}>
          <Printer />
          Imprimir
        </Button>
        <Button type="button" variant="outline" onClick={onDownload}>
          <Download />
          Descargar PDF
        </Button>
        <Button type="button" variant="primary" onClick={onSend} disabled={!canSend}>
          <Send />
          Enviar
        </Button>
        <Button type="button" variant="danger" onClick={onVoid} disabled={!canVoid}>
          <Ban />
          Anular
        </Button>
      </div>
    </div>
  )
}
