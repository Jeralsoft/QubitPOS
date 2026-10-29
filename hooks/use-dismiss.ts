'use client'

import * as React from 'react'

/**
 * Dismiss-on-outside-interaction hook shared by dropdown menus and popovers.
 * Attaches listeners only while `active` is true. When `escape` is enabled the
 * Escape key also dismisses, matching row-action menu behavior.
 */
export function useDismiss<T extends HTMLElement>(
  active: boolean,
  onDismiss: () => void,
  options: { escape?: boolean } = {},
) {
  const { escape = true } = options
  const ref = React.useRef<T>(null)

  React.useEffect(() => {
    if (!active) return
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    document.addEventListener('mousedown', onPointer)
    if (escape) document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      if (escape) document.removeEventListener('keydown', onKey)
    }
  }, [active, onDismiss, escape])

  return ref
}
