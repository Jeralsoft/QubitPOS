'use client'

import * as React from 'react'
import { currentSession, type CajaSession } from '@/components/caja/mock-data'
import { posApi } from '@/lib/api'

interface POSSessionContextType {
  isRegisterOpen: boolean
  session: CajaSession | null
  isLoadingSession: boolean
  openRegister: (openingBalance: number, register?: string, branch?: string) => Promise<void>
  closeRegister: (countedCash?: number) => Promise<void>
  refreshSession: () => Promise<void>
}

const POSSessionContext = React.createContext<POSSessionContextType>({
  isRegisterOpen: true,
  session: currentSession,
  isLoadingSession: false,
  openRegister: async () => {},
  closeRegister: async () => {},
  refreshSession: async () => {},
})

export function POSSessionProvider({ children }: { children: React.ReactNode }) {
  const [isRegisterOpen, setIsRegisterOpen] = React.useState<boolean>(true)
  const [session, setSession] = React.useState<CajaSession | null>(currentSession)
  const [isLoadingSession, setIsLoadingSession] = React.useState<boolean>(false)

  const refreshSession = React.useCallback(async () => {
    try {
      setIsLoadingSession(true)
      const res = await posApi.getCurrentShift()
      if (res && res.isOpen && res.session) {
        setIsRegisterOpen(true)
        setSession({
          id: String(res.session.id),
          register: res.session.register,
          branch: res.session.branch,
          user: res.session.user,
          openedAt: res.session.openedAt,
          openingBalance: res.session.openingBalance,
        })
      } else if (res && !res.isOpen) {
        setIsRegisterOpen(false)
        setSession(null)
      }
    } catch {
      // Si el backend no está disponible en este instante, conservar el estado actual
    } finally {
      setIsLoadingSession(false)
    }
  }, [])

  React.useEffect(() => {
    refreshSession()
  }, [refreshSession])

  const openRegister = React.useCallback(
    async (openingBalance: number, register = 'Caja #001', branch = 'Sede Principal') => {
      try {
        const res = await posApi.openShift({
          register_name: register,
          branch_name: branch,
          opening_balance: openingBalance,
        })

        if (res?.data) {
          const newSession: CajaSession = {
            id: String(res.data.id),
            register: res.data.register,
            branch: res.data.branch,
            user: res.data.user,
            openedAt: res.data.openedAt,
            openingBalance: res.data.openingBalance,
          }
          setSession(newSession)
          setIsRegisterOpen(true)
          return
        }
      } catch {
        // Fallback local en caso de error o sin conexión
      }

      const fallbackSession: CajaSession = {
        id: `sess-${Date.now()}`,
        register,
        branch,
        user: 'Laura Martínez',
        openedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        openingBalance,
      }
      setSession(fallbackSession)
      setIsRegisterOpen(true)
    },
    [],
  )

  const closeRegister = React.useCallback(
    async (countedCash?: number) => {
      if (session?.id && !session.id.startsWith('sess-')) {
        try {
          await posApi.closeShift(session.id, {
            counted_cash: countedCash ?? session.openingBalance,
          })
        } catch {
          // Fallback silencioso si falla la red
        }
      }
      setIsRegisterOpen(false)
      setSession(null)
    },
    [session],
  )

  return (
    <POSSessionContext.Provider
      value={{
        isRegisterOpen,
        session,
        isLoadingSession,
        openRegister,
        closeRegister,
        refreshSession,
      }}
    >
      {children}
    </POSSessionContext.Provider>
  )
}

export function usePOSSession() {
  const context = React.useContext(POSSessionContext)
  if (!context) {
    throw new Error('usePOSSession debe usarse dentro de un POSSessionProvider')
  }
  return context
}
