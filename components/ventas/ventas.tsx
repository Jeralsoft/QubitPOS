'use client'

import * as React from 'react'
import {
  CheckCircle2,
  ScanBarcode,
  AlertCircle,
  Printer,
  Lock,
  LockOpen,
} from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Modal } from '@/components/jeralpos/modal'
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner'
import { usePOSShortcuts } from '@/hooks/use-pos-shortcuts'
import { usePOSSession } from '@/context/pos-session-context'
import { OpenCashModal, type OpenPayload } from '@/components/caja/open-modal'
import { ProductGrid } from './product-grid'
import { CartPanel } from './cart-panel'
import { PaymentModal } from './payment-modal'
import { ThermalReceipt } from './thermal-receipt'
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

  const [items, setItems] = React.useState<CartItem[]>([])
  const [customers, setCustomers] = React.useState<Customer[]>(initialCustomers)
  const [customer, setCustomer] = React.useState<Customer>(FINAL_CONSUMER)
  const [payment, setPayment] = React.useState<PaymentMethodId | null>('efectivo')
  const [payOpen, setPayOpen] = React.useState(false)
  const [successOpen, setSuccessOpen] = React.useState(false)
  const [savedOpen, setSavedOpen] = React.useState(false)
  const [openCashModalOpen, setOpenCashModalOpen] = React.useState(false)
  const [customerPickerOpen, setCustomerPickerOpen] = React.useState(false)
  const [receiptWidth, setReceiptWidth] = React.useState<'80mm' | '58mm'>('80mm')
  const [scanNotification, setScanNotification] = React.useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Registro de la última venta confirmada para impresión de ticket
  const [lastSale, setLastSale] = React.useState<{
    items: CartItem[]
    totals: CartTotals
    customer: Customer
    payment: PaymentMethodId | null
    invoiceNumber: string
    date: Date
  } | null>(null)

  const searchInputRef = React.useRef<HTMLInputElement | null>(null)

  const totals = React.useMemo(() => computeTotals(items), [items])

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
      const found = posProducts.find(
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
      if (payOpen) {
        setPayOpen(false)
      } else if (successOpen) {
        setSuccessOpen(false)
        resetSale()
      } else if (savedOpen) {
        setSavedOpen(false)
      } else if (openCashModalOpen) {
        setOpenCashModalOpen(false)
      } else if (customerPickerOpen) {
        setCustomerPickerOpen(false)
      } else if (items.length > 0) {
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

  function confirmPayment() {
    const invoiceNum = `SETP-${String(Math.floor(100000 + Math.random() * 900000))}`
    setLastSale({
      items: [...items],
      totals: { ...totals },
      customer,
      payment,
      invoiceNumber: invoiceNum,
      date: new Date(),
    })
    setPayOpen(false)
    setSuccessOpen(true)
  }

  function finishSale() {
    setSuccessOpen(false)
    resetSale()
  }

  function saveSale() {
    setSavedOpen(true)
  }

  function handleConfirmOpenCash(payload: OpenPayload) {
    openRegister(payload.openingBalance, payload.register, payload.branch)
    setOpenCashModalOpen(false)
    setScanNotification({
      type: 'success',
      text: `Turno de caja abierto correctamente con ${formatCurrency(payload.openingBalance)}`,
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
            variant="outline"
            onClick={() => setOpenCashModalOpen(true)}
            className="gap-1.5 border-warning/60 text-warning-foreground hover:bg-warning/10"
          >
            <LockOpen className="size-3.5" />
            Abrir turno
          </Button>
        </div>
      )}

      <div className="flex h-full min-h-0 flex-col gap-4 lg:flex-row">
        {/* Toast flotante de escaneo de código de barras */}
        {scanNotification && (
          <div
            className={`absolute left-4 top-2 z-30 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium shadow-md transition-all ${
              scanNotification.type === 'success'
                ? 'border-success/40 bg-success-muted text-success'
                : 'border-danger/40 bg-danger-muted text-danger'
            }`}
          >
            {scanNotification.type === 'success' ? (
              <ScanBarcode className="size-4" />
            ) : (
              <AlertCircle className="size-4" />
            )}
            <span>{scanNotification.text}</span>
          </div>
        )}

        <section
          aria-label="Productos"
          className="min-h-0 flex-1 rounded-2xl border border-border/75 bg-card/40 p-4 shadow-2xs"
        >
          <ProductGrid onAdd={addProduct} searchInputRef={searchInputRef} />
        </section>

        <aside
          aria-label="Carrito de venta"
          className="flex min-h-0 shrink-0 flex-col overflow-hidden rounded-2xl border-0 bg-transparent lg:w-[24rem] xl:w-[26rem]"
        >
          <CartPanel
            items={items}
            totals={totals}
            customer={customer}
            customers={customers}
            onSelectCustomer={setCustomer}
            onCreateCustomer={handleCreateCustomer}
            customerPickerOpen={customerPickerOpen}
            onCustomerPickerOpenChange={setCustomerPickerOpen}
            payment={payment}
            onSelectPayment={setPayment}
            onChangeQuantity={changeQuantity}
            onChangeDiscount={changeDiscount}
            onRemove={removeItem}
            onCharge={handleStartCharge}
            onSave={saveSale}
            onCancel={resetSale}
          />
        </aside>

        {/* Modal de cobro */}
        <PaymentModal
          open={payOpen}
          onClose={() => setPayOpen(false)}
          onConfirm={confirmPayment}
          totals={totals}
          customer={customer}
          payment={payment}
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
            date={lastSale.date}
            cashReceived={lastSale.totals.total}
            cashChange={0}
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

