'use client'

import * as React from 'react'
import { MoreHorizontal, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDismiss } from '@/hooks/use-dismiss'

export interface RowAction {
  label: string
  icon: LucideIcon
  onClick: () => void
  /** Renders the item in the danger tone. */
  danger?: boolean
  /** Draws a divider above this item. */
  dividerBefore?: boolean
}

/**
 * Kebab-trigger dropdown menu for table row actions. Closes on outside click
 * or Escape. Menu items are data-driven so each module supplies its own labels.
 */
export function RowActionsMenu({
  actions,
  label,
}: {
  actions: RowAction[]
  label: string
}) {
  const [open, setOpen] = React.useState(false)
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false))

  const itemBase =
    'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors [&_svg]:size-4'

  return (
    <div className="relative flex justify-end" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-4"
      >
        <MoreHorizontal />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 z-20 w-48 rounded-lg border border-border bg-card p-1 shadow-lg animate-in fade-in zoom-in-95 duration-100"
        >
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <React.Fragment key={action.label}>
                {action.dividerBefore && <div className="my-1 h-px bg-border" />}
                <button
                  role="menuitem"
                  className={cn(
                    itemBase,
                    action.danger
                      ? 'text-danger hover:bg-danger-muted'
                      : 'text-foreground hover:bg-accent [&_svg]:text-muted-foreground',
                  )}
                  onClick={() => {
                    setOpen(false)
                    action.onClick()
                  }}
                >
                  <Icon />
                  {action.label}
                </button>
              </React.Fragment>
            )
          })}
        </div>
      )}
    </div>
  )
}
