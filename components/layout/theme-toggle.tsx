'use client'

import * as React from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/context/theme-context'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn('size-9 rounded-lg border border-transparent', className)} />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'group relative grid size-9 place-items-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground',
        className,
      )}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label="Alternar tema de interfaz"
    >
      {isDark ? (
        <Sun className="size-4.5 transition-transform duration-300 group-hover:rotate-45 text-amber-400" />
      ) : (
        <Moon className="size-4.5 transition-transform duration-300 group-hover:-rotate-12 text-slate-700" />
      )}
    </button>
  )
}
