import { ScanBarcode } from 'lucide-react'
import { cn } from '@/lib/utils'

const sizes = {
  sm: { box: 'size-7 rounded-lg [&_svg]:size-3.5', text: 'text-sm font-semibold' },
  md: { box: 'size-9 rounded-xl [&_svg]:size-4.5', text: 'text-base font-semibold' },
  lg: { box: 'size-11 rounded-2xl [&_svg]:size-5.5', text: 'text-xl font-bold' },
}

export function Logo({
  size = 'md',
  showText = true,
  className,
}: {
  size?: keyof typeof sizes
  showText?: boolean
  className?: string
}) {
  const s = sizes[size]
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'grid place-items-center bg-foreground text-background shadow-xs ring-1 ring-border/50',
          s.box,
        )}
        aria-hidden
      >
        <ScanBarcode strokeWidth={2.2} />
      </span>
      {showText && (
        <span className={cn('tracking-tight text-foreground flex items-center gap-1', s.text)}>
          <span>QUBIT</span>
          <span className="text-primary font-bold">POS</span>
          <span className="ml-1 rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider bg-primary/10 text-primary">
            PRO
          </span>
        </span>
      )}
      <span className="sr-only">QUBITPOS</span>
    </span>
  )
}
