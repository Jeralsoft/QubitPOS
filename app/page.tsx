'use client'

import * as React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LoginScreen } from '@/components/auth/login-screen'

export default function Page() {
  const [user, setUser] = React.useState<string | null>(null)

  if (!user) {
    return <LoginScreen onLogin={setUser} />
  }

  return <DashboardLayout onLogout={() => setUser(null)} />
}
