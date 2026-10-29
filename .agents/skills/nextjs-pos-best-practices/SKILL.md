---
name: nextjs-pos-best-practices
description: Estándares de arquitectura de interfaz de usuario, velocidad de caja, escáner e impresión térmica en Next.js 16, React 19 y Tailwind v4 para QubitPOS.
---

# Next.js 16 & React 19 POS Frontend Standards

Esta skill rige el desarrollo de la interfaz de usuario en QubitPOS, garantizando velocidad de operación extrema para cajeros, robustez ante caídas de red y experiencia táctil y de teclado de primer nivel.

## 1. Ergonomía del Cajero (Cero Dependencia de Mouse)
- **Modo Escáner Continuo:** El input de búsqueda o código de barras debe capturar el evento `Enter` enviado por pistolas lectoras sin desenfocarse.
- **Atajos de Teclado Globales:**
  - `F1` o `Ctrl + K`: Buscar producto en catálogo completo.
  - `F2`: Asignar / Cambiar Cliente.
  - `F3`: Aplicar descuento porcentual o fijo.
  - `F4` o `Space`: Abrir modal de cobro / finalizar venta.
  - `F8`: Suspender / Retener venta actual (poner en espera).
  - `Esc`: Cancelar acción actual / cerrar modales.
- **Numpad Touch y Físico:** Los campos de cantidad y cobro deben admitir teclado numérico estándar con teclas rápidas (`+1`, `+5`, `Total Exacto`, `Billetes Comunes`).

## 2. Impresión de Tickets Térmicos (ESC/POS y 58mm/80mm)
- **Estilos de Impresión CSS Dedicados:** Usar `@media print` con reseteo de márgenes y ancho fijo:
  ```css
  @media print {
    body * { visibility: hidden; }
    #printable-receipt, #printable-receipt * { visibility: visible; }
    #printable-receipt {
      position: absolute;
      left: 0;
      top: 0;
      width: 80mm; /* o 58mm según configuración de empresa */
      font-family: monospace;
      font-size: 11px;
    }
  }
  ```
- **Formato Ticket Limpio:** Encabezado con datos fiscales (RUT/NIT, Resolución DIAN), detalle condensado (Cant, Descripción, P. Unit, Total), Discriminación de IVA (Tarifas 0%, 5%, 19%), Medios de pago y código QR/CUFE fiscal.

## 3. Estado del Carrito y Rendimiento React 19
- **Actualizaciones Optimistas:** La inserción y suma de ítems en el carrito de venta no debe bloquearse esperando respuestas de red. Se calcula localmente con precisión decimal y se sincroniza en segundo plano.
- **Evitar Re-renders Innecesarios:** Memorizar cálculos pesados de impuestos y descuentos por línea usando `useMemo`.
- **Manejo Seguro de Moneda en Frontend:** Nunca calcular impuestos usando números `float` directos con operadores de división que provoquen decimales periódicos. Centralizar en un helper `formatCurrency()` y calculadora de impuestos tipada.

## 4. Estructura de Componentes en QubitPOS
- Mantener la separación estricta:
  - `components/ventas/`: Componentes específicos del flujo de venta (carrito, grilla de productos, barra de acciones).
  - `components/caja/`: Apertura, arqueo, egresos rápidos y cierre de turno.
  - `components/ui/`: Componentes atómicos reutilizables (Botones, Modales, Inputs, Badges) basados en Radix / Tailwind v4.
  - `hooks/`: Lógica de negocio de cliente (`use-cart.ts`, `use-shortcuts.ts`, `use-barcode-scanner.ts`).
