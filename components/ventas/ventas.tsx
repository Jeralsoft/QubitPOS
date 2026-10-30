'use client'

import * as React from 'react'
import {
  CheckCircle2,
  FileText,
  AlertCircle,
  Printer,
  Lock,
  LockOpen,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/jeralpos/button'
import { Modal } from '@/components/jeralpos/modal'
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner'
import { usePOSShortcuts } from '@/hooks/use-pos-shortcuts'
import { usePOSSession } from '@/context/pos-session-context'
import { OpenCashModal, type OpenPayload } from '@/components/caja/open-modal'
import { ProductGrid } from './product-grid'
import { CartPanel } from './cart-panel'
import { PaymentModal } from './payment-modal'
import { ThermalReceipt, ThermalReceiptContent } from './thermal-receipt'
import { posApi, type CreateSalePayload } from '@/lib/api'
import {
  posProducts,
  customers as initialCustomers,
  computeTotals,
  formatCurrency,
  FINAL_CONSUMER,
  type CartItem,
  type Customer,
  type PaymentMethodId,
  type Product,
  type CartTotals,
} from './mock-data'

export function Ventas() {
  const { isRegisterOpen, session, openRegister } = usePOSSession()

  const [gridProducts, setGridProducts] = React.useState<Product[]>(posProducts)
  const [items, setItems] = React.useState<CartItem[]>([])
  const [customers, setCustomers] = React.useState<Customer[]>(initialCustomers)
  const [customer, setCustomer] = React.useState<Customer>(FINAL_CONSUMER)
  const [payment, setPayment] = React.useState<PaymentMethodId | null>('efectivo')
  const [payOpen, setPayOpen] = React.useState(false)
  const [isSubmittingSale, setIsSubmittingSale] = React.useState(false)
  const [successOpen, setSuccessOpen] = React.useState(false)
  const [savedOpen, setSavedOpen] = React.useState(false)
  const [openCashModalOpen, setOpenCashModalOpen] = React.useState(false)
  const [customerPickerOpen, setCustomerPickerOpen] = React.useState(false)
  const [receiptWidth, setReceiptWidth] = React.useState<'80mm' | '58mm'>('80mm')
  const [showReceiptPreview, setShowReceiptPreview] = React.useState(false)
  const [scanNotification, setScanNotification] = React.useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Registro de la última venta confirmada para impresión de ticket
  const [lastSale, setLastSale] = React.useState<{
    id?: string
    items: CartItem[]
    totals: CartTotals
    customer: Customer
    payment: PaymentMethodId | null
    cashReceived?: number
    cashChange?: number
    invoiceNumber: string
    cufe?: string
    qrData?: string
    date: Date
  } | null>(null)

  const searchInputRef = React.useRef<HTMLInputElement | null>(null)

  const totals = React.useMemo(() => computeTotals(items), [items])

  // Cargar catálogo de productos en tiempo real desde el backend Laravel
  React.useEffect(() => {
    let active = true
    async function loadBackendProducts() {
      try {
        const res = await posApi.getProducts()
        if (active && res?.data && res.data.length > 0) {
          const live: Product[] = res.data.map((p) => ({
            id: String(p.id),
            code: p.code,
            barcode: p.barcode,
            name: p.name,
            category: p.category,
            brand: p.brand,
            purchasePrice: p.purchasePrice,
            salePrice: p.salePrice,
            stock: p.stock,
            minStock: p.minStock,
            status: p.status,
            color: p.color,
            taxRate: p.taxRate ? Math.round(p.taxRate * 100) : 19,
          }))
          setGridProducts(live.filter((p) => p.status === 'activo' && p.stock > 0))
        }
      } catch {
        // En caso de que el backend esté temporalmente inaccesible, se mantiene posProducts
      }
    }
    loadBackendProducts()
    return () => {
      active = false
    }
  }, [])

  const addProduct = React.useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) {
          setScanNotification({
            type: 'error',
            text: `Stock máximo alcanzado para ${product.name} (${product.stock} disp.)`,
          })
          return prev
        }
        setScanNotification({
          type: 'success',
          text: `+1 ${product.name} agregado (Total: ${existing.quantity + 1})`,
        })
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      setScanNotification({
        type: 'success',
        text: `${product.name} agregado al carrito`,
      })
      return [...prev, { product, quantity: 1, discount: 0 }]
    })
  }, [])

  // Auto-limpiar notificación de escaneo tras 3 segundos
  React.useEffect(() => {
    if (!scanNotification) return
    const timer = setTimeout(() => setScanNotification(null), 3000)
    return () => clearTimeout(timer)
  }, [scanNotification])

  // Hook 1: Captura continua de lector de código de barras
  useBarcodeScanner({
    onScan: (barcode) => {
      const cleanBarcode = barcode.trim().toLowerCase()
      const found = gridProducts.find(
        (p) => p.barcode.toLowerCase() === cleanBarcode || p.code.toLowerCase() === cleanBarcode,
      )

      if (found) {
        addProduct(found)
      } else {
        setScanNotification({
          type: 'error',
          text: `Código ${barcode} no encontrado en inventario`,
        })
      }
    },
  })

  // Hook 2: Atajos de teclado para el cajero
  usePOSShortcuts({
    onFocusSearch: () => {
      searchInputRef.current?.focus()
      searchInputRef.current?.select()
    },
    onSelectCustomer: () => {
      setCustomerPickerOpen(true)
    },
    onCharge: () => {
      if (items.length > 0) {
        if (!isRegisterOpen) {
          setOpenCashModalOpen(true)
          return
        }
        setPayOpen(true)
      }
    },
    onHoldSale: () => {
      if (items.length > 0) {
        setSavedOpen(true)
      }
    },
    onCancel: () => {
      // Las ventanas y modales no se cierran con Escape para evitar pérdida de datos.
      // Solo se cierran mediante la 'X' superior o el botón 'Cancelar'.
      const hasAnyModalOpen = payOpen || successOpen || savedOpen || openCashModalOpen || customerPickerOpen
      if (!hasAnyModalOpen && items.length > 0) {
        resetSale()
      }
    },
  })

  const changeQuantity = React.useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.product.id !== id) return i
        const clamped = Math.max(1, Math.min(quantity, i.product.stock))
        return { ...i, quantity: clamped }
      }),
    )
  }, [])

  const changeDiscount = React.useCallback((id: string, discount: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === id
          ? { ...i, discount: Math.max(0, Math.min(discount, i.product.salePrice * i.quantity)) }
          : i,
      ),
    )
  }, [])

  const removeItem = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== id))
  }, [])

  const resetSale = React.useCallback(() => {
    setItems([])
    setCustomer(FINAL_CONSUMER)
    setPayment('efectivo')
  }, [])

  function handleCreateCustomer(c: Customer) {
    setCustomers((prev) => [c, ...prev])
    setCustomer(c)
  }

  function handleStartCharge() {
    if (!isRegisterOpen) {
      setOpenCashModalOpen(true)
      return
    }
    setPayOpen(true)
  }

  async function confirmPayment(cashReceived?: number) {
    if (items.length === 0 || isSubmittingSale) return

    setIsSubmittingSale(true)

    // Formatear payload estricto para Laravel FormRequest y Action
    const payload: CreateSalePayload = {
      cash_shift_id: Number(session?.id) || 1,
      customer_name: customer.name,
      customer_tax_id: customer.taxId || '222222222222',
      customer_phone: customer.phone || undefined,
      payment_method: payment || 'efectivo',
      cash_received: cashReceived ?? (payment === 'efectivo' ? totals.total : undefined),
      items: items.map((i) => ({
        product_id: Number(i.product.id),
        quantity: i.quantity,
        unit_price: i.product.salePrice,
        discount: i.discount,
        tax_rate: i.product.taxRate ? i.product.taxRate / 100 : 0.19,
      })),
    }

    try {
      const res = await posApi.createSale(payload)
      const sale = res.data

      // Actualizar el registro de la venta con los datos reales del backend
      setLastSale({
        id: sale.id,
        items: [...items],
        totals: {
          subtotal: sale.totals.subtotal,
          discount: sale.totals.discount,
          tax: sale.totals.taxAmount,
          total: sale.totals.total,
        },
        customer,
        payment,
        cashReceived: sale.totals.cashReceived ?? cashReceived,
        cashChange: sale.totals.cashChange ?? undefined,
        invoiceNumber: sale.invoiceNumber,
        cufe: sale.cufe,
        qrData: sale.qrData,
        date: new Date(sale.createdAt),
      })

      // Descontar existencias localmente en la grilla para reactividad instantánea
      setGridProducts((prev) =>
        prev.map((p) => {
          const sold = items.find((i) => i.product.id === p.id)
          if (sold) {
            const remaining = Math.max(0, p.stock - sold.quantity)
            return { ...p, stock: remaining }
          }
          return p
        }),
      )

      toast.success(`Factura ${sale.invoiceNumber} registrada con éxito`, {
        description: `Total: ${formatCurrency(sale.totals.total)} · Kárdex actualizado y CUFE emitido`,
      })

      setPayOpen(false)
      setSuccessOpen(true)
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error desconocido al procesar la venta en caja.'

      toast.error('No se pudo procesar la venta', {
        description: errorMsg,
      })
    } finally {
      setIsSubmittingSale(false)
    }
  }

  function finishSale() {
    setSuccessOpen(false)
    setShowReceiptPreview(false)
    resetSale()
  }

  function saveSale() {
    setSavedOpen(true)
  }

  async function handleConfirmOpenCash(payload: OpenPayload) {
    await openRegister(payload.openingBalance, payload.register, payload.branch)
    setOpenCashModalOpen(false)
    toast.success(`Turno de caja abierto correctamente`, {
      description: `Fondo de apertura: ${formatCurrency(payload.openingBalance)}`,
    })
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col gap-4">
      {/* Barra de advertencia si la caja está cerrada */}
      {!isRegisterOpen && (
        <div className="flex items-center justify-between rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Lock className="size-4 shrink-0 text-warning" />
            <span>
              <strong>Turno de caja cerrado:</strong> Es obligatorio abrir turno de caja para cobrar ventas.
            </span>
          </div>
          <Button
            size="sm"
            variant="navy"
            onClick={() => setOpenCashModalOpen(true)}
            className="h-7 gap-1.5 rounded-xl px-3 text-xs bg-foreground text-background hover:bg-foreground/90 font-semibold"
          >
            <LockOpen className="size-3.5" />
            Abrir caja ahora
          </Button>
        </div>
      )}

      {/* Notificación flotante de escáner */}
      {scanNotification && (
        <div
          role="status"
          aria-live="polite"
          className={`absolute top-2 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-lg backdrop-blur-md transition-all ${
            scanNotification.type === 'success'
              ? 'bg-emerald-500/90 text-white shadow-emerald-500/20'
              : 'bg-rose-500/90 text-white shadow-rose-500/20'
          }`}
        >
          {scanNotification.type === 'success' ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span>{scanNotification.text}</span>
        </div>
      )}

      <div className="grid flex-1 min-h-0 grid-cols-1 gap-4 lg:grid-cols-[1fr_24rem] xl:grid-cols-[1fr_26rem]">
        {/* Catálogo visual y búsqueda */}
        <section
          aria-label="Catálogo de productos"
          className="flex min-h-0 flex-col rounded-3xl border border-border/80 bg-card p-4 shadow-2xs"
        >
          <ProductGrid
            products={gridProducts}
            onAdd={addProduct}
            searchInputRef={searchInputRef}
          />
        </section>

        {/* Panel lateral: Carrito y Totales */}
        <section
          aria-label="Carrito de compra"
          className="flex min-h-0 flex-col rounded-3xl border border-border/80 bg-card p-4 shadow-2xs"
        >
          <CartPanel
            items={items}
            customer={customer}
            customers={customers}
            payment={payment}
            totals={totals}
            customerPickerOpen={customerPickerOpen}
            onCustomerPickerOpenChange={setCustomerPickerOpen}
            onSelectCustomer={setCustomer}
            onCreateCustomer={handleCreateCustomer}
            onSelectPayment={setPayment}
            onChangeQuantity={changeQuantity}
            onChangeDiscount={changeDiscount}
            onRemove={removeItem}
            onCancel={resetSale}
            onSave={saveSale}
            onCharge={handleStartCharge}
          />
        </section>

        {/* Modal de cobro */}
        <PaymentModal
          open={payOpen}
          onClose={() => setPayOpen(false)}
          onConfirm={confirmPayment}
          totals={totals}
          customer={customer}
          payment={payment}
          isSubmitting={isSubmittingSale}
        />

        {/* Modal de éxito e impresión de ticket */}
        <Modal
          open={successOpen}
          onClose={finishSale}
          title="Venta completada con éxito"
          footer={
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex-1 gap-2 border-primary/40 text-primary"
              >
                <Printer className="size-4" />
                Imprimir ticket ({receiptWidth})
              </Button>
              {lastSale?.id && (
                <Button
                  variant="outline"
                  onClick={() => window.open(`http://localhost:8000/api/pos/sales/${lastSale.id}/xml`, '_blank')}
                  className="flex-1 gap-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                >
                  <FileText className="size-4" />
                  XML DIAN (UBL 2.1)
                </Button>
              )}
              <Button variant="success" onClick={finishSale} className="flex-1">
                Nueva venta
              </Button>
            </div>
          }
        >
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-success-muted text-success">
              <CheckCircle2 className="size-8" />
            </span>
            <div>
              <p className="text-3xl font-bold tabular-nums tracking-tight">
                {lastSale ? formatCurrency(lastSale.totals.total) : formatCurrency(totals.total)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Documento <strong>{lastSale?.invoiceNumber}</strong> generado para{' '}
                <strong>{lastSale?.customer.name}</strong>.
              </p>
            </div>

            {/* Selector de ancho de papel térmico */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-1.5 text-xs">
              <span className="text-muted-foreground">Ancho papel:</span>
              <button
                type="button"
                onClick={() => setReceiptWidth('80mm')}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  receiptWidth === '80mm'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                80 mm (Estándar)
              </button>
              <button
                type="button"
                onClick={() => setReceiptWidth('58mm')}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  receiptWidth === '58mm'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                58 mm (Mini)
              </button>
            </div>

            {/* Alternar vista previa de la tirilla */}
            <div className="w-full pt-1">
              <button
                type="button"
                onClick={() => setShowReceiptPreview((v) => !v)}
                className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1.5"
              >
                {showReceiptPreview ? 'Ocultar diseño de tirilla' : '👁️ Ver vista previa de la tirilla'}
              </button>

              {showReceiptPreview && lastSale && (
                <div className="mt-3 flex justify-center max-h-[300px] overflow-y-auto p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-border">
                  <ThermalReceiptContent
                    items={lastSale.items}
                    totals={lastSale.totals}
                    customer={lastSale.customer}
                    paymentMethod={lastSale.payment}
                    invoiceNumber={lastSale.invoiceNumber}
                    cufe={lastSale.cufe}
                    qrData={lastSale.qrData}
                    date={lastSale.date}
                    cashReceived={lastSale.cashReceived ?? lastSale.totals.total}
                    cashChange={lastSale.cashChange ?? 0}
                    cashierName={session?.user ?? 'Laura Martínez'}
                    branchName={session?.branch ?? 'Sede Principal'}
                    registerName={session?.register ?? 'Caja #001'}
                    width={receiptWidth}
                    isInlinePreview={true}
                  />
                </div>
              )}
            </div>
          </div>
        </Modal>

        {/* Modal de venta en espera */}
        <Modal
          open={savedOpen}
          onClose={() => setSavedOpen(false)}
          title="Venta guardada en espera"
          description="La venta quedó en espera y puedes retomarla en cualquier momento."
          footer={
            <Button onClick={() => setSavedOpen(false)} className="w-full">
              Entendido
            </Button>
          }
        />

        {/* Modal para abrir caja si estaba cerrada */}
        <OpenCashModal
          open={openCashModalOpen}
          onClose={() => setOpenCashModalOpen(false)}
          onConfirm={handleConfirmOpenCash}
        />

        {/* Componente de ticket térmico inyectado para window.print() */}
        {lastSale && (
          <ThermalReceipt
            items={lastSale.items}
            totals={lastSale.totals}
            customer={lastSale.customer}
            paymentMethod={lastSale.payment}
            invoiceNumber={lastSale.invoiceNumber}
            cufe={lastSale.cufe}
            qrData={lastSale.qrData}
            date={lastSale.date}
            cashReceived={lastSale.cashReceived ?? lastSale.totals.total}
            cashChange={lastSale.cashChange ?? 0}
            cashierName={session?.user ?? 'Laura Martínez'}
            branchName={session?.branch ?? 'Sede Principal'}
            registerName={session?.register ?? 'Caja #001'}
            width={receiptWidth}
          />
        )}
      </div>
    </div>
  )
}
