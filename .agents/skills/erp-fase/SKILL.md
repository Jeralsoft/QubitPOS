---
name: erp-fase
description: Ejecuta una fase del plan de QubitPOS (0 a 7, docs/ANALISIS_MODULOS.md §6) por ciclos pequeños, con el agente líder y de apoyo correctos, pruebas, documentación y actualización de contexto. Usar cuando el usuario diga "/erp-fase N", "empecemos la fase N", "sigamos con el módulo X" o pida avanzar el proyecto.
---

# Ejecutar una fase de QubitPOS

Argumento: número de fase (0–7). Si no se da, toma la primera fase EN DESARROLLO o PENDIENTE de `docs/ESTADO.md` y confírmala con el usuario.

## Agentes por fase
| Fase | Líder | Apoyo |
|---|---|---|
| 1. Vender | `especialista-pos` | `especialista-inventario`, `especialista-tesoreria-caja`, `backend-nestjs`, `database-postgres`, `frontend-next` |
| 2. Abastecer y cobrar | `especialista-compras-ventas` | `especialista-cartera-cxp`, `especialista-tesoreria-caja` |
| 3. Cumplir DIAN | `especialista-facturacion-dian` | `backend-nestjs`, `security-hardening` |
| 4. Por giro | `analista-funcional` | `especialista-pos`, `especialista-inventario`, `frontend-next` |
| 5. Gestión | `especialista-contable` | `database-postgres` |
| 6. Personal | `analista-funcional` | `especialista-contable`, `backend-nestjs` |
| 7. Plataforma SaaS | `orchestrator` | `security-hardening`, `backend-nestjs` |
Siempre: `qa-pruebas` para pruebas y `code-reviewer` antes de cerrar.

## 1. Situarse (sin escribir código)
1. Lee `CLAUDE.md`, `docs/ESTADO.md` y la sección de `docs/ANALISIS_MODULOS.md` de los módulos de la fase.
2. Comprueba que las fases de las que depende estén COMPLETADAS. Si no, avisa y propone el orden correcto (no saltar fases salvo decisión explícita del usuario, registrada en `docs/ESTADO.md`).
3. Revisa "Decisiones que requieren confirmación": si alguna bloquea esta fase, pregúntala antes de seguir.
4. Inspecciona el código real afectado (`bds/`, `backend/src/`, `app/`, `components/`). Nunca supongas que algo existe.

## 2. Planear la fase
Presenta al usuario un plan corto:
- Objetivo y entregables de la fase.
- Tablas/funciones SQL, endpoints, pantallas, reglas de negocio y criterios de aceptación (pide al agente `analista-funcional` el doc `docs/modulos/<modulo>.md` si no existe).
- Integraciones con otros módulos (regla de integridad) y qué módulos existentes se ven afectados (no regresión).
- Lista de ciclos pequeños (cada uno: ≤ ~10 archivos, probable en una sesión), preferiblemente rebanadas verticales (BD → API → pantalla).
Marca la fase EN DESARROLLO en `docs/ESTADO.md`.

## 3. Ciclo (repetir por cada ciclo del plan)
1. Explica brevemente el cambio y los archivos a tocar.
2. Delega en el agente especialista de la tabla, o implementa siguiendo su definición en `.claude/agents/`.
3. Usa las skills específicas: `erp-migracion`, `erp-modulo`, `erp-documento-financiero`, `erp-dinero-impuestos`, `erp-movimiento-inventario`, `erp-asiento-contable`, `erp-endpoint-api`, `erp-permisos`, `erp-reporte`.
4. Escribe/actualiza pruebas (`erp-pruebas`) y ejecútalas. Corrige hasta verde. Pega el resumen real del resultado.
5. Documenta en el doc del módulo y en `docs/CHANGELOG.md`.

## 4. Cerrar la fase
1. Ejecuta `erp-revision-integridad`.
2. Ejecuta `erp-contexto` (`docs/ESTADO.md`, `docs/CHANGELOG.md`).
3. Informa al usuario: qué quedó hecho y verificado, qué quedó **NO VERIFICADO**, problemas conocidos y la siguiente fase. Commits solo si el usuario los pide.

