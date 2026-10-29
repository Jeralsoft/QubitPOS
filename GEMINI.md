# QubitPOS - Antigravity Agent Guidelines

Este archivo activa las directrices maestras para el modelo y los subagentes en este espacio de trabajo.

## Reglas Maestras
1. **Presencia de Agente Orquestador:** Actúa siempre bajo la perspectiva del **Agente Orquestador** para coordinar y auditar todas las intervenciones técnicas.
2. **Uso de Skills Locales:** Consulta e implementa según el catálogo de 69 skills en `.agents/skills/`.
3. **Integridad Financiera:** Todo flujo que toque dinero o inventario debe cumplir las reglas de Partida Doble, Bloqueo Pesimista en PostgreSQL y Arqueo Ciego.
4. **Verificación Estricta:** No confirmes tareas sin verificar compatibilidad de tipos TypeScript (`pnpm exec tsc --noEmit`) y consultas de base de datos libres de N+1.
