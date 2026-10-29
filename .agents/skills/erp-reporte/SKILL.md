---
name: erp-reporte
description: Cómo construir reportes e indicadores de QubitPOS (ventas, inventario, kárdex, cartera y edades, CxP, caja y turnos, bancos, impuestos, libros contables, estados financieros, dashboard) con filtros estándar, cálculo en BD/backend, rendimiento y exportación PDF/Excel/CSV. Usar en la Fase 5 o al añadir cualquier reporte o KPI.
---

# Reportes e indicadores

## Estructura
`backend/src/reportes/definiciones/<nombre>.reporte.ts` implementa:
```ts
interface Reporte {
  codigo: string                 // 'ventas.por_producto'
  permiso: string                // 'reportes.ver' o específico
  filtrosPermitidos: string[]    // fecha_desde, fecha_hasta, sucursal_id, usuario_id, cliente_id, producto_id, estado
  consultar(filtros: FiltrosReporte, sesion: SesionUsuario): Promise<ResultadoReporte> // columnas tipadas + filas + totales
}
```
Las consultas pesadas pueden vivir como funciones o vistas SQL (`fn_reporte_*`, `v_*`). Exportadores (CSV, Excel, PDF) consumen `ResultadoReporte` — el reporte no sabe del formato. Instalar una librería de Excel/PDF solo al implementar ese exportador, justificándolo.

## Reglas
- Fuentes únicas: ventas/compras desde documentos APROBADO/PAGADO/PARCIAL (excluir ANULADO salvo filtro), inventario desde `movimientos_inventario`/`existencias`, cartera desde CxC + aplicaciones a una **fecha de corte**, contabilidad desde `movimientos_contables`, caja desde `movimientos_caja`/`turnos_caja`.
- Siempre filtrado por la empresa de la sesión y las sucursales permitidas del usuario.
- Fechas obligatorias o rango por defecto acotado; paginación en pantalla; exportes grandes en segundo plano con aviso.
- Agregaciones en SQL con parámetros (sin interpolar), sumas NUMERIC devueltas como string; formateo solo en la vista (`formatoCOP`).
- Índices revisados con `EXPLAIN ANALYZE` en reportes pesados (coordinar con `database-postgres`).
- Dashboard: indicadores calculados en backend (servicio de dashboard), cacheados con TTL corto; respetan permisos (un cajero no ve utilidad). Nunca calculados solo en el frontend.
- Cada reporte debe poder conciliarse: p. ej. total ventas del reporte = Σ ingresos contables del periodo; prueba que lo verifique.

## Reportes mínimos
VENTAS: por día, hora, período, producto, categoría, vendedor, cajero, medio de pago, cliente, sucursal · INVENTARIO: existencias, kárdex, valorización, movimientos, bajo mínimo, por vencer · CARTERA: general, vencida, edades, estados de cuenta · CxP: obligaciones, vencimientos, pagos · CAJA: turnos, arqueos, diferencias, informe Z · IMPUESTOS: IVA, INC, retenciones · CONTABILIDAD: libro diario, mayor, balance de prueba, estado de resultados, situación financiera.

