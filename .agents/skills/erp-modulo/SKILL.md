---
name: erp-modulo
description: Crea o extiende un módulo de QubitPOS de punta a punta (funciones SQL en bds/, módulo NestJS en backend/src/<modulo>, pantallas en app/(sistema)/<modulo>, entrada en lib/modulos.ts, pruebas). Usar al iniciar un módulo nuevo (Productos, Inventario, Caja, Ventas, Cobros, etc.) o al añadir un caso de uso a uno existente.
---

# Módulo de QubitPOS

## 1. Verificar
- `Glob backend/src/<modulo>/**`, `app/(sistema)/<modulo>/**` y `Grep` en `bds/` — si existe, extiende; no lo recrees.
- Lee `docs/ANALISIS_MODULOS.md` (sección del módulo) y `docs/modulos/<modulo>.md` si existe.
- Confirma el `id` del módulo en `lib/modulos.ts` y en la tabla `modulos`: deben coincidir.

## 2. Estructura
```
bds/database_vN.sql                       # tablas + funciones fn_* del módulo (skill erp-migracion)
backend/src/<modulo>/
  <modulo>.module.ts
  <modulo>.controller.ts                  # delgado: DTO + permiso + llamada al servicio
  <modulo>.service.ts                     # consultas parametrizadas y llamadas a fn_*
  dto/                                    # class-validator
  <modulo>.service.spec.ts                # pruebas (vitest)
app/(sistema)/<modulo>/page.tsx           # reemplaza la página genérica [modulo]
app/(sistema)/<modulo>/<opcion>/page.tsx
components/<modulo>/                      # componentes de la pantalla
lib/<modulo>.ts                           # cliente del API (apiFetch) y tipos
```
Registrar el módulo Nest en `app.module.ts` (solo si no está).

## 3. Patrón de un caso de uso
```ts
// <modulo>.service.ts
async aprobar(id: string, sesion: SesionUsuario) {
  return this.db.withTransaction(async (cliente) => {
    await cliente.query(`SELECT set_config('app.usuario_id', $1, true)`, [String(sesion.usuarioId)])
    const { rows } = await cliente.query(
      'SELECT * FROM fn_procesar_venta($1, $2)',
      [sesion.empresaId, id],
    )
    return rows[0]
  })
}
```
- La función SQL valida la transición, numera, recalcula y aplica inventario, caja, cartera, asiento y auditoría (skill `erp-documento-financiero`).
- Controlador: DTO → `@RequierePermiso` → servicio. Sin lógica de negocio.
- Otros módulos usan las funciones SQL públicas del módulo (`fn_*`), nunca escriben sus tablas directamente.
- Frontend: la pantalla consume `lib/<modulo>.ts` con `useRecurso`; mientras no haya API, datos de `lib/demo.ts` con `<DemoBadge />`.

## 4. Terminar
Pruebas del caso de uso (feliz + negativo + rollback) → `pnpm test` en `backend/` y `pnpm build` en la raíz → documentar en `docs/modulos/<modulo>.md` → `erp-contexto`.

