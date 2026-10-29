'use client'

import * as React from 'react'
import {
  company,
  computeTotals,
  formatCurrency,
  lineNet,
  numberToWords,
  dianStatusLabel,
  type Invoice,
} from './mock-data'

/**
 * Print/PDF preview of an invoice rendered at letter/A4 proportions.
 * Uses a fixed light "paper" palette (not theme tokens) so it looks the same
 * on screen and when printed.
 */
export function InvoicePdf({ invoice }: { invoice: Invoice }) {
  const totals = React.useMemo(() => computeTotals(invoice.items), [invoice.items])
  const e = invoice.electronic

  return (
    <div className="max-h-[80vh] overflow-y-auto rounded-lg bg-neutral-200 p-4 sm:p-8">
      {/* Paper sheet — letter/A4 aspect */}
      <div
        className="mx-auto w-full max-w-[820px] bg-white text-neutral-800 shadow-2xl"
        style={{ aspectRatio: '1 / 1.294' }}
      >
        <div className="flex h-full flex-col p-8 sm:p-10">
          {/* Header */}
          <div className="flex items-start justify-between gap-6 border-b-2 border-neutral-800 pb-5">
            <div className="flex items-start gap-3">
              <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-neutral-900 text-lg font-bold tracking-tight text-white">
                JP
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight text-neutral-900">{company.name}</p>
                <p className="text-xs text-neutral-500">NIT {company.nit}</p>
                <p className="text-xs text-neutral-500">{company.regime}</p>
                <p className="mt-1 text-xs text-neutral-600">{company.address}</p>
                <p className="text-xs text-neutral-600">{company.city}</p>
                <p className="text-xs text-neutral-600">
                  {company.phone} · {company.email}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="rounded-lg border-2 border-neutral-800 px-4 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                  Factura electrónica de venta
                </p>
                <p className="text-xl font-bold tracking-tight text-neutral-900">{invoice.number}</p>
              </div>
              <p className="mt-2 text-xs text-neutral-600">
                Fecha: <span className="font-medium text-neutral-800">{invoice.date}</span>
              </p>
              <p className="text-xs text-neutral-600">
                Hora: <span className="font-medium text-neutral-800">{invoice.time}</span>
              </p>
            </div>
          </div>

          {/* Customer block */}
          <div className="mt-5 grid grid-cols-2 gap-4 rounded-md bg-neutral-50 p-4 text-xs">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Cliente
              </p>
              <p className="font-semibold text-neutral-900">{invoice.customer.name}</p>
              <p className="text-neutral-600">
                {invoice.customer.documentType} {invoice.customer.document}
              </p>
              {invoice.customer.address && (
                <p className="text-neutral-600">{invoice.customer.address}</p>
              )}
              <p className="text-neutral-600">{invoice.customer.city}</p>
            </div>
            <div className="text-right">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Detalles
              </p>
              <p className="text-neutral-600">
                Vendedor: <span className="text-neutral-800">{invoice.seller}</span>
              </p>
              <p className="text-neutral-600">
                Forma de pago: <span className="text-neutral-800">{invoice.paymentMethod}</span>
              </p>
              {invoice.customer.email && (
                <p className="text-neutral-600">{invoice.customer.email}</p>
              )}
            </div>
          </div>

          {/* Items */}
          <table className="mt-5 w-full border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-900 text-white">
                <th className="px-2 py-2 text-left font-semibold">Código</th>
                <th className="px-2 py-2 text-left font-semibold">Descripción</th>
                <th className="px-2 py-2 text-right font-semibold">Cant.</th>
                <th className="px-2 py-2 text-right font-semibold">V. unit.</th>
                <th className="px-2 py-2 text-right font-semibold">Desc.</th>
                <th className="px-2 py-2 text-right font-semibold">IVA</th>
                <th className="px-2 py-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={item.id} className={i % 2 === 1 ? 'bg-neutral-50' : ''}>
                  <td className="px-2 py-1.5 font-mono text-[11px] text-neutral-500">{item.code}</td>
                  <td className="px-2 py-1.5 text-neutral-800">{item.description}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-neutral-700">
                    {item.quantity}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-neutral-700">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-neutral-500">
                    {item.discount > 0 ? `${item.discount}%` : '—'}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-neutral-500">
                    {item.taxRate}%
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums font-medium text-neutral-900">
                    {formatCurrency(lineNet(item))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-4 flex justify-end">
            <div className="w-64 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-neutral-500">Subtotal bruto</span>
                <span className="tabular-nums text-neutral-800">{formatCurrency(totals.gross)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-500">Descuentos</span>
                <span className="tabular-nums text-neutral-800">
                  - {formatCurrency(totals.discount)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-500">Base gravable</span>
                <span className="tabular-nums text-neutral-800">
                  {formatCurrency(totals.subtotal)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-500">IVA</span>
                <span className="tabular-nums text-neutral-800">{formatCurrency(totals.tax)}</span>
              </div>
              <div className="mt-1 flex justify-between border-t-2 border-neutral-800 py-2">
                <span className="text-sm font-bold text-neutral-900">TOTAL</span>
                <span className="text-sm font-bold tabular-nums text-neutral-900">
                  {formatCurrency(totals.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Value in words */}
          <div className="mt-3 rounded-md bg-neutral-50 px-3 py-2 text-[11px]">
            <span className="font-semibold text-neutral-500">Son: </span>
            <span className="text-neutral-800">{numberToWords(totals.total)}</span>
          </div>

          {/* Footer — electronic + resolution */}
          <div className="mt-auto grid grid-cols-[1fr_auto] items-end gap-4 border-t border-neutral-300 pt-4">
            <div className="text-[10px] leading-relaxed text-neutral-500">
              <p className="font-semibold text-neutral-600">
                Estado DIAN: {dianStatusLabel[e.dianStatus]}
              </p>
              {e.cufe && (
                <p className="mt-0.5">
                  <span className="font-semibold">CUFE:</span>{' '}
                  <span className="break-all font-mono">{e.cufe}</span>
                </p>
              )}
              <p className="mt-1.5">{company.resolution}</p>
              <p className="mt-1">
                Representación gráfica de factura electrónica generada por {company.name} · {company.website}
              </p>
            </div>
            <div className="grid size-20 shrink-0 place-items-center rounded border border-neutral-300 bg-white p-1">
              <QrPlaceholder />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Decorative QR placeholder rendered as an SVG grid. */
function QrPlaceholder() {
  const cells = React.useMemo(() => {
    // Deterministic pattern so it doesn't reshuffle on re-render.
    const size = 9
    const arr: boolean[] = []
    let seed = 7
    for (let i = 0; i < size * size; i++) {
      seed = (seed * 1103515245 + 12345) % 2147483648
      arr.push(seed % 3 === 0)
    }
    return arr
  }, [])
  return (
    <svg viewBox="0 0 9 9" className="size-full" aria-label="Código QR de la factura" role="img">
      {cells.map((on, i) => {
        if (!on) return null
        const x = i % 9
        const y = Math.floor(i / 9)
        return <rect key={i} x={x} y={y} width={1} height={1} fill="#171717" />
      })}
    </svg>
  )
}
