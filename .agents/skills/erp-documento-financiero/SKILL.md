---
name: erp-documento-financiero
description: Patrón para documentos financieros de QubitPOS (ventas, compras, facturas, notas, recaudos, pagos, gastos, ajustes, traslados, turnos de caja): máquina de estados, numeración con fn_siguiente_consecutivo, transacción atómica en una función SQL, anulación por reversión y auditoría. Usar al crear o modificar cualquier documento con efecto económico.
---

# Documento financiero

## Estados
BORRADOR, PENDIENTE, APROBADO, PARCIAL, PAGADO, ANULADO, CANCELADO — columna `estado TEXT` con `CHECK`.
Cada documento declara sus transiciones permitidas, por ejemplo venta:
```
BORRADOR  → PENDIENTE | APROBADO | CANCELADO
PENDIENTE → APROBADO | CANCELADO
APROBADO  → PARCIAL | PAGADO | ANULADO        (crédito: según pagos)
PARCIAL   → PAGADO | ANULADO (si no hay pagos aplicados o se revierten primero)
PAGADO / ANULADO / CANCELADO → (final)
```
Las transiciones se validan en BD (trigger `BEFORE UPDATE OF estado` o función `fn_transicionar_<documento>`) y lanzan `TRANSICION_INVALIDA`. La transición la decide la función de negocio, nunca un campo enviado por el cliente.

## Reglas
1. **Nunca DELETE** sobre documentos con efecto económico (trigger que lo bloquea). BORRADOR puede CANCELARSE; aprobado se ANULA.
2. **Numeración** al aprobar, no al crear borrador: `fn_siguiente_consecutivo(resolucion_id)` (bloqueo `FOR UPDATE`) dentro de la misma transacción. Valida rango y vigencia.
3. **Atomicidad**: aprobar/anular = una función SQL (`fn_procesar_<documento>`, `fn_anular_<documento>`) que incluye todos los efectos (inventario, caja/banco, cartera/CxP, asiento, auditoría). Bloquear el documento con `SELECT … FOR UPDATE` para evitar doble aprobación. El backend la llama dentro de `withTransaction()` tras fijar `SET LOCAL app.usuario_id`.
4. **Anulación** = efectos inversos enlazados: movimientos de inventario inversos, reversión de caja/banco, anulación de CxC/CxP (si no hay pagos aplicados; si los hay, exigir revertirlos o generar nota), comprobante contable de reversión. Requiere permiso `modulo.anular`, motivo y periodo contable abierto.
5. **Edición**: solo en BORRADOR. Después, correcciones con notas o ajustes.
6. **Totales** recalculados en BD con `fn_calcular_documento` al guardar y al aprobar.
7. **Auditoría**: trigger `fn_auditar` en la tabla + registro explícito de aprobar/anular/cancelar con motivo.
8. Columnas obligatorias: `id`, `empresa_id`, `sucursal_id`, `prefijo`, `numero`, `fecha`, `estado`, `creado_por`, `aprobado_por`, `anulado_por`, `anulado_en`, `motivo_anulacion`, `creado_en`, `actualizado_en`; `UNIQUE (empresa_id, prefijo, numero)`.

## Pruebas mínimas
Transición válida, transición inválida, doble aprobación concurrente (una falla), anulación revierte todos los efectos y el asiento de reversión cuadra, fallo intermedio → rollback total (nada parcial en BD).

