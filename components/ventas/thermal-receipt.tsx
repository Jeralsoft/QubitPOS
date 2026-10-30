'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { formatCOP } from '@/lib/currency'
import { cn } from '@/lib/utils'
import type { CartItem, CartTotals, Customer, PaymentMethodId } from './mock-data'

export interface ThermalReceiptProps {
  items: CartItem[]
  totals: CartTotals
  customer: Customer
  paymentMethod: PaymentMethodId | null
  cashReceived?: number
  cashChange?: number
  invoiceNumber?: string
  cufe?: string
  qrData?: string
  date?: Date
  cashierName?: string
  branchName?: string
  registerName?: string
  width?: '80mm' | '58mm'
  isInlinePreview?: boolean
}

/**
 * Contenido puro de la tirilla térmica para ser reutilizado
 * tanto en la vista previa en pantalla como en la impresión física.
 */
export function ThermalReceiptContent({
  items,
  totals,
  customer,
  paymentMethod,
  cashReceived = 0,
  cashChange = 0,
  invoiceNumber = 'SETP-001248',
  cufe,
  qrData,
  date = new Date(),
  cashierName = 'Laura Martínez',
  branchName = 'Sede Principal',
  registerName = 'Caja #001',
  width = '80mm',
  isInlinePreview = false,
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

  // CUFE legal o simulado conforme al estándar DIAN
  const finalCufe =
    cufe ||
    '8f4a1b9c2d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e'

  return (
    <div
      className={cn(
        'receipt-content text-black bg-white',
        is58mm ? 'receipt-58mm' : '',
        isInlinePreview ? 'p-4 rounded-xl shadow-md border border-neutral-300 text-left' : '',
      )}
      style={{
        fontFamily: "'Courier New', Courier, monospace",
        width: isInlinePreview ? (is58mm ? '280px' : '340px') : undefined,
        lineHeight: 1.25,
      }}
    >
      {/* 1. Encabezado de Empresa */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <p style={{ fontWeight: 'bold', fontSize: '13px', margin: '0 0 2px 0' }}>
          QUBIT SOLUCIONES POS S.A.S.
        </p>
        <p style={{ margin: '0 0 1px 0', fontSize: '10px' }}>NIT: 901.456.789-3</p>
        <p style={{ margin: '0 0 1px 0', fontSize: '10px' }}>Responsable de IVA</p>
        <p style={{ margin: '0 0 1px 0', fontSize: '10px' }}>Calle 30 # 45-12, Local 3 · Medellín</p>
        <p style={{ margin: '0 0 1px 0', fontSize: '10px' }}>Tel: +57 (604) 444-8899</p>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* 2. Resolución DIAN */}
      <div style={{ fontSize: '9px', textAlign: 'center', margin: '4px 0' }}>
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
          <strong>NIT/CC:</strong> {customer.taxId || '222222222222 (Consumidor Final)'}
        </p>
        {customer.phone && (
          <p style={{ margin: '0' }}>
            <strong>Teléfono:</strong> {customer.phone}
          </p>
        )}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* 5. Tabla de Artículos */}
      <div style={{ fontSize: '10px', margin: '6px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderBottom: '1px dashed #000', paddingBottom: '3px' }}>
          <span style={{ flex: 1 }}>DESCRIPCIÓN / CANT.</span>
          <span style={{ textAlign: 'right', width: '70px' }}>TOTAL</span>
        </div>
        <div style={{ marginTop: '4px' }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span style={{ flex: 1, wordBreak: 'break-word' }}>{item.product.name}</span>
                <span style={{ textAlign: 'right', width: '70px' }}>
                  {formatCOP(item.product.salePrice * item.quantity - item.discount)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#333' }}>
                <span>
                  {item.quantity} x {formatCOP(item.product.salePrice)}
                  {item.discount > 0 && ` (Desc. -${formatCOP(item.discount)})`}
                </span>
                <span>IVA 19%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* 6. Totales y Desglose de Impuestos */}
      <div style={{ fontSize: '10px', margin: '4px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>SUBTOTAL:</span>
          <span>{formatCOP(totals.subtotal)}</span>
        </div>
        {totals.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
            <span>DESCUENTO:</span>
            <span>-{formatCOP(totals.discount)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>BASE GRAVABLE (19%):</span>
          <span>{formatCOP(baseGravable)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>IVA GENERADO (19%):</span>
          <span>{formatCOP(valorIVA)}</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '13px',
            fontWeight: 'bold',
            marginTop: '4px',
            borderTop: '1px solid #000',
            paddingTop: '3px',
          }}
        >
          <span>TOTAL A PAGAR:</span>
          <span>{formatCOP(totals.total)}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* 7. Medio de Pago y Cambio */}
      <div style={{ fontSize: '10px', margin: '4px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ textTransform: 'uppercase' }}>FORMA DE PAGO:</span>
          <span style={{ fontWeight: 'bold' }}>{paymentMethod || 'EFECTIVO'}</span>
        </div>
        {paymentMethod === 'efectivo' && cashReceived > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>VALOR RECIBIDO:</span>
              <span>{formatCOP(cashReceived)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>CAMBIO / DEVUELTA:</span>
              <span>{formatCOP(cashChange)}</span>
            </div>
          </>
        )}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

      {/* 8. Representación Gráfica CUFE y Código QR */}
      <div style={{ textAlign: 'center', fontSize: '9px', margin: '6px 0' }}>
        <p style={{ margin: '0 0 4px 0', wordBreak: 'break-all', fontSize: '7.5px' }}>
          <strong>CUFE:</strong> {finalCufe}
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
          Consulte su documento en: {qrData || 'https://catalogo-vpfe.dian.gov.co'}
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

/**
 * Componente de Ticket Térmico montado directamente en document.body mediante Portal
 * para garantizar que ningún contenedor padre (overflow: hidden, modal, flex) recorte
 * o impida la impresión (@media print).
 */
export function ThermalReceipt(props: ThermalReceiptProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || typeof document === 'undefined') {
    return null
  }

  const is58mm = props.width === '58mm'

  return createPortal(
    <div
      id="thermal-receipt"
      className={is58mm ? 'receipt-58mm' : ''}
    >
      <ThermalReceiptContent {...props} isInlinePreview={false} />
    </div>,
    document.body,
  )
}
