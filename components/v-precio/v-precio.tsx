'use client'

import * as React from 'react'
import {
  Tags,
  Search,
  ScanBarcode,
  Layers,
  Percent,
  TrendingUp,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  DollarSign,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/components/jeralpos/button'
import { Input, Select, Label, FieldHint } from '@/components/jeralpos/input'
import { Badge } from '@/components/jeralpos/badge'
import { DataToast } from '@/components/jeralpos/data-toast'
import { formatCOP } from '@/lib/currency'
import { pricingApi, type PriceCheckResult, type PriceTierRecord } from '@/lib/api'
import { cn } from '@/lib/utils'

export function VPrecio() {
  const [activeTab, setActiveTab] = React.useState<'checker' | 'lists' | 'batch'>('checker')
  const [barcodeInput, setBarcodeInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<PriceCheckResult | null>(null)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  // Listas de Precios
  const [priceTiers, setPriceTiers] = React.useState<PriceTierRecord[]>([])
  const [tiersLoading, setTiersLoading] = React.useState(false)

  // Ajuste Masivo
  const [batchCategory, setBatchCategory] = React.useState('all')
  const [adjustmentType, setAdjustmentType] = React.useState<'percentage' | 'fixed'>('percentage')
  const [operation, setOperation] = React.useState<'increase' | 'decrease'>('increase')
  const [batchValue, setBatchValue] = React.useState('5')
  const [batchLoading, setBatchLoading] = React.useState(false)

  // Toast
  const [toast, setToast] = React.useState<{ msg: string; kind: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, kind: 'success' | 'error' = 'success') => {
    setToast({ msg, kind })
    window.setTimeout(() => setToast(null), 3200)
  }

  // Cargar listas de precios
  const loadTiers = React.useCallback(async () => {
    try {
      setTiersLoading(true)
      const res = await pricingApi.getLists()
      if (res.data) {
        setPriceTiers(res.data)
      }
    } catch {
      // Fallback a listas por defecto si API no responde
      setPriceTiers([
        {
          id: 'general',
          name: 'Precio General (Minorista)',
          code: 'MIN',
          discount_pct: 0,
          description: 'Precio base al público en punto de venta.',
          is_default: true,
        },
        {
          id: 'mayorista',
          name: 'Lista Mayorista',
          code: 'MAY',
          discount_pct: 10,
          description: 'Descuento del 10% para compras por volumen.',
          is_default: false,
        },
        {
          id: 'distribuidor',
          name: 'Lista Distribuidor',
          code: 'DIS',
          discount_pct: 18,
          description: 'Descuento preferencial del 18% para canales mayoristas.',
          is_default: false,
        },
        {
          id: 'corporativo',
          name: 'Convenio Corporativo / VIP',
          code: 'CORP',
          discount_pct: 12,
          description: 'Tarifa para empresas aliadas e instituciones.',
          is_default: false,
        },
      ])
    } finally {
      setTiersLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadTiers()
  }, [loadTiers])

  // Verificación de precio por código
  const handleCheckPrice = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const code = barcodeInput.trim()
    if (!code) return

    setLoading(true)
    setErrorMsg(null)
    setResult(null)

    try {
      const res = await pricingApi.check(code)
      if (res.data) {
        setResult(res.data)
        showToast(`Producto "${res.data.product.name}" consultado correctamente.`)
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || `No se encontró ningún producto con el código "${code}".`
      setErrorMsg(msg)
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Ejecución de ajuste masivo
  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(batchValue)
    if (isNaN(val) || val <= 0) {
      showToast('Ingresa un valor de ajuste válido mayor a cero.', 'error')
      return
    }

    setBatchLoading(true)
    try {
      const res = await pricingApi.batchUpdate({
        category: batchCategory === 'all' ? undefined : batchCategory,
        adjustment_type: adjustmentType,
        operation,
        value: val,
      })
      showToast(res.message || 'Precios actualizados masivamente.')
      // Si había un producto verificado, refrescar
      if (result) {
        handleCheckPrice()
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al aplicar el ajuste masivo de precios.'
      showToast(msg, 'error')
    } finally {
      setBatchLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-1 md:p-2">
      {/* Cabecera */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Tags className="size-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Verificador de Precios & Tarifas (V. Precio)
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulta rápida de precios con escáner, administración de listas escalonadas y ajustes masivos de catálogo.
          </p>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex rounded-xl border border-border bg-card p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('checker')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all select-none',
              activeTab === 'checker'
                ? 'bg-foreground text-background shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <ScanBarcode className="size-3.5" />
            Verificador Rápido
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lists')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all select-none',
              activeTab === 'lists'
                ? 'bg-foreground text-background shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Layers className="size-3.5" />
            Listas de Precios
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('batch')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all select-none',
              activeTab === 'batch'
                ? 'bg-foreground text-background shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <SlidersHorizontal className="size-3.5" />
            Ajuste Masivo (%)
          </button>
        </div>
      </div>

      {/* PESTAÑA 1: VERIFICADOR RÁPIDO DE PRECIOS */}
      {activeTab === 'checker' && (
        <div className="space-y-6">
          {/* Barra de Búsqueda / Escáner */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <form onSubmit={handleCheckPrice} className="space-y-3">
              <Label htmlFor="scanner-input" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ScanBarcode className="size-4 text-primary" />
                Lector de Código de Barras o Búsqueda por SKU
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Input
                    id="scanner-input"
                    leadingIcon={<Search />}
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Escanea el código de barras o escribe el código (ej. 7701234567890 o PROD-001)..."
                    className="h-12 text-base font-mono font-medium pl-10"
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={loading || !barcodeInput.trim()}
                  className="h-12 px-6 font-semibold"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      Consultando...
                    </>
                  ) : (
                    <>
                      <Search className="size-4" />
                      Verificar Precio
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: Esta pantalla es compatible con pistolas lectoras USB/Bluetooth en modo emulación de teclado.
              </p>
            </form>
          </div>

          {/* Resultado de la Consulta */}
          {errorMsg && (
            <div className="flex items-center gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
              <AlertCircle className="size-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Tarjeta Principal del Producto */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" size="sm">
                        {result.product.category}
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">
                        Código: {result.product.code}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        Barras: {result.product.barcode}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {result.product.name}
                    </h2>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-muted-foreground">Disponibilidad en stock:</span>
                      <Badge variant={result.product.stock > 0 ? 'success' : 'danger'} size="sm" dot>
                        {result.product.stock} unidades
                      </Badge>
                    </div>
                  </div>

                  {/* Precio Grande Destacado */}
                  <div className="flex flex-col items-start md:items-end rounded-xl border border-primary/20 bg-primary/5 p-4 md:min-w-[240px]">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Precio de Venta al Público
                    </span>
                    <span className="text-3xl font-extrabold text-primary tabular-nums">
                      {formatCOP(result.product.price_with_tax)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Incluye IVA ({result.product.tax_pct})
                    </span>
                  </div>
                </div>

                {/* Métricas Financieras y Desglose Tributario */}
                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border/80 pt-6 sm:grid-cols-4">
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                    <span className="text-xs text-muted-foreground">Costo de Adquisición</span>
                    <p className="mt-1 text-base font-semibold text-foreground tabular-nums">
                      {formatCOP(result.product.purchase_price)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                    <span className="text-xs text-muted-foreground">Base Gravable (Antes de IVA)</span>
                    <p className="mt-1 text-base font-semibold text-foreground tabular-nums">
                      {formatCOP(result.product.sale_price)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                    <span className="text-xs text-muted-foreground">Impuesto IVA ({result.product.tax_pct})</span>
                    <p className="mt-1 text-base font-semibold text-foreground tabular-nums">
                      {formatCOP(result.product.price_with_tax - result.product.sale_price)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                    <span className="text-xs text-muted-foreground">Margen Bruto de Utilidad</span>
                    <div className="mt-1 flex items-center gap-1.5">
                      <p className="text-base font-semibold text-success tabular-nums">
                        {result.product.margin_pct}%
                      </p>
                      <span className="text-xs text-muted-foreground">
                        ({formatCOP(result.product.margin_amount)})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparativo de Listas de Precios para este Producto */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  Tarifas por Categoría de Cliente
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Precios calculados en tiempo real según la política comercial del establecimiento.
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Tarifa Minorista */}
                  <div className="rounded-xl border border-border/80 bg-muted/10 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-sm">General (Minorista)</span>
                      <Badge variant="neutral" size="sm">0% desc.</Badge>
                    </div>
                    <p className="text-2xl font-bold text-foreground tabular-nums">
                      {formatCOP(result.tiers.minorista.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Base: {formatCOP(result.tiers.minorista.price)} + IVA: {formatCOP(result.tiers.minorista.tax)}
                    </p>
                  </div>

                  {/* Tarifa Mayorista */}
                  <div className="rounded-xl border border-border/80 bg-muted/10 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-sm">Mayorista</span>
                      <Badge variant="success" size="sm">-10% desc.</Badge>
                    </div>
                    <p className="text-2xl font-bold text-success tabular-nums">
                      {formatCOP(result.tiers.mayorista.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Base: {formatCOP(result.tiers.mayorista.price)} + IVA: {formatCOP(result.tiers.mayorista.tax)}
                    </p>
                  </div>

                  {/* Tarifa Distribuidor */}
                  <div className="rounded-xl border border-border/80 bg-muted/10 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-sm">Distribuidor</span>
                      <Badge variant="success" size="sm">-18% desc.</Badge>
                    </div>
                    <p className="text-2xl font-bold text-primary tabular-nums">
                      {formatCOP(result.tiers.distribuidor.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Base: {formatCOP(result.tiers.distribuidor.price)} + IVA: {formatCOP(result.tiers.distribuidor.tax)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 2: LISTAS DE PRECIOS */}
      {activeTab === 'lists' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Listas de Precios Configuradas</h2>
                <p className="text-xs text-muted-foreground">
                  Reglas de descuento y condiciones preferenciales asociables a clientes en facturación POS y electrónica.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={loadTiers} disabled={tiersLoading}>
                <RefreshCw className={cn('size-3.5', tiersLoading && 'animate-spin')} />
                Actualizar Listas
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {priceTiers.map((tier) => (
                <div
                  key={tier.id}
                  className="rounded-xl border border-border/80 bg-card p-5 shadow-xs space-y-3 transition-all hover:border-primary/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                        {tier.code}
                      </span>
                      <h3 className="font-semibold text-foreground">{tier.name}</h3>
                    </div>
                    {tier.is_default ? (
                      <Badge variant="primary" size="sm">Por Defecto</Badge>
                    ) : (
                      <Badge variant="success" size="sm">-{tier.discount_pct}% Descuento</Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    <span className="text-muted-foreground">Aplica en: Punto de Venta & Cartera</span>
                    <span className="text-foreground font-medium flex items-center gap-1">
                      <CheckCircle2 className="size-3.5 text-success" />
                      Activa
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: AJUSTE MASIVO DE PRECIOS */}
      {activeTab === 'batch' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm max-w-2xl">
            <div className="mb-6 space-y-1">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <SlidersHorizontal className="size-5 text-primary" />
                Ajuste Masivo de Precios de Venta
              </h2>
              <p className="text-xs text-muted-foreground">
                Actualiza de forma atómica y auditable los precios de venta en base de datos PostgreSQL por categoría o catálogo completo.
              </p>
            </div>

            <form onSubmit={handleBatchSubmit} className="space-y-5">
              <div>
                <Label htmlFor="batch-cat">Categoría objetivo</Label>
                <Select
                  id="batch-cat"
                  value={batchCategory}
                  onChange={(e) => setBatchCategory(e.target.value)}
                >
                  <option value="all">Todas las categorías (Catálogo General)</option>
                  <option value="Bebidas">Bebidas</option>
                  <option value="Panadería">Panadería</option>
                  <option value="Lácteos">Lácteos</option>
                  <option value="Abarrotes">Abarrotes</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Granos">Granos</option>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="adj-type">Tipo de ajuste</Label>
                  <Select
                    id="adj-type"
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value as any)}
                  >
                    <option value="percentage">Porcentual (%)</option>
                    <option value="fixed">Monto Fijo ($ COP)</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="adj-op">Operación</Label>
                  <Select
                    id="adj-op"
                    value={operation}
                    onChange={(e) => setOperation(e.target.value as any)}
                  >
                    <option value="increase">Aumentar precio (+)</option>
                    <option value="decrease">Disminuir precio (-)</option>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="adj-val" required>
                  Valor del ajuste ({adjustmentType === 'percentage' ? '%' : '$ COP'})
                </Label>
                <Input
                  id="adj-val"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={batchValue}
                  onChange={(e) => setBatchValue(e.target.value)}
                  placeholder="Ej. 5.0"
                />
                <FieldHint>
                  {adjustmentType === 'percentage'
                    ? `Los precios seleccionados se ${operation === 'increase' ? 'incrementarán' : 'reducirán'} en un ${batchValue || '0'}%.`
                    : `Se ${operation === 'increase' ? 'sumarán' : 'restarán'} $${batchValue || '0'} COP al precio de venta actual.`}
                </FieldHint>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={batchLoading || !batchValue}
                  className="w-full sm:w-auto"
                >
                  {batchLoading ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      Procesando transacción...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Aplicar Ajuste a Catálogo
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toast && <DataToast message={toast.msg} kind={toast.kind} />}
    </div>
  )
}
