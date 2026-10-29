import { CreditCard, Banknote, ArrowLeftRight, Wallet, type LucideIcon } from 'lucide-react'
import { products, stockLevel, type Product } from '@/components/productos/mock-data'

export { products, formatCurrency } from '@/components/productos/mock-data'
export type { Product } from '@/components/productos/mock-data'

export function stockLevelLabel(
  product: Pick<Product, 'stock' | 'minStock'>,
): { variant: 'success' | 'warning' | 'danger' } {
  const level = stockLevel(product)
  if (level === 'out') return { variant: 'danger' }
  if (level === 'low') return { variant: 'warning' }
  return { variant: 'success' }
}

// Only sellable products (active + in stock) surface in the POS grid.
export const posProducts: Product[] = products.filter(
  (p) => p.status === 'activo' && p.stock > 0,
)

export const posCategories = Array.from(new Set(posProducts.map((p) => p.category)))

export interface Customer {
  id: string
  name: string
  taxId: string
  phone: string
}

export const FINAL_CONSUMER: Customer = {
  id: 'final',
  name: 'Consumidor final',
  taxId: '222222222222',
  phone: '',
}

export const customers: Customer[] = [
  { id: 'c1', name: 'María Camila Rodríguez', taxId: '1020345678', phone: '310 123 4567' },
  { id: 'c2', name: 'Carlos Andrés Ramírez', taxId: '79845123', phone: '315 876 5432' },
  { id: 'c3', name: 'Distribuidora Andina S.A.S.', taxId: '901458321-4', phone: '601 246 8135' },
  { id: 'c4', name: 'Ana Sofía Martínez', taxId: '52987654', phone: '320 135 7246' },
]

export type PaymentMethodId = 'efectivo' | 'tarjeta' | 'transferencia' | 'otro'

export interface PaymentMethod {
  id: PaymentMethodId
  label: string
  icon: LucideIcon
}

export const paymentMethods: PaymentMethod[] = [
  { id: 'efectivo', label: 'Efectivo', icon: Banknote },
  { id: 'tarjeta', label: 'Datáfono / Tarjeta', icon: CreditCard },
  { id: 'transferencia', label: 'Nequi / Daviplata / Transf.', icon: ArrowLeftRight },
  { id: 'otro', label: 'Crédito / Otro', icon: Wallet },
]

// Tasa de IVA estándar Colombia (19%)
export const TAX_RATE = 0.19

export interface CartItem {
  product: Product
  quantity: number
  discount: number // absolute amount off the line
}

export interface CartTotals {
  subtotal: number
  discount: number
  tax: number
  total: number
}

export function lineSubtotal(item: CartItem): number {
  return item.product.salePrice * item.quantity
}

export function lineTotal(item: CartItem): number {
  return Math.max(0, lineSubtotal(item) - item.discount)
}

export function computeTotals(items: CartItem[]): CartTotals {
  const subtotal = items.reduce((sum, i) => sum + lineSubtotal(i), 0)
  const discount = items.reduce((sum, i) => sum + Math.min(i.discount, lineSubtotal(i)), 0)
  const net = Math.max(0, subtotal - discount)
  const tax = net * TAX_RATE
  return { subtotal, discount, tax, total: net + tax }
}
