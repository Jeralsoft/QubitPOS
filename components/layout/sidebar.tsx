'use client'

import * as React from 'react'
import { ChevronDown, X } from 'lucide-react'
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
          className="fixed inset-0 z-40 bg-navy/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-[width,transform] duration-200 ease-out',
          collapsed ? 'w-[76px]' : 'w-64',
          // Mobile slide-in
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
        )}
        aria-label="Navegación principal"
      >
        {/* Brand */}
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-sidebar-border',
            collapsed ? 'justify-center px-2' : 'justify-between px-4',
          )}
        >
          {collapsed ? (
            <Logo size="sm" showText={false} />
          ) : (
            <span className="inline-flex items-center gap-2.5">
              <Logo size="sm" showText={false} />
              <span className="text-lg font-bold tracking-tight text-white">
                QUBIT<span className="text-primary">POS</span>
              </span>
            </span>
          )}
          <button
            type="button"
            onClick={onCloseMobile}
            className="grid size-8 place-items-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
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

        {/* Footer version */}
        <div
          className={cn(
            'shrink-0 border-t border-sidebar-border px-4 py-3 text-xs text-sidebar-foreground/50',
            collapsed && 'text-center',
          )}
        >
          {collapsed ? 'v2.4' : 'JERALPOS · v2.4.0'}
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
          'group relative flex w-full items-center rounded-lg text-sm font-medium transition-colors duration-150',
          collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
          isActive
            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-xs'
            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        )}
      >
        {/* Active indicator bar */}
        {isActive && !collapsed && (
          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-white/90" />
        )}
        <Icon className="size-5 shrink-0" aria-hidden />
        {!collapsed && <span className="flex-1 truncate text-left">{item.label}</span>}
        {!collapsed && item.badge && (
          <span
            className={cn(
              'grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold',
              isActive ? 'bg-white/25 text-white' : 'bg-primary text-primary-foreground',
            )}
          >
            {item.badge}
          </span>
        )}
        {!collapsed && hasChildren && (
          <ChevronDown
            className={cn(
              'size-4 shrink-0 transition-transform duration-200',
              open && 'rotate-180',
            )}
            aria-hidden
          />
        )}
        {/* Collapsed badge dot */}
        {collapsed && item.badge && (
          <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-sidebar" />
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
            <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3 py-0.5">
              {item.children!.map((child) => {
                const active = activeHref === child.href
                return (
                  <button
                    key={child.href}
                    type="button"
                    onClick={() => onNavigate(child.href)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'block w-full truncate rounded-md px-3 py-2 text-left text-[13px] transition-colors',
                      active
                        ? 'bg-sidebar-accent font-medium text-white'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-white',
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
