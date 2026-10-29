---
name: erp-movimiento-inventario
description: Cómo registrar entradas, salidas, ajustes, traslados, producción e inventario inicial en Bixaro POS a través de fn_registrar_movimiento_inventario con kárdex, costo configurable (promedio ponderado, FIFO, estándar), lotes FEFO y control de inventario negativo. Usar en compras, ventas, POS, devoluciones, ajustes, traslados, recetas y toma física; nunca actualizar existencias directamente.
---

# Movimiento de inventario

## Contrato (PostgreSQL)
```sql
-- Dentro de la transacción del documento origen. Devuelve el movimiento con su costo calculado.
fn_registrar_movimiento_inventario(
  p_empresa_id      BIGINT,
  p_bodega_id       BIGINT,
  p_producto_id     BIGINT,           -- o variante
  p_tipo            TEXT,             -- ver tipos
  p_cantidad        NUMERIC(18,4),    -- > 0
  p_costo_unitario  NUMERIC(18,6),    -- requerido en entradas; NULL en salidas
  p_documento_tipo  TEXT,
  p_documento_id    BIGINT,
  p_lote_id         BIGINT DEFAULT NULL,
  p_observacion     TEXT DEFAULT NULL
) RETURNS movimientos_inventario

fn_trasladar_inventario(...)          -- salida + entrada enlazadas
fn_disponible(p_bodega_id BIGINT, p_producto_id BIGINT) RETURNS NUMERIC
```
Verifica en `bds/` si ya existen antes de crearlas.

## Algoritmo de la función
1. Validar tipo, cantidad > 0, bodega de la empresa (FK compuesta), producto inventariable (servicios no mueven stock; kits y recetas se expanden a sus componentes).
2. Fila de `existencias` (bodega, producto[, lote]) con `SELECT … FOR UPDATE` (insertarla si no existe).
3. Entrada: recalcular costo según el método de la empresa (promedio: (valor_actual + cant × costo) / (cant_actual + cant)).
   Salida: si `cantidad > disponible` y la empresa no permite negativo → `RAISE EXCEPTION 'STOCK_INSUFICIENTE: …'` con producto, bodega, disponible y solicitado. Costo de salida según el método; con lotes, consumir FEFO.
4. Insertar en `movimientos_inventario` con saldo resultante (cantidad y valor) — inmutable.
5. Actualizar `existencias` (la única escritura permitida, aquí).
6. Devolver el movimiento (su costo alimenta el concepto `costo` del asiento).

## Reglas
- Tipos: INVENTARIO_INICIAL, COMPRA, VENTA, DEVOLUCION_COMPRA, DEVOLUCION_VENTA, AJUSTE_ENTRADA, AJUSTE_SALIDA, TRASLADO_SALIDA, TRASLADO_ENTRADA, PRODUCCION_CONSUMO, PRODUCCION_ENTRADA, MERMA.
- La devolución de venta entra al costo con que salió (del movimiento original), no al promedio actual.
- Traslado: salida + entrada con el mismo costo, enlazadas, misma transacción.
- Ajustes y mermas requieren motivo y permiso (`inventario.editar` / aprobación); la toma física genera ajustes, no sobrescribe.
- Orden de bloqueo consistente (por `producto_id` ascendente) en documentos con varias líneas para evitar deadlocks.
- Método de costo por configuración de empresa; agregar un método nuevo = nueva función de estrategia, sin tocar el flujo general.
- Ventas por peso usan cantidades NUMERIC(18,4); productos con serial mueven cantidad 1 por serial.

## Pruebas
Entrada recalcula promedio; salida usa costo correcto; salida sin stock falla y no deja rastro; traslado deja ambas bodegas correctas; ajuste; devolución con costo original; FEFO por lote; consulta que reconstruye existencias desde movimientos y coincide.
