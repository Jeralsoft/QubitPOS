'use client'

import * as React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LoginScreen } from '@/components/auth/login-screen'

const STORAGE_KEY = 'qubitpos_session_user'
const ACTIVITY_KEY = 'qubitpos_last_activity'
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000 // 15 minutos de inactividad

export default function Page() {
  const [user, setUser] = React.useState<string | null>(null)
  const [isInitializing, setIsInitializing] = React.useState(true)
  const [sessionNotice, setSessionNotice] = React.useState<string | null>(null)

  // 1. Verificación al cargar o refrescar la página (F5)
  React.useEffect(() => {
    try {
      const savedUser = sessionStorage.getItem(STORAGE_KEY)
      const lastActivity = Number(sessionStorage.getItem(ACTIVITY_KEY)) || 0
      const now = Date.now()

      if (savedUser) {
        if (now - lastActivity > INACTIVITY_TIMEOUT_MS) {
          // Si el tiempo de inactividad expiró antes del refresco
          sessionStorage.removeItem(STORAGE_KEY)
          sessionStorage.removeItem(ACTIVITY_KEY)
          setUser(null)
          setSessionNotice(
            'Tu sesión se cerró automáticamente por inactividad (15 minutos). Por seguridad, ingresa tus credenciales nuevamente.'
          )
        } else {
          // Sesión activa conservada al refrescar la página
          sessionStorage.setItem(ACTIVITY_KEY, now.toString())
          setUser(savedUser)
        }
      }
    } catch {
      // Manejo seguro ante restricciones de almacenamiento en navegadores
    } finally {
      setIsInitializing(false)
    }
  }, [])

  // 2. Monitoreo continuo de actividad del usuario mientras esté dentro del sistema
  React.useEffect(() => {
    if (!user) return

    let lastWrite = Date.now()

    // Registra actividad del usuario (con throttle de 10s para rendimiento)
    const recordActivity = () => {
      const now = Date.now()
      if (now - lastWrite > 10000) {
        lastWrite = now
        try {
          sessionStorage.setItem(ACTIVITY_KEY, now.toString())
        } catch {}
      }
    }

    const checkInactivity = () => {
      try {
        const last = Number(sessionStorage.getItem(ACTIVITY_KEY)) || Date.now()
        if (Date.now() - last >= INACTIVITY_TIMEOUT_MS) {
          sessionStorage.removeItem(STORAGE_KEY)
          sessionStorage.removeItem(ACTIVITY_KEY)
          setUser(null)
          setSessionNotice(
            'Tu sesión se cerró automáticamente por inactividad para proteger la seguridad del terminal.'
          )
        }
      } catch {}
    }

    // Eventos de interacción del usuario (teclado, ratón, scroll, táctil)
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach((ev) => window.addEventListener(ev, recordActivity, { passive: true }))

    // Al regresar a la pestaña o ventana del navegador tras estar inactivo
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkInactivity()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', checkInactivity)

    // Intervalo de comprobación periódica cada 15 segundos
    const timer = setInterval(checkInactivity, 15000)

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, recordActivity))
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', checkInactivity)
      clearInterval(timer)
    }
  }, [user])

  function handleLogin(email: string) {
    try {
      sessionStorage.setItem(STORAGE_KEY, email)
      sessionStorage.setItem(ACTIVITY_KEY, Date.now().toString())
    } catch {}
    setUser(email)
    setSessionNotice(null)
  }

  function handleLogout() {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
      sessionStorage.removeItem(ACTIVITY_KEY)
    } catch {}
    setUser(null)
    setSessionNotice(null)
  }

  if (isInitializing) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground font-mono">Verificando sesión segura…</p>
        </div>
      </main>
    )
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} sessionNotice={sessionNotice} />
  }

  return <DashboardLayout onLogout={handleLogout} />
}
