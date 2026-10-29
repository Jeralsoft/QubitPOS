import * as React from 'react'
import { cn } from '@/lib/utils'

interface MainContentProps {
  children: React.ReactNode
  className?: string
  fullHeight?: boolean
}

export function MainContent({ children, className, fullHeight }: MainContentProps) {
  return (
    <main
      className={cn(
        'flex-1 min-h-0',
        fullHeight
          ? 'flex flex-col overflow-hidden p-3 md:p-4'
          : 'overflow-y-auto p-4 md:p-6 lg:p-8',
        className,
      )}
    >
      <div
        className={cn(
          'mx-auto w-full',
          fullHeight
            ? 'flex flex-1 flex-col h-full min-h-0 max-w-[1600px]'
            : 'max-w-[1400px]',
        )}
      >
        {children}
      </div>
    </main>
  )
}
