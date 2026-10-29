'use client'

import * as React from 'react'
import { ChevronDown, X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/jeralpos/brand'
import { navItems, type NavItem } from './nav-config'

interface SidebarProps {
  collapsed: boolean
  activeHref: string
  onNavigate: (href: string) => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function Sidebar({
  collapsed,
  activeHref,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width,transform] duration-200 ease-out',
          collapsed ? 'w-[72px]' : 'w-64',
          // Mobile slide-in
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
        )}
        aria-label="Navegación principal"
      >
        {/* Brand Header */}
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-sidebar-border px-4',
            collapsed ? 'justify-center px-2' : 'justify-between',
          )}
        >
          {collapsed ? (
            <Logo size="sm" showText={false} />
          ) : (
            <Logo size="sm" showText={true} />
          )}
          <button
            type="button"
            onClick={onCloseMobile}
            className="grid size-8 place-items-center rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-foreground lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Section title */}
        {!collapsed && (
          <div className="px-4 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            Menú Principal
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navItems.map((item) => (
            <NavRow
              key={item.href}
              item={item}
              collapsed={collapsed}
              activeHref={activeHref}
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        {/* Footer info */}
        <div
          className={cn(
            'shrink-0 border-t border-sidebar-border p-3 text-xs',
            collapsed ? 'text-center' : 'flex items-center justify-between',
          )}
        >
          {collapsed ? (
            <span className="inline-block size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" title="Online" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-medium text-foreground text-[12px]">QubitPOS ERP</span>
              </div>
              <span className="rounded px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted">
                v2.4
              </span>
            </>
          )}
        </div>
      </aside>
    </>
  )
}

function NavRow({
  item,
  collapsed,
  activeHref,
  onNavigate,
}: {
  item: NavItem
  collapsed: boolean
  activeHref: string
  onNavigate: (href: string) => void
}) {
  const hasChildren = !!item.children?.length
  const isActive =
    activeHref === item.href ||
    (hasChildren && item.children!.some((c) => c.href === activeHref))
  const childActive = hasChildren && item.children!.some((c) => c.href === activeHref)
  const [open, setOpen] = React.useState(childActive)
  const Icon = item.icon

  function handleClick() {
    if (hasChildren && !collapsed) {
      setOpen((o) => !o)
    } else {
      onNavigate(item.href)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        title={collapsed ? item.label : undefined}
        aria-current={activeHref === item.href ? 'page' : undefined}
        aria-expanded={hasChildren && !collapsed ? open : undefined}
        className={cn(
          'group relative flex w-full items-center rounded-lg text-[13px] font-medium transition-all duration-150',
          collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2',
          isActive
            ? 'bg-foreground text-background shadow-xs font-semibold'
            : 'text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-foreground',
        )}
      >
        <Icon className={cn('size-4 shrink-0 transition-transform group-hover:scale-105', isActive && 'text-background')} aria-hidden />
        {!collapsed && <span className="flex-1 truncate text-left">{item.label}</span>}
        {!collapsed && item.badge && (
          <span
            className={cn(
              'grid h-4.5 min-w-4.5 place-items-center rounded-full px-1.5 text-[10px] font-semibold',
              isActive ? 'bg-background/20 text-background' : 'bg-primary/10 text-primary',
            )}
          >
            {item.badge}
          </span>
        )}
        {!collapsed && hasChildren && (
          <ChevronDown
            className={cn(
              'size-3.5 shrink-0 opacity-60 transition-transform duration-200',
              open && 'rotate-180',
            )}
            aria-hidden
          />
        )}
        {/* Collapsed badge dot */}
        {collapsed && item.badge && (
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-sidebar" />
        )}
      </button>

      {/* Submenu */}
      {hasChildren && !collapsed && (
        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-200 ease-out',
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="overflow-hidden">
            <div className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-3 py-0.5">
              {item.children!.map((child) => {
                const active = activeHref === child.href
                return (
                  <button
                    key={child.href}
                    type="button"
                    onClick={() => onNavigate(child.href)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'block w-full truncate rounded-md px-2.5 py-1.5 text-left text-[12.5px] transition-colors',
                      active
                        ? 'bg-primary/10 font-semibold text-primary'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-foreground',
                    )}
                  >
                    {child.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
