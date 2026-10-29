'use client'

import * as React from 'react'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

const THEME_STORAGE_KEY = 'qubitpos_theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>('light')

  // Initialize theme from storage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
      if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
        setThemeState(stored)
      }
    } catch {
      // ignore
    }
  }, [])

  // Apply theme to document
  React.useEffect(() => {
    const root = document.documentElement

    const updateResolved = () => {
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

      const active = isDark ? 'dark' : 'light'
      setResolvedTheme(active)

      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    updateResolved()

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => updateResolved()
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    }
  }, [theme])

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    } catch {
      // ignore
    }
  }, [])

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
