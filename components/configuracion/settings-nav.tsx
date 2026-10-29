'use client'

import * as React from 'react'
import {
  Building2,
  Image as ImageIcon,
  Phone,
  Globe2,
  Store,
  Calculator,
  Ruler,
  FolderTree,
  Tag,
  Percent,
  ListOrdered,
  Boxes,
  CreditCard,
  ShoppingBag,
  BadgePercent,
  Receipt,
  Hash,
  FileText,
  ScrollText,
  ListChecks,
  Cpu,
  Landmark,
  ShieldCheck,
  KeyRound,
  Lock,
  Bell,
  Mail,
  DatabaseBackup,
  History,
  SlidersHorizontal,
  Palette,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SectionId } from './mock-data'

export interface NavGroup {
  label: string
  items: { id: SectionId; label: string; icon: LucideIcon }[]
}

export const navGroups: NavGroup[] = [
  {
    label: 'General',
    items: [
      { id: 'empresa', label: 'Información de empresa', icon: Building2 },
      { id: 'logo', label: 'Logo', icon: ImageIcon },
      { id: 'contacto', label: 'Datos de contacto', icon: Phone },
      { id: 'regional', label: 'Configuración regional', icon: Globe2 },
    ],
  },
  {
    label: 'Sucursales',
    items: [
      { id: 'sucursales', label: 'Sucursales', icon: Store },
      { id: 'cajas', label: 'Cajas', icon: Calculator },
    ],
  },
  {
    label: 'Inventario',
    items: [
      { id: 'unidades', label: 'Unidades de medida', icon: Ruler },
      { id: 'categorias', label: 'Categorías', icon: FolderTree },
      { id: 'marcas', label: 'Marcas', icon: Tag },
      { id: 'impuestos-inv', label: 'Impuestos', icon: Percent },
      { id: 'listas-precios', label: 'Listas de precios', icon: ListOrdered },
      { id: 'stock', label: 'Configuración de stock', icon: Boxes },
    ],
  },
  {
    label: 'Ventas',
    items: [
      { id: 'metodos-pago', label: 'Métodos de pago', icon: CreditCard },
      { id: 'tipos-venta', label: 'Tipos de venta', icon: ShoppingBag },
      { id: 'descuentos', label: 'Descuentos', icon: BadgePercent },
      { id: 'impuestos-ventas', label: 'Impuestos', icon: Receipt },
      { id: 'consecutivos', label: 'Consecutivos', icon: Hash },
    ],
  },
  {
    label: 'Facturación',
    items: [
      { id: 'prefijos', label: 'Prefijos', icon: FileText },
      { id: 'resoluciones', label: 'Resoluciones', icon: ScrollText },
      { id: 'numeracion', label: 'Numeración', icon: ListChecks },
      { id: 'electronica', label: 'Configuración electrónica', icon: Cpu },
      { id: 'dian', label: 'Datos DIAN', icon: Landmark },
    ],
  },
  {
    label: 'Usuarios',
    items: [
      { id: 'roles', label: 'Roles', icon: ShieldCheck },
      { id: 'permisos', label: 'Permisos', icon: KeyRound },
      { id: 'seguridad', label: 'Seguridad', icon: Lock },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
      { id: 'correo', label: 'Correo', icon: Mail },
      { id: 'respaldo', label: 'Copias de seguridad', icon: DatabaseBackup },
      { id: 'auditoria', label: 'Auditoría', icon: History },
      { id: 'preferencias', label: 'Preferencias', icon: SlidersHorizontal },
      { id: 'apariencia', label: 'Apariencia', icon: Palette },
    ],
  },
]

export const sectionMeta: Record<SectionId, { label: string; group: string }> = navGroups.reduce(
  (acc, g) => {
    g.items.forEach((it) => {
      acc[it.id] = { label: it.label, group: g.label }
    })
    return acc
  },
  {} as Record<SectionId, { label: string; group: string }>,
)

export function SettingsNav({
  active,
  onSelect,
}: {
  active: SectionId
  onSelect: (id: SectionId) => void
}) {
  return (
    <nav aria-label="Secciones de configuración" className="flex flex-col gap-5">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive = active === item.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors [&_svg]:size-4 [&_svg]:shrink-0',
                      isActive
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <Icon
                      className={cn(
                        isActive ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground',
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
