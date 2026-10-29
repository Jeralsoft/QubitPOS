'use client'

import * as React from 'react'
import { formatCOP } from '@/lib/currency'
import type { CartItem, CartTotals, Customer, PaymentMethodId } from './mock-data'

export interface ThermalReceiptProps {
  items: CartItem[]
  totals: CartTotals
  customer: Customer
  paymentMethod: PaymentMethodId | null
  cashReceived?: number
  cashChange?: number
  invoiceNumber?: string
  date?: Date
  cashierName?: string
  branchName?: string
  registerName?: string
  width?: '80mm' | '58mm'
}

/**
 * Componente de Ticket Térmico optimizado para impresoras POS de 80mm y 58mm.
 * Solo es visible durante la acción de impresión (@media print) o en vista previa.
 */
export function ThermalReceipt({
  items,
  totals,
  customer,
  paymentMethod,
  cashReceived = 0,
  cashChange = 0,
  invoiceNumber = 'SETP-001248',
  date = new Date(),
  cashierName = 'Laura Martínez',
  branchName = 'Sede Principal',
  registerName = 'Caja #001',
  width = '80mm',
}: ThermalReceiptProps) {
  const is58mm = width === '58mm'

  // Cálculo de discriminación de IVA (19%)
  const subtotalNeto = Math.round(totals.subtotal - totals.discount)
  const baseGravable = Math.round(subtotalNeto / 1.19)
  const valorIVA = subtotalNeto - baseGravable

  const formattedDate = date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const formattedTime = date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  // CUFE simulado conforme al estándar DIAN
  const cufe =
    '8f4a1b9c2d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e'

  return (
    <div
      id="thermal-receipt"
      className={is58mm ? 'receipt-58mm' : ''}
      style={{
        display: 'none',
        fontFamily: "'Courier New', Courier, monospace",
      }}
    >
      {/* 1. Encabezado de Empresa */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <p style={{ fontWeight: 'bold', fontSize: '13px', margin: '0 0 2px 0' }}>
          QUBIT SOLUCIONES POS S.A.S.
        </p>
        <p style={{ margin: '0 0 1px 0' }}>NIT: 901.456.789-3</p>
        <p style={{ margin: '0 0 1px 0' }}>Responsable de IVA</p>
        <p style={{ margin: '0 0 1px 0' }}>Calle 30 # 45-12, Local 3 · Medellín</p>
        <p style={{ margin: '0 0 1px 0' }}>Tel: +57 (604) 444-8899</p>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* 2. Resolución DIAN */}
      <div style={{ fontSize: '10px', textAlign: 'center', margin: '4px 0' }}>
        <p style={{ margin: '0' }}>Resolución DIAN No. 18764000001234</p>
        <p style={{ margin: '0' }}>Vigencia: 2026-01-15 a 2027-01-15 (12 meses)</p>
        <p style={{ margin: '0' }}>Rango autorizado: SETP 990000001 al 995000000</p>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* 3. Datos de la Venta */}
      <div style={{ fontSize: '10px', margin: '4px 0' }}>
        <p style={{ fontWeight: 'bold', fontSize: '11px', margin: '0 0 2px 0' }}>
          FACTURA ELECTRÓNICA DE VENTA: {invoiceNumber}
        </p>
        <p style={{ margin: '0' }}>
          Fecha: {formattedDate} {formattedTime}-05:00
        </p>
        <p style={{ margin: '0' }}>
          Sede: {branchName} · {registerName}
        </p>
        <p style={{ margin: '0' }}>Cajero: {cashierName}</p>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* 4. Datos del Adquiriente / Cliente */}
      <div style={{ fontSize: '10px', margin: '4px 0' }}>
        <p style={{ margin: '0' }}>
          <strong>Cliente:</strong> {customer.name}
        </p>
        <p style={{ margin: '0' }}>
          <strong>NIT/CC:</strong> {customer.taxId}
        </p>
        {customer.phone && (
          <p style={{ margin: '0' }}>
            <strong>Teléfono:</strong> {customer.phone}
          </p>
        )}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* 5. Tabla de Artículos */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
            <th style={{ padding: '2px 0', width: '15%' }}>CANT</th>
            <th style={{ padding: '2px 0', width: '50%' }}>DESCRIPCIÓN</th>
            <th style={{ padding: '2px 0', width: '35%', textAlign: 'right' }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const lineVal = Math.max(0, item.product.salePrice * item.quantity - item.discount)
            return (
              <tr key={item.product.id} style={{ verticalAlign: 'top' }}>
                <td style={{ padding: '2px 0' }}>{item.quantity}</td>
                <td style={{ padding: '2px 0' }}>
                  <div>{item.product.name}</div>
                  <div style={{ fontSize: '9px', color: '#333' }}>
                    {formatCOP(item.product.salePrice)} c/u
                    {item.discount > 0 && ` (Desc: -${formatCOP(item.discount)})`}
                  </div>
                </td>
                <td style={{ padding: '2px 0', textAlign: 'right' }}>{formatCOP(lineVal)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* 6. Discriminación de IVA y Totales */}
      <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal:</span>
          <span>{formatCOP(totals.subtotal)}</span>
        </div>
        {totals.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Descuento total:</span>
            <span>-{formatCOP(totals.discount)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Base gravable (19%):</span>
          <span>{formatCOP(baseGravable)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>IVA generado (19%):</span>
          <span>{formatCOP(valorIVA)}</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            fontSize: '13px',
            borderTop: '1px solid #000',
            marginTop: '4px',
            paddingTop: '4px',
          }}
        >
          <span>TOTAL A PAGAR:</span>
          <span>{formatCOP(totals.total)}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* 7. Medio de Pago y Cambio */}
      <div style={{ fontSize: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Medio de pago:</span>
          <span style={{ textTransform: 'capitalize' }}>{paymentMethod ?? 'Efectivo'}</span>
        </div>
        {paymentMethod === 'efectivo' && cashReceived > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Efectivo recibido:</span>
              <span>{formatCOP(cashReceived)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Cambio / Vuelto:</span>
              <span>{formatCOP(cashChange)}</span>
            </div>
          </>
        )}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* 8. Representación Gráfica CUFE y Código QR */}
      <div style={{ textAlign: 'center', fontSize: '9px', margin: '6px 0' }}>
        <p style={{ margin: '0 0 4px 0', wordBreak: 'break-all', fontSize: '8px' }}>
          <strong>CUFE:</strong> {cufe}
        </p>

        {/* QR Code SVG Reglamentario */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '6px auto',
          }}
        >
          <svg
            viewBox="0 0 100 100"
            style={{ width: '80px', height: '80px', background: '#fff' }}
          >
            {/* Esquinas del código QR */}
            <rect x="5" y="5" width="25" height="25" fill="#000" />
            <rect x="8" y="8" width="19" height="19" fill="#fff" />
            <rect x="12" y="12" width="11" height="11" fill="#000" />

            <rect x="70" y="5" width="25" height="25" fill="#000" />
            <rect x="73" y="8" width="19" height="19" fill="#fff" />
            <rect x="77" y="12" width="11" height="11" fill="#000" />

            <rect x="5" y="70" width="25" height="25" fill="#000" />
            <rect x="8" y="73" width="19" height="19" fill="#fff" />
            <rect x="12" y="77" width="11" height="11" fill="#000" />

            {/* Patrón central de datos */}
            <rect x="35" y="10" width="8" height="8" fill="#000" />
            <rect x="50" y="15" width="10" height="5" fill="#000" />
            <rect x="40" y="25" width="20" height="6" fill="#000" />
            <rect x="10" y="38" width="80" height="6" fill="#000" />
            <rect x="15" y="48" width="20" height="8" fill="#000" />
            <rect x="45" y="48" width="15" height="15" fill="#000" />
            <rect x="70" y="48" width="20" height="8" fill="#000" />
            <rect x="35" y="68" width="15" height="15" fill="#000" />
            <rect x="55" y="68" width="35" height="8" fill="#000" />
            <rect x="60" y="80" width="30" height="12" fill="#000" />
          </svg>
        </div>
        <p style={{ margin: '2px 0', fontSize: '8px', color: '#555' }}>
          Consulte su documento en: https://catalogo-vpfe.dian.gov.co
        </p>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* 9. Pie de Ticket */}
      <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '6px' }}>
        <p style={{ fontWeight: 'bold', margin: '0' }}>¡GRACIAS POR SU COMPRA!</p>
        <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#444' }}>
          Software POS Desarrollado por QubitPOS
        </p>
      </div>
    </div>
  )
}
