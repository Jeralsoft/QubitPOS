---
name: erp-contexto
description: Actualiza la memoria del proyecto Bixaro POS (docs/ESTADO.md y docs/CHANGELOG.md) después de un ciclo o fase. Usar al terminar trabajo significativo, al tomar una decisión de arquitectura, o cuando el usuario pida "actualiza el contexto" o "¿en qué vamos?".
---

# Actualizar contexto del proyecto

1. Recolecta hechos verificables, no suposiciones:
   - Archivos creados/modificados en la sesión (`git status` / `git log`).
   - Resultado real de la última ejecución de pruebas y del build.
   - Decisiones confirmadas por el usuario en la conversación.
2. `docs/ESTADO.md` — edita solo las secciones afectadas (no reescribas el archivo):
   - Fecha de "Última actualización" y fase actual.
   - Tabla "Estado de módulos": PENDIENTE / EN DESARROLLO / COMPLETADO / BLOQUEADO + nota corta.
   - Mover decisiones de "Requieren confirmación" a "Tomadas" (con fecha y motivo).
   - "Problemas conocidos" y "Próximos pasos".
3. Plan de fases: si cambia el alcance u orden, actualiza `docs/ANALISIS_MODULOS.md` §6 y la columna `fase` de `lib/modulos.ts` y de la tabla `modulos`.
4. `docs/CHANGELOG.md` — entrada nueva arriba: fecha · fase · cambios · archivos principales · VERIFICADO / NO VERIFICADO.
5. Si respondes "¿en qué vamos?", resume desde estos archivos: fase actual, módulos listos, pendientes, bloqueos y siguiente paso recomendado.

Nunca marques algo COMPLETADO si sus pruebas no se ejecutaron con éxito.
