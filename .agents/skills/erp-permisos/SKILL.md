---
name: erp-permisos
description: Multiempresa y autorización de QubitPOS — empresa_id desde la sesión, FKs compuestas por tenant, sucursal activa, roles del sistema y por empresa, permisos modulo.accion, guard @RequierePermiso, ocultar acciones en el frontend y auditoría de cambios de permisos. Usar al crear tablas de negocio, pantallas, endpoints o acciones nuevas que requieran permiso.
---

# Permisos y multiempresa

## Lo que ya existe (bds/database_v1.sql)
- `permisos` (código `modulo.accion`), `roles` (`empresa_id NULL` = rol del sistema), `rol_permisos`, `usuario_roles` (trigger que impide asignar roles de otra empresa), `usuario_sucursales` (trigger que impide sucursales ajenas).
- Acciones estándar por módulo: ver, crear, editar, anular, exportar; especiales: `ventas.descuento_especial`, `ventas.vender_sin_stock`, `caja.abrir`, `caja.cerrar`, `caja.retirar`, `caja.abrir_cajon`, `precios.cambiar`.
- Roles semilla: SUPERADMIN, ADMINISTRADOR, SUPERVISOR, CAJERO, VENDEDOR, MESERO, COCINA, BODEGA, CONTADOR.

## Multiempresa
- `empresa_id` y `usuario_id` salen **siempre de la sesión** (JWT en cookie httpOnly); se ignora cualquier `empresa_id` enviado por el cliente.
- Toda consulta del backend filtra por `empresa_id`; las referencias entre tablas del tenant usan FK compuesta `(x_id, empresa_id)` para que la BD rechace cruces.
- Sucursal activa: elegida en sesión (o header en API) y validada contra `usuario_sucursales`.
- Consultas sin filtro de empresa solo en procesos de plataforma (superadmin) documentados, nunca en controladores de tenant.
- Siguiente endurecimiento recomendado: Row Level Security de PostgreSQL con `current_setting('app.empresa_id')`.

## Al añadir una funcionalidad
1. Registrar los permisos nuevos en la versión SQL del módulo (`INSERT … ON CONFLICT DO NOTHING`).
2. Asignarlos a los roles semilla que correspondan.
3. Backend: `@RequierePermiso('ventas.anular')` en el endpoint; si el permiso depende de la sucursal del documento, verificarlo en el servicio.
4. Frontend: ocultar el botón según la lista de permisos de la sesión (solo UX; el backend igual bloquea).
5. Auditar cambios de roles, permisos y asignaciones (`fn_auditar`).

## Pruebas obligatorias
Usuario sin permiso → 403; usuario con acceso a sucursal A no actúa en sucursal B; usuario de empresa A obtiene 404 sobre IDs de empresa B (API); `empresa_id` enviado en el payload se ignora; rol de otra empresa no se puede asignar (trigger).

