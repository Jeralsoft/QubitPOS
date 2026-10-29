'use client'

import * as React from 'react'
import { currentSession, type CajaSession } from '@/components/caja/mock-data'

interface POSSessionContextType {
  isRegisterOpen: boolean
  session: CajaSession | null
  openRegister: (openingBalance: number, register?: string, branch?: string) => void
  closeRegister: () => void
}

const POSSessionContext = React.createContext<POSSessionContextType>({
  isRegisterOpen: true,
  session: currentSession,
  openRegister: () => {},
  closeRegister: () => {},
})

export function POSSessionProvider({ children }: { children: React.ReactNode }) {
  const [isRegisterOpen, setIsRegisterOpen] = React.useState<boolean>(true)
  const [session, setSession] = React.useState<CajaSession | null>(currentSession)

  const openRegister = React.useCallback(
    (openingBalance: number, register = 'Caja #001', branch = 'Sede Principal') => {
      const newSession: CajaSession = {
        id: `sess-${Date.now()}`,
        register,
        branch,
        user: 'Laura Martínez',
        openedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        openingBalance,
      }
      setSession(newSession)
      setIsRegisterOpen(true)
    },
    [],
  )

  const closeRegister = React.useCallback(() => {
    setIsRegisterOpen(false)
  }, [])

  return (
    <POSSessionContext.Provider
      value={{
        isRegisterOpen,
        session,
        openRegister,
        closeRegister,
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
