'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

/**
 * Range summary + numbered pager shared by entity list screens.
 * Render only when there is at least one item to page through.
 */
export function Pagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
}: {
  page: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
}) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Mostrando{' '}
        <span className="font-medium text-foreground">
          {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)}
        </span>{' '}
        de <span className="font-medium text-foreground">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          <ChevronLeft />
          Anterior
        </Button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPageChange(i + 1)}
            aria-current={page === i + 1 ? 'page' : undefined}
            className={cn(
              'inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors',
              page === i + 1
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {i + 1}
          </button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Siguiente
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
