---
name: erp-dinero-impuestos
description: Reglas y piezas centrales para cálculos monetarios de QubitPOS — NUMERIC en PostgreSQL, montos como string en el API, redondeo, función única de cálculo de documentos (subtotal, descuentos, IVA/INC/impuestos saludables/bolsas, retenciones, totales) e impuestos configurables con vigencia para Colombia. Usar en cualquier código que sume, multiplique, redondee o calcule impuestos o descuentos.
---

# Dinero e impuestos (único lugar de cálculo)

## Dónde se calcula
- **La verdad se calcula en PostgreSQL** con `NUMERIC`: `fn_calcular_documento(p_empresa_id BIGINT, p_lineas JSONB, p_descuento_global JSONB, p_contexto JSONB) RETURNS JSONB` — devuelve por línea y totales: bruto, descuento, base, impuestos por tipo/tarifa, retenciones, total. Es la ÚNICA implementación; ventas, compras, POS, facturación y notas la reutilizan (verifica en `bds/` si ya existe).
- `p_contexto`: empresa (responsabilidades, régimen), tercero (régimen, autorretenedor, gran contribuyente…), fecha (para vigencias), sucursal/municipio (ReteICA).
- Política de redondeo configurable por empresa en `empresa_parametros` (por defecto half-up a 2 decimales por línea y total; presentación COP puede ir a 0 decimales o redondeo a la centena).

## Representación
- BD: `NUMERIC(18,2)` dinero, `NUMERIC(18,4)` cantidades (peso/granel), `NUMERIC(18,6)` costos unitarios, `NUMERIC(7,4)` tarifas. Prohibido `REAL`/`DOUBLE PRECISION`.
- API (NestJS) y frontend: strings decimales (`"12500.00"`). `pg` ya entrega NUMERIC como string: no convertirlo a `number`.
- TypeScript no hace aritmética de dinero con `number`. Si el frontend necesita una previsualización (carrito), es solo visual; el backend/BD recalcula. Mostrar con `formatoCOP` de `lib/formato.ts`.

## Reglas
- Prohibido `parseFloat`/`Number()` + `*`/`+` sobre dinero para guardar o decidir, `Math.round` sobre montos, y recalcular totales en otro lugar.
- Orden de cálculo documentado en `docs/CONTABILIDAD.md` (descuento de línea → descuento global prorrateado → base → impuestos → retenciones → total) y probado.
- Impuestos y retenciones desde las tablas `impuestos` / `retenciones` con tarifa o valor fijo, `base_minima`, `vigente_desde`, `vigente_hasta`, configurables por empresa. **Ninguna tarifa ni tope en código**; las semillas son ejemplos editables marcados "verificar con el contador". Valores anuales (UVT, valor de la bolsa) en `parametros_anuales` o tablas con vigencia.
- Diferencias de redondeo entre suma de líneas y total: regla explícita (ajuste a la última línea o cuenta de ajuste al peso), nunca silenciosa.

## Pruebas obligatorias
0.1 + 0.2 exacto, redondeo half-up en bordes (x.xx5), IVA sobre base con descuento, IVA + INC + bolsa en la misma venta, producto exento y excluido, retención bajo y sobre base mínima, vigencia (tarifa distinta según fecha), descuento global prorrateado que cuadra al centavo, producto por peso (cantidad con 3 decimales).

