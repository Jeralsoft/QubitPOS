import { formatCOP } from '@/lib/currency'

export type ProductStatus = 'activo' | 'inactivo'

export interface Product {
  id: string
  code: string
  barcode: string
  name: string
  category: string
  brand: string
  purchasePrice: number
  salePrice: number
  stock: number
  minStock: number
  status: ProductStatus
  color: string
}

export const categories = [
  'Bebidas',
  'Panadería',
  'Lácteos',
  'Abarrotes',
  'Snacks',
  'Limpieza',
] as const

export const brands = [
  'Coca-Cola',
  'Bimbo',
  'Nestlé',
  'La Serenísima',
  'Arcor',
  'Genérico',
] as const

export const units = [
  'Unidad',
  'Kilogramo',
  'Gramo',
  'Litro',
  'Mililitro',
  'Paquete',
  'Caja',
] as const

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
    category: 'Bebidas',
    brand: 'Coca-Cola',
    purchasePrice: 2400,
    salePrice: 3500,
    stock: 148,
    minStock: 40,
    status: 'activo',
    color: palette[0],
  },
  {
    id: '2',
    code: 'PAN-0007',
    barcode: '7702001000029',
    name: 'Pan de caja tajado',
    category: 'Panadería',
    brand: 'Bimbo',
    purchasePrice: 5000,
    salePrice: 7500,
    stock: 32,
    minStock: 15,
    status: 'activo',
    color: palette[3],
  },
  {
    id: '3',
    code: 'LAC-0014',
    barcode: '7702001000036',
    name: 'Leche entera 1L',
    category: 'Lácteos',
    brand: 'Alquería',
    purchasePrice: 3200,
    salePrice: 4800,
    stock: 9,
    minStock: 20,
    status: 'activo',
    color: palette[2],
  },
  {
    id: '4',
    code: 'SNK-0021',
    barcode: '7702001000043',
    name: 'Galletas surtidas 300g',
    category: 'Snacks',
    brand: 'Noel',
    purchasePrice: 2800,
    salePrice: 4200,
    stock: 74,
    minStock: 25,
    status: 'activo',
    color: palette[4],
  },
  {
    id: '5',
    code: 'ABA-0033',
    barcode: '7702001000050',
    name: 'Café molido 250g',
    category: 'Abarrotes',
    brand: 'Juan Valdez',
    purchasePrice: 14000,
    salePrice: 21500,
    stock: 41,
    minStock: 12,
    status: 'activo',
    color: palette[1],
  },
  {
    id: '6',
    code: 'LIM-0040',
    barcode: '7702001000067',
    name: 'Detergente líquido 1L',
    category: 'Limpieza',
    brand: 'LimpiaFácil',
    purchasePrice: 8500,
    salePrice: 13900,
    stock: 0,
    minStock: 10,
    status: 'inactivo',
    color: palette[5],
  },
  {
    id: '7',
    code: 'BEB-0002',
    barcode: '7702001000074',
    name: 'Agua cristalina 1.5L',
    category: 'Bebidas',
    brand: 'Cristal',
    purchasePrice: 1800,
    salePrice: 3000,
    stock: 210,
    minStock: 50,
    status: 'activo',
    color: palette[0],
  },
  {
    id: '8',
    code: 'LAC-0015',
    barcode: '7702001000081',
    name: 'Yogur melocotón 1L',
    category: 'Lácteos',
    brand: 'Colanta',
    purchasePrice: 4500,
    salePrice: 6800,
    stock: 17,
    minStock: 18,
    status: 'inactivo',
    color: palette[2],
  },
]

export function formatCurrency(value: number): string {
  return formatCOP(value)
}

export type StockLevel = 'out' | 'low' | 'ok'

export function stockLevel(product: Pick<Product, 'stock' | 'minStock'>): StockLevel {
  if (product.stock <= 0) return 'out'
  if (product.stock < product.minStock) return 'low'
  return 'ok'
}
