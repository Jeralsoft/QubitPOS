'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'
import { Header, type Crumb } from './header'
import { MainContent } from './main-content'
import { ModulePlaceholder } from './module-placeholder'
import { navItems } from './nav-config'
import { POSSessionProvider } from '@/context/pos-session-context'
import { Dashboard } from '@/components/dashboard/dashboard'
import { Ventas } from '@/components/ventas/ventas'
import { Preparacion } from '@/components/preparacion/preparacion'
import { Caja } from '@/components/caja/caja'
import { Facturacion } from '@/components/facturacion/facturacion'
import { Cobros } from '@/components/cobros/cobros'
import { Proveedores } from '@/components/proveedores/proveedores'
import { Inventarios } from '@/components/inventarios/inventarios'
import { Clientes } from '@/components/clientes/clientes'
import { Empleados } from '@/components/empleados/empleados'
import { Productos } from '@/components/productos/productos'
import { Reportes } from '@/components/reportes/reportes'
import { Usuarios } from '@/components/usuarios/usuarios'
import { Contabilidad } from '@/components/contabilidad/contabilidad'
import { Kiosco } from '@/components/kiosco/kiosco'
import { Nomina } from '@/components/nomina/nomina'
import { Configuracion } from '@/components/configuracion/configuracion'

interface DashboardLayoutProps {
  children?: React.ReactNode
  onLogout?: () => void
}

/**
 * Maps a nav href (including child hrefs, which share the parent module) to the
 * module rendered in the content area. Anything not listed falls back to the
 * placeholder screen for modules that aren't built yet.
 */
const moduleRegistry: Record<string, React.ComponentType> = {
  '/': Dashboard,
  '/ventas': Ventas,
  '/preparacion': Preparacion,
  '/movimientos': Caja,
  '/facturacion': Facturacion,
  '/cobros': Cobros,
  '/proveedores': Proveedores,
  '/inventarios': Inventarios,
  '/clientes': Clientes,
  '/empleados': Empleados,
  '/productos': Productos,
  '/reportes': Reportes,
  '/usuarios': Usuarios,
  '/contabilidad': Contabilidad,
  '/kiosco': Kiosco,
  '/nomina': Nomina,
  '/configuracion': Configuracion,
}

function resolveModule(activeHref: string): React.ComponentType {
  if (moduleRegistry[activeHref]) return moduleRegistry[activeHref]
  // Child routes (e.g. /ventas/nueva) resolve to their parent module.
  const parent = navItems.find((item) =>
    item.children?.some((child) => child.href === activeHref),
  )
  if (parent && moduleRegistry[parent.href]) return moduleRegistry[parent.href]
  return ModulePlaceholder
}

function resolveCrumbs(activeHref: string): Crumb[] {
  const base: Crumb = { label: 'QUBIT POS', href: '/' }
  if (activeHref === '/') return [base, { label: 'Dashboard' }]

  for (const item of navItems) {
    if (item.href === activeHref) return [base, { label: item.label }]
    const child = item.children?.find((c) => c.href === activeHref)
    if (child) return [base, { label: item.label, href: item.href }, { label: child.label }]
  }
  return [base, { label: 'Dashboard' }]
}

export function DashboardLayout({ children, onLogout }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [activeHref, setActiveHref] = React.useState('/')

  const crumbs = resolveCrumbs(activeHref)
  const ActiveModule = resolveModule(activeHref)

  function handleNavigate(href: string) {
    setActiveHref(href)
    setMobileOpen(false)
  }

  function handleToggleSidebar() {
    // On mobile, toggle the drawer; on desktop, collapse/expand.
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileOpen((o) => !o)
    } else {
      setCollapsed((c) => !c)
    }
  }

  return (
    <POSSessionProvider>
      <div className="flex h-svh w-full overflow-hidden bg-background">
        <Sidebar
          collapsed={collapsed}
          activeHref={activeHref}
          onNavigate={handleNavigate}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {/* Content column, offset by sidebar width on desktop */}
        <div
          className={cn(
            'flex min-w-0 flex-1 flex-col transition-[margin] duration-200 ease-out',
            collapsed ? 'lg:ml-[76px]' : 'lg:ml-64',
          )}
        >
          <Header crumbs={crumbs} onToggleSidebar={handleToggleSidebar} cajaOpen onLogout={onLogout} />
          <MainContent>{children ?? <ActiveModule />}</MainContent>
        </div>
      </div>
    </POSSessionProvider>
  )
}
