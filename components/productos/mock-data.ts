import { formatCOP } from '@/lib/currency'

export type ProductStatus = 'activo' | 'inactivo' | 'descontinuado' | 'agotado'
export type StockLevel = 'out' | 'low' | 'ok'

export interface Product {
  id: string
  code: string
  barcode: string
  name: string
  description?: string
  category: string
  brand: string
  unit?: string
  purchasePrice: number
  salePrice: number
  wholesalePrice?: number
  taxRate?: number
  stock: number
  minStock: number
  maxStock?: number
  supplier?: string
  location?: string
  allowDecimals?: boolean
  salesCount?: number
  lastRestock?: string
  status: ProductStatus
  color: string
}

export const statusLabel: Record<ProductStatus, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  agotado: 'Agotado',
  descontinuado: 'Descontinuado',
}

export const statusVariant: Record<ProductStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  activo: 'success',
  inactivo: 'neutral',
  agotado: 'danger',
  descontinuado: 'warning',
}

export const categories = [
  'Bebidas',
  'Panadería',
  'Lácteos',
  'Abarrotes',
  'Snacks',
  'Limpieza',
  'Cuidado Personal',
  'Carnicería y Aves',
  'Frutas y Verduras',
] as const

export const brands = [
  'Coca-Cola',
  'Bimbo',
  'Nestlé',
  'Alquería',
  'Colanta',
  'Noel',
  'Juan Valdez',
  'LimpiaFácil',
  'Cristal',
  'Genérico',
] as const

export const units = [
  'Unidad',
  'Kilogramo (kg)',
  'Gramo (g)',
  'Litro (L)',
  'Mililitro (ml)',
  'Paquete',
  'Caja',
  'Six-pack',
] as const

export const suppliersList = [
  'Distribuidora Andina S.A.S.',
  'Comercializadora Nacional S.A.',
  'Lácteos y Derivados del Valle',
  'Alimentos Frescos & Cía',
  'Distribuciones Industriales del Norte',
]

// Deterministic accent colors for product thumbnails
const palette = [
  'oklch(0.62 0.19 27)',
  'oklch(0.65 0.17 145)',
  'oklch(0.63 0.16 250)',
  'oklch(0.7 0.16 60)',
  'oklch(0.6 0.2 320)',
  'oklch(0.66 0.15 190)',
]

export const products: Product[] = [
  {
    id: '1',
    code: 'BEB-0001',
    barcode: '7702001000012',
    name: 'Coca-Cola 600ml',
    description: 'Bebida gaseosa refrescante sabor original 600 ml botella PET.',
    category: 'Bebidas',
    brand: 'Coca-Cola',
    unit: 'Unidad',
    purchasePrice: 2400,
    salePrice: 3500,
    wholesalePrice: 3100,
    taxRate: 19,
    stock: 148,
    minStock: 40,
    maxStock: 300,
    supplier: 'Distribuidora Andina S.A.S.',
    location: 'Nevera 1 - Estante Central',
    allowDecimals: false,
    salesCount: 842,
    lastRestock: '2026-10-24',
    status: 'activo',
    color: palette[0],
  },
  {
    id: '2',
    code: 'PAN-0007',
    barcode: '7702001000029',
    name: 'Pan de caja tajado',
    description: 'Pan blanco tajado suave enriquecido con vitaminas paquete 450g.',
    category: 'Panadería',
    brand: 'Bimbo',
    unit: 'Paquete',
    purchasePrice: 5000,
    salePrice: 7500,
    wholesalePrice: 6800,
    taxRate: 0,
    stock: 32,
    minStock: 15,
    maxStock: 80,
    supplier: 'Comercializadora Nacional S.A.',
    location: 'Estantería Panadería A2',
    allowDecimals: false,
    salesCount: 310,
    lastRestock: '2026-10-28',
    status: 'activo',
    color: palette[3],
  },
  {
    id: '3',
    code: 'LAC-0014',
    barcode: '7702001000036',
    name: 'Leche entera 1L',
    description: 'Leche entera ultrapasteurizada UHT larga vida bolsa 1000ml.',
    category: 'Lácteos',
    brand: 'Alquería',
    unit: 'Unidad',
    purchasePrice: 3200,
    salePrice: 4800,
    wholesalePrice: 4300,
    taxRate: 0,
    stock: 9,
    minStock: 20,
    maxStock: 120,
    supplier: 'Lácteos y Derivados del Valle',
    location: 'Nevera Lácteos - Nivel 2',
    allowDecimals: false,
    salesCount: 520,
    lastRestock: '2026-10-20',
    status: 'activo',
    color: palette[2],
  },
  {
    id: '4',
    code: 'SNK-0021',
    barcode: '7702001000043',
    name: 'Galletas surtidas 300g',
    description: 'Variedad de galletas dulces surtidas ideales para compartir.',
    category: 'Snacks',
    brand: 'Noel',
    unit: 'Paquete',
    purchasePrice: 2800,
    salePrice: 4200,
    wholesalePrice: 3750,
    taxRate: 19,
    stock: 74,
    minStock: 25,
    maxStock: 150,
    supplier: 'Distribuidora Andina S.A.S.',
    location: 'Pasillo 2 - Góndola B',
    allowDecimals: false,
    salesCount: 195,
    lastRestock: '2026-10-25',
    status: 'activo',
    color: palette[4],
  },
  {
    id: '5',
    code: 'ABA-0033',
    barcode: '7702001000050',
    name: 'Café molido 250g',
    description: 'Café 100% colombiano tostado y molido selección especial.',
    category: 'Abarrotes',
    brand: 'Juan Valdez',
    unit: 'Paquete',
    purchasePrice: 14000,
    salePrice: 21500,
    wholesalePrice: 19500,
    taxRate: 5,
    stock: 41,
    minStock: 12,
    maxStock: 90,
    supplier: 'Comercializadora Nacional S.A.',
    location: 'Pasillo 1 - Sección Café',
    allowDecimals: false,
    salesCount: 140,
    lastRestock: '2026-10-22',
    status: 'activo',
    color: palette[1],
  },
  {
    id: '6',
    code: 'LIM-0040',
    barcode: '7702001000067',
    name: 'Detergente líquido 1L',
    description: 'Detergente concentrado aroma floral para ropa blanca y color.',
    category: 'Limpieza',
    brand: 'LimpiaFácil',
    unit: 'Unidad',
    purchasePrice: 8500,
    salePrice: 13900,
    wholesalePrice: 12500,
    taxRate: 19,
    stock: 0,
    minStock: 10,
    maxStock: 60,
    supplier: 'Distribuciones Industriales del Norte',
    location: 'Pasillo 4 - Aseo',
    allowDecimals: false,
    salesCount: 88,
    lastRestock: '2026-10-10',
    status: 'agotado',
    color: palette[5],
  },
  {
    id: '7',
    code: 'BEB-0002',
    barcode: '7702001000074',
    name: 'Agua cristalina 1.5L',
    description: 'Agua pura de manantial sin gas botella 1500 ml.',
    category: 'Bebidas',
    brand: 'Cristal',
    unit: 'Unidad',
    purchasePrice: 1800,
    salePrice: 3000,
    wholesalePrice: 2600,
    taxRate: 0,
    stock: 210,
    minStock: 50,
    maxStock: 400,
    supplier: 'Distribuidora Andina S.A.S.',
    location: 'Nevera 2 - Nivel Inferior',
    allowDecimals: false,
    salesCount: 960,
    lastRestock: '2026-10-26',
    status: 'activo',
    color: palette[0],
  },
  {
    id: '8',
    code: 'LAC-0015',
    barcode: '7702001000081',
    name: 'Yogur melocotón 1L',
    description: 'Yogur con trozos de melocotón natural botella 1000g.',
    category: 'Lácteos',
    brand: 'Colanta',
    unit: 'Unidad',
    purchasePrice: 4500,
    salePrice: 6800,
    wholesalePrice: 6000,
    taxRate: 0,
    stock: 17,
    minStock: 18,
    maxStock: 70,
    supplier: 'Lácteos y Derivados del Valle',
    location: 'Nevera Lácteos - Nivel 3',
    allowDecimals: false,
    salesCount: 220,
    lastRestock: '2026-10-18',
    status: 'activo',
    color: palette[2],
  },
]

export function formatCurrency(value: number): string {
  return formatCOP(value)
}

export function stockLevel(product: Pick<Product, 'stock' | 'minStock'>): StockLevel {
  if (product.stock <= 0) return 'out'
  if (product.stock < product.minStock) return 'low'
  return 'ok'
}

export interface ProductSummary {
  total: number
  active: number
  lowStock: number
  outOfStock: number
  inventoryValue: number
}

export function getProductSummary(items: Product[]): ProductSummary {
  const total = items.length
  const active = items.filter((p) => p.status === 'activo').length
  const lowStock = items.filter((p) => p.stock > 0 && p.stock < p.minStock).length
  const outOfStock = items.filter((p) => p.stock <= 0).length
  const inventoryValue = items.reduce((sum, p) => sum + p.purchasePrice * p.stock, 0)
  return { total, active, lowStock, outOfStock, inventoryValue }
}
