import { ScanBarcode } from 'lucide-react'
import { cn } from '@/lib/utils'

const sizes = {
  sm: { box: 'size-7 rounded-md [&_svg]:size-4', text: 'text-base' },
  md: { box: 'size-9 rounded-lg [&_svg]:size-5', text: 'text-xl' },
  lg: { box: 'size-12 rounded-xl [&_svg]:size-7', text: 'text-2xl' },
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
          'grid place-items-center bg-gradient-to-br from-electric to-navy text-white shadow-sm',
          s.box,
        )}
        aria-hidden
      >
        <ScanBarcode />
      </span>
      {showText && (
        <span className={cn('font-bold tracking-tight text-foreground', s.text)}>
          QUBIT<span className="text-primary">POS</span>
        </span>
      )}
      <span className="sr-only">QUBITPOS</span>
    </span>
  )
}
