'use client'

import * as React from 'react'

export interface POSShortcutsHandlers {
  /** F1: Enfocar campo de búsqueda de productos */
  onFocusSearch?: () => void
  /** F2: Abrir selector de clientes */
  onSelectCustomer?: () => void
  /** F4: Abrir modal de cobro / finalizar venta */
  onCharge?: () => void
  /** F8: Poner venta en espera / guardar borrador */
  onHoldSale?: () => void
  /** Esc: Cancelar acción actual / cerrar modales / vaciar */
  onCancel?: () => void
}

/**
 * Hook para atajos de teclado globales en el Punto de Venta (POS).
 * Permite al cajero operar completamente sin necesidad de tocar el ratón.
 */
export function usePOSShortcuts({
  onFocusSearch,
  onSelectCustomer,
  onCharge,
  onHoldSale,
  onCancel,
}: POSShortcutsHandlers) {
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // F1: Buscar producto
      if (event.key === 'F1') {
        event.preventDefault()
        onFocusSearch?.()
        return
      }

      // F2: Seleccionar cliente
      if (event.key === 'F2') {
        event.preventDefault()
        onSelectCustomer?.()
        return
      }

      // F4: Cobrar venta
      if (event.key === 'F4') {
        event.preventDefault()
        onCharge?.()
        return
      }

      // F8: Poner venta en espera
      if (event.key === 'F8') {
        event.preventDefault()
        onHoldSale?.()
        return
      }

      // Escape: Cancelar / Cerrar
      if (event.key === 'Escape') {
        onCancel?.()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onFocusSearch, onSelectCustomer, onCharge, onHoldSale, onCancel])
}
