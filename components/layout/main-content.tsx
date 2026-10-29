import * as React from 'react'
import { cn } from '@/lib/utils'

interface MainContentProps {
  children: React.ReactNode
  className?: string
}

export function MainContent({ children, className }: MainContentProps) {
  return (
    <main className={cn('flex-1 overflow-y-auto p-4 md:p-6 lg:p-8', className)}>
      <div className="mx-auto w-full max-w-[1400px]">{children}</div>
    </main>
  )
}
