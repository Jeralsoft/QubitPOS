---
name: erp-asiento-contable
description: Cómo hacer que una operación de negocio de Bixaro POS genere su asiento contable automático vía fn_contabilizar con reglas y cuentas configurables por empresa (sin cuentas quemadas), validando cuadre, periodo abierto y reversión. Usar al implementar ventas, compras, recaudos, pagos, gastos, devoluciones, ajustes de inventario, cierres de caja o tesorería.
---

# Asiento contable automático

## Contrato (PostgreSQL)
```sql
-- Genera y guarda el comprobante dentro de la transacción actual.
-- Lanza excepción si falta configuración, el periodo está cerrado o no cuadra.
fn_contabilizar(
  p_empresa_id      BIGINT,
  p_tipo_operacion  TEXT,     -- 'VENTA_CONTADO', 'COMPRA', ...
  p_documento_tipo  TEXT,     -- 'venta', 'compra', 'turno_caja', ...
  p_documento_id    BIGINT,
  p_conceptos       JSONB,    -- {"subtotal": "100000.00", "iva_19": "19000.00", "costo": "62000.00", "medio_pago:efectivo": "119000.00"}
  p_tercero_id      BIGINT,
  p_fecha           DATE
) RETURNS BIGINT              -- comprobante_contable_id

fn_reversar_comprobante(p_comprobante_id BIGINT, p_motivo TEXT) RETURNS BIGINT
```
El documento entrega **conceptos y valores** (montos como texto NUMERIC); las reglas configuradas (`reglas_contables_detalle`) dicen **qué cuenta y qué naturaleza** usa cada concepto para esa empresa y tipo de operación. Verifica en `bds/` si la función ya existe antes de crearla.

## Pasos para una operación nueva
1. Definir el `tipo_operacion` (fila sembrada en `tipos_operacion`).
2. Hacer que la función de negocio del documento (p. ej. `fn_procesar_venta`) arme el JSONB de conceptos.
3. Sembrar reglas de ejemplo con cuentas del PUC base (editables en Configuración), p. ej. VENTA_CONTADO:
   | concepto | naturaleza | cuenta (ejemplo PUC, configurable) |
   |---|---|---|
   | medio_pago:efectivo | D | Caja |
   | medio_pago:transferencia / nequi / daviplata | D | Bancos |
   | subtotal | C | Ingresos por ventas |
   | iva_* | C | IVA generado por pagar |
   | inc_* | C | Impuesto al consumo por pagar |
   | costo | D | Costo de ventas |
   | costo | C | Inventario de mercancías |
   (crédito: CxC clientes en lugar de caja; compra: inventario/gasto + IVA descontable D, retenciones por pagar C, CxP/caja C; recaudo: caja/banco D, CxC C; pago proveedor: CxP D, caja/banco C; gasto: gasto + IVA D, caja/banco/CxP C; diferencia de caja: faltante/sobrante; devolución: inverso.)
4. Llamar `fn_contabilizar` dentro de la misma transacción del documento, **después** de inventario (para conocer el costo) y de pagos.
5. Guardar en el documento el `comprobante_contable_id`.

## Reglas
- Cero códigos de cuenta en TypeScript ni en funciones SQL. Si una regla o cuenta falta → `RAISE EXCEPTION 'REGLA_CONTABLE_NO_CONFIGURADA: …'` → rollback del documento completo.
- Validar: Σdébitos = Σcréditos (NUMERIC), cuentas activas y de movimiento, tercero cuando la cuenta lo exige, periodo abierto.
- Comprobantes inmutables (trigger de solo inserción); corrección con `fn_reversar_comprobante` (líneas espejo) enlazado al original.
- Antes de la Fase 5 (motor no implementado): `fn_contabilizar` registra en `eventos_contables_pendientes` (tipo, documento, conceptos) para procesarlos al activar el motor. Documentarlo en `docs/ESTADO.md`.

## Prueba por operación
Crear escenario con reglas sembradas → ejecutar la función del documento → afirmar: comprobante existe, cuadra, cada cuenta/tercero/valor esperado, enlace al documento; anular → la reversión cuadra y los saldos de cuenta vuelven a cero; sin regla configurada → excepción y nada guardado.
