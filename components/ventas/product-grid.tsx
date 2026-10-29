'use client'

import * as React from 'react'
import { Search, Package, Plus, Barcode } from 'lucide-react'
import { Input } from '@/components/jeralpos/input'
import { Badge } from '@/components/jeralpos/badge'
import { cn } from '@/lib/utils'
import {
  posProducts,
  posCategories,
  formatCurrency,
  stockLevelLabel,
  type Product,
} from './mock-data'

interface ProductGridProps {
  onAdd: (product: Product) => void
  searchInputRef?: React.RefObject<HTMLInputElement | null>
}

export function ProductGrid({ onAdd, searchInputRef }: ProductGridProps) {
  const [query, setQuery] = React.useState('')
  const [category, setCategory] = React.useState<string | null>(null)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return posProducts.filter((p) => {
      const matchesCategory = !category || p.category === category
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.barcode.includes(q)
      return matchesCategory && matchesQuery
    })
  }, [query, category])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = query.trim().toLowerCase()
      if (!q) return

      // Búsqueda directa por código de barras exacto o código de producto
      const exactMatch = posProducts.find(
        (p) => p.barcode === q || p.code.toLowerCase() === q
      )
      if (exactMatch) {
        e.preventDefault()
        onAdd(exactMatch)
        setQuery('')
        return
      }

      // Si hay un único resultado filtrado, agregarlo inmediatamente
      if (filtered.length === 1) {
        e.preventDefault()
        onAdd(filtered[0])
        setQuery('')
        return
      }
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Search and Category Filter */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Input
            ref={searchInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por nombre o escanear código (F2)..."
            leadingIcon={<Barcode className="size-4.5 text-muted-foreground/80" />}
            data-barcode-receiver="true"
            className="h-11 rounded-2xl pr-14 text-xs shadow-2xs focus-visible:ring-1"
            aria-label="Buscar producto o escanear código de barras"
          />
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <kbd className="rounded-md border border-border/80 bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
              F2
            </kbd>
          </div>
        </div>

        {/* Minimalist category pills */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por categoría">
          <CategoryChip active={!category} onClick={() => setCategory(null)}>
            Todos los artículos
          </CategoryChip>
          {posCategories.map((c) => (
            <CategoryChip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </CategoryChip>
          ))}
        </div>
      </div>

      {/* Grid of products */}
      {filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground/70">
            <Package className="size-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-foreground">Sin resultados</p>
            <p className="text-xs text-muted-foreground">
              No se encontraron productos coincidentes en el inventario.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid flex-1 auto-rows-max grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))] gap-3 overflow-y-auto pb-2">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={onAdd} />
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-8 rounded-full border px-3 text-xs font-medium transition-all duration-150 select-none',
        active
          ? 'border-transparent bg-foreground text-background shadow-xs font-semibold'
          : 'border-border/70 bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  const level = stockLevelLabel(product)

  return (
    <button
      type="button"
      onClick={() => onAdd(product)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/75 bg-card text-left shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 active:translate-y-0"
    >
      {/* Minimal subtle header container */}
      <div className="relative flex h-24 items-center justify-center border-b border-border/40 bg-gradient-to-b from-muted/30 to-muted/10 p-3">
        <span className="grid size-11 place-items-center rounded-xl bg-card border border-border/60 text-foreground/75 shadow-2xs transition-transform duration-200 group-hover:scale-105">
          <Package className="size-5" />
        </span>
        {/* Subtle stock indicator */}
        <div className="absolute right-2 top-2">
          <Badge variant={level.variant} size="sm" dot>
            {product.stock}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <p className="line-clamp-2 text-xs font-semibold leading-snug text-foreground">
          {product.name}
        </p>
        <p className="font-mono text-[10px] text-muted-foreground/70 uppercase tracking-wider">
          {product.code}
        </p>

        <div className="mt-auto flex items-baseline justify-between pt-2">
          <span className="text-sm font-bold tabular-nums tracking-tight text-foreground">
            {formatCurrency(product.salePrice)}
          </span>
          <span className="text-[10px] text-muted-foreground/70">COP</span>
        </div>
      </div>

      {/* Hover action indicator */}
      <span
        className="pointer-events-none absolute right-2.5 bottom-2.5 flex size-6 items-center justify-center rounded-lg bg-foreground text-background opacity-0 shadow-xs transition-all duration-150 group-hover:opacity-100"
        aria-hidden
      >
        <Plus className="size-3.5" />
      </span>
    </button>
  )
}
