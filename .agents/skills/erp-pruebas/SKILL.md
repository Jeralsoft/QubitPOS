---
name: erp-pruebas
description: Cómo escribir y ejecutar las pruebas de QubitPOS (funciones SQL, servicios y API NestJS con vitest, build del frontend) con base PostgreSQL de pruebas, escenario base reutilizable y verificación de efectos encadenados (inventario, caja, cartera, contabilidad, auditoría). Usar al terminar cada ciclo, antes de declarar algo terminado y para no regresión.
---

# Pruebas de QubitPOS

## Configuración
- Base `qubitpos_test` en PostgreSQL 18 (mismo motor que producción, nunca SQLite), creada aplicando `bds/database_v1.sql … vN.sql` en orden. `backend/.env.test` con su `DATABASE_URL`. Nunca apuntar pruebas a `qubitpos` ni a otra base con datos.
- Cada prueba corre dentro de una transacción con `ROLLBACK` al final (o recrea la base en `globalSetup`).
- `backend/test/escenario-base.ts`: crea empresa (con giro), sucursal, bodega, caja, usuarios por rol, clientes, productos con IVA/INC, existencias iniciales, numeración, turno abierto y reglas contables de ejemplo. Reutilizar en lugar de duplicar setup.
- Helpers de aserción: `esperarAsientoCuadra(comprobanteId)`, `esperarExistencia(productoId, bodegaId, '10.0000')`, `esperarSaldoCartera(cxcId, '50000.00')`, `esperarAuditado('ventas', id, 'UPDATE')`.
- Pruebas puramente SQL (funciones y triggers): scripts en `bds/pruebas/*.sql` ejecutados con `psql -v ON_ERROR_STOP=1` dentro de `BEGIN … ROLLBACK`.

## Qué probar en cada caso de uso
1. Camino feliz con TODOS los efectos encadenados.
2. Validación (422), permisos (403) y aislamiento multiempresa (404).
3. Transiciones de estado inválidas.
4. Rollback: forzar fallo en un paso intermedio (p. ej. regla contable faltante) y afirmar que no quedó documento, movimiento ni saldo parcial.
5. Montos exactos como strings (`'119000.00'`), nunca comparaciones con `number`.

## Casos críticos (lista acumulativa)
VENTA: contado · crédito · con descuento · con impuesto · múltiples pagos · sin stock · anulada · devolución
CAJA: apertura · cierre con sobrante · cierre con faltante
CARTERA: crear crédito · abono parcial · pago completo · vencimiento · cartera vencida
CONTABILIDAD: venta · compra · pago cliente · pago proveedor · gasto · devolución
INVENTARIO: entrada · salida · traslado · ajuste

## Ejecución y reporte
- Backend: `pnpm test` (vitest) en `backend/`; un módulo: `pnpm test <modulo>`.
- Frontend: `pnpm typecheck` y `pnpm build` en la raíz.
- Reportar la salida real (pruebas, fallos). Si no se pudieron ejecutar: **NO VERIFICADO** y por qué.
- Si una prueba antigua falla tras un cambio, es regresión: arreglar el código, no la prueba (salvo que el requisito cambió y el usuario lo confirmó).


