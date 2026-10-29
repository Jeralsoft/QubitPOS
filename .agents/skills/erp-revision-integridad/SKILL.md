---
name: erp-revision-integridad
description: Revisión obligatoria antes de cerrar un ciclo o fase de QubitPOS — verifica la cadena de integridad (POS/ventas, inventario, caja/bancos, cartera, CxP, contabilidad), reglas de dinero, estados, multiempresa, seguridad, pruebas y no regresión. Usar al terminar una fase, antes de un commit importante o cuando el usuario pida revisar el trabajo.
---

# Revisión de integridad

Revisa el diff/archivos de la fase (no todo el repo) y responde cada punto con ✅, ❌ (archivo:línea + corrección) o **NO VERIFICADO**.

## Integridad funcional
- [ ] Cada operación económica nueva recorre su cadena completa: VENTA→inventario→caja/banco→cartera→contabilidad; COMPRA→inventario→CxP→caja/banco→contabilidad; PAGO CLIENTE→cartera→caja/banco→contabilidad; PAGO PROVEEDOR→CxP→caja/banco→contabilidad; DEVOLUCIÓN→inventario→caja/cartera→contabilidad; CIERRE DE TURNO→diferencia→contabilidad.
- [ ] Todo dentro de una transacción (función SQL llamada en `withTransaction()`); existe prueba de rollback.
- [ ] Ningún módulo escribe tablas de otro módulo directamente (solo vía sus funciones `fn_*`).

## Reglas duras
- [ ] Sin `REAL`/`DOUBLE PRECISION` en `bds/`; sin aritmética de dinero con `number` en TypeScript (`Grep` de `parseFloat`, `Number(`, `Math.round` sobre montos en `backend/src` y `lib/`).
- [ ] Cálculos de impuestos/descuentos/totales solo en `fn_calcular_documento`.
- [ ] Sin códigos de cuenta contable en código (`Grep` de patrones tipo `'1105`, `'4135`, `'2408`).
- [ ] Existencias solo modificadas por `fn_registrar_movimiento_inventario`.
- [ ] Sin `DELETE` sobre documentos/movimientos financieros (triggers de bloqueo presentes); anulación por reversión.
- [ ] Transiciones de estado controladas en BD.
- [ ] Ninguna tarifa, tope ni valor anual (SMMLV, UVT, bolsa) quemado en código.

## Seguridad y multiempresa
- [ ] Tablas nuevas con `empresa_id`, FKs compuestas por tenant y únicos por empresa.
- [ ] `empresa_id` tomado de la sesión; permisos sembrados y `@RequierePermiso` en endpoints; pruebas 403 y aislamiento entre empresas.
- [ ] Auditoría (`fn_auditar`) en operaciones importantes; sin datos sensibles en logs ni en la bitácora.
- [ ] Consultas parametrizadas; errores con código y mensaje amigable, sin filtrar SQL/stack.

## Calidad
- [ ] `pnpm test` del backend ejecutado: pegar resumen real.
- [ ] `pnpm typecheck` y `pnpm build` del frontend sin errores (si hubo frontend).
- [ ] `lib/modulos.ts` y la tabla `modulos` siguen alineados.
- [ ] Dependencias nuevas justificadas.
- [ ] Documentación del módulo, `docs/CHANGELOG.md` y `docs/ESTADO.md` actualizados.

Pregunta final: *¿Esto mantiene la integridad entre POS, ventas, inventario, caja, cartera, cuentas por pagar y contabilidad?* Si la respuesta es no, la fase NO se cierra: detener y rediseñar con `orchestrator`.

