'use client'

import * as React from 'react'

interface BarcodeScannerOptions {
  /** Función que se ejecuta cuando se detecta un código de barras completo terminado en Enter */
  onScan: (barcode: string) => void
  /** Longitud mínima del código de barras (por defecto 3 caracteres) */
  minLength?: number
  /** Tiempo máximo en milisegundos entre pulsaciones para considerarse pistola lectora (por defecto 50ms) */
  maxLatency?: number
  /** Si debe ignorar o no cuando el usuario está escribiendo manualmente en un input normal */
  ignoreInputs?: boolean
}

/**
 * Hook de captura continua de pistola de código de barras (Hardware HID).
 * Los lectores de código de barras emulan un teclado ingresando caracteres
 * a velocidad sobrehumana (< 40ms por tecla) y enviando 'Enter' al final.
 */
export function useBarcodeScanner({
  onScan,
  minLength = 3,
  maxLatency = 50,
  ignoreInputs = true,
}: BarcodeScannerOptions) {
  const bufferRef = React.useRef<string>('')
  const lastTimeRef = React.useRef<number>(0)

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)

      // Si el input está explícitamente marcado como receptor de escáner, se procesa siempre
      const isDedicatedReceiver = target?.getAttribute('data-barcode-receiver') === 'true'

      const now = Date.now()
      const timeDiff = now - lastTimeRef.current
      lastTimeRef.current = now

      // Si el tiempo entre teclas supera el umbral, reiniciamos el búfer
      if (timeDiff > maxLatency && bufferRef.current.length > 0) {
        bufferRef.current = ''
      }

      if (event.key === 'Enter') {
        const barcode = bufferRef.current.trim()
        if (barcode.length >= minLength) {
          event.preventDefault()
          event.stopPropagation()
          onScan(barcode)
          bufferRef.current = ''
          return
        }
        bufferRef.current = ''
        return
      }

      // Filtrar teclas modificadoras o de función
      if (event.key.length !== 1 || event.ctrlKey || event.altKey || event.metaKey) {
        return
      }

      // Si es un input normal y el usuario está escribiendo manualmente (cadencia lenta), no interceptar
      if (isInput && !isDedicatedReceiver && timeDiff > maxLatency) {
        bufferRef.current = ''
        return
      }

      bufferRef.current += event.key
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [onScan, minLength, maxLatency, ignoreInputs])
}
