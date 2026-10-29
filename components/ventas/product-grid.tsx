'use client'

import * as React from 'react'
import { Search, Package, Plus } from 'lucide-react'
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
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Input
            ref={searchInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por nombre o escanear código de barras..."
            leadingIcon={<Search />}
            data-barcode-receiver="true"
            className="h-12 pr-14 text-base"
            aria-label="Buscar producto o escanear código de barras"
          />
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <kbd className="rounded border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground shadow-xs">
              F1
            </kbd>
          </div>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
          <CategoryChip active={!category} onClick={() => setCategory(null)}>
            Todas
          </CategoryChip>
          {posCategories.map((c) => (
            <CategoryChip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </CategoryChip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Package className="size-6" />
          </div>
          <div>
            <p className="font-medium">Sin resultados</p>
            <p className="text-sm text-muted-foreground">
              No se encontraron productos para tu búsqueda.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid flex-1 auto-rows-max grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3 overflow-y-auto pb-2">
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
        'h-9 rounded-full border px-4 text-sm font-medium transition-colors duration-150',
        active
          ? 'border-transparent bg-primary text-primary-foreground shadow-xs'
          : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground',
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
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35 active:translate-y-0"
    >
      <div
        className="flex h-20 items-center justify-center"
        style={{ backgroundColor: product.color }}
        aria-hidden
      >
        <Package className="size-7 text-white/85" />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-medium leading-snug">{product.name}</p>
        <p className="font-mono text-[11px] text-muted-foreground">{product.code}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <span className="text-base font-semibold tabular-nums">
            {formatCurrency(product.salePrice)}
          </span>
          <Badge variant={level.variant} size="sm">
            {product.stock}
          </Badge>
        </div>
      </div>
      <span
        className="pointer-events-none absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100"
        aria-hidden
      >
        <Plus className="size-4" />
      </span>
    </button>
  )
}
