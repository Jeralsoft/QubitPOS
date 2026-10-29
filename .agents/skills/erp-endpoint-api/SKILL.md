---
name: erp-endpoint-api
description: Convenciones para endpoints REST del backend NestJS de QubitPOS — prefijo /api/v1, DTOs con class-validator, guards de sesión y permisos, alcance por empresa, paginación, filtros, ordenamiento, formato uniforme de errores. Usar al crear o modificar cualquier endpoint o controlador.
---

# Endpoint API v1 (NestJS)

## Rutas
Un módulo Nest por dominio en `backend/src/<modulo>/` (`<modulo>.module.ts`, `<modulo>.controller.ts`, `<modulo>.service.ts`, `dto/`). Prefijo global `/api/v1`. Recursos en español, plural y kebab-case, alineados con `lib/modulos.ts`: `/productos`, `/clientes`, `/ventas`, `/compras`, `/inventario`, `/cartera`, `/cuentas-por-pagar`, `/caja/turnos`, `/contabilidad`, `/reportes`. Acciones de estado como subrecursos: `POST /api/v1/ventas/:id/aprobar`, `POST /api/v1/ventas/:id/anular` (no `DELETE` para documentos financieros).

## Controlador
```ts
@Post()
@RequierePermiso('ventas.crear')
crear(@Body() dto: CrearVentaDto, @Sesion() sesion: SesionUsuario) {
  return this.ventas.crear(dto, sesion)
}
```
- Sesión JWT en cookie httpOnly (guard global); `@RequierePermiso('modulo.accion')` valida contra `rol_permisos`.
- DTO con `class-validator` y `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`: obligatorios, formatos, montos como string decimal (`@Matches(/^\d+(\.\d{1,2})?$/)`), fechas ISO. Mensajes en español.
- **`empresa_id` siempre sale de la sesión**, nunca del body ni de la URL. Toda consulta filtra por él; un ID de otra empresa responde 404.
- El servicio usa `DatabaseService.query()` / `withTransaction()` con parámetros (`$1, $2…`), nunca interpolación. La lógica de negocio crítica está en funciones SQL; el servicio solo las llama.
- Respuesta: montos como string decimal; no exponer columnas internas (hashes, claves técnicas).

## Listados
`?pagina=&por_pagina=` (máx. 100), `?estado=APROBADO&fecha_desde=&fecha_hasta=`, `?orden=-fecha,numero` con lista blanca de columnas. Respuesta: `{ datos: [...], meta: { pagina, por_pagina, total } }`.

## Errores (filtro de excepciones global)
```json
{ "error": { "codigo": "STOCK_INSUFICIENTE", "mensaje": "No hay existencias suficientes de 'Arroz 500 g' en Bodega Principal.", "detalles": {}, "referencia": "f3a1c2" } }
```
- 400/422 validación (`VALIDACION`, `detalles` por campo), 401, 403 (`SIN_PERMISO`), 404, 409 (`TRANSICION_INVALIDA`, conflictos), 500 con mensaje genérico + `referencia` que aparece en el log.
- Las excepciones de PostgreSQL con prefijo de código (`RAISE EXCEPTION 'STOCK_INSUFICIENTE: …'`) se traducen a errores de negocio 409/422. Nunca devolver stack trace ni SQL.

## Pruebas API
200/201 feliz, 422 validación, 403 sin permiso, 404 al pedir recurso de otra empresa, `empresa_id` en el body ignorado, paginación/filtros, formato de error. Documentar el endpoint en `docs/API.md`.

