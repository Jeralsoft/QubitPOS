import { cn } from '@/lib/utils'

/**
 * Square initials avatar used across entity tables (clientes, proveedores,
 * empleados, productos). Defaults to the size-9 table variant; pass a size
 * utility via className to override (e.g. `size-10`).
 */
export function EntityAvatar({
  initials,
  color,
  className,
}: {
  initials: string
  color?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white shadow-xs',
        className,
      )}
      style={color ? { backgroundColor: color } : undefined}
      aria-hidden
    >
      {initials}
    </div>
  )
}
