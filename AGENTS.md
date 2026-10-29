# QubitPOS - Sistema Multi-Agente & Gobernanza de Código

## 1. Regla Suprema: Siempre un Agente Orquestador
En este repositorio, **toda tarea técnica o de negocio es gestionada por el Agente Orquestador**.
El Orquestador no escribe código desordenadamente; analiza el requerimiento, lo descompone en tareas atómicas para los especialistas, supervisa su ejecución y valida la integridad global antes de entregar el resultado.

```
                      ┌──────────────────────┐
                      │  Agente Orquestador  │
                      └──────────┬───────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Frontend Spec.   │    │ Backend Spec.    │    │ Auditor Fin.     │
│ Next.js 16/React │    │ Laravel 11/12    │    │ Kárdex, Caja,    │
│ Tailwind v4      │    │ PHP 8.3 / Postgres│   │ Partida Doble    │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## 2. Roles de Agentes Especialistas

### 👑 Agente Orquestador (`orchestrator` / `pos-orchestrator`)
- **Misión:** Arquitectura general, descomposición de historias de usuario, coordinación entre frontend y backend, resolución de dependencias y aseguramiento de entrega.
- **Skills Principales:** `orchestrator-workflow`, `planning-and-task-breakdown`, `spec-driven-development`, `incremental-implementation`.

### 💻 Agente Especialista Frontend (`frontend-next` / `frontend-specialist`)
- **Misión:** Desarrollo en `components/`, `app/`, `hooks/` y `lib/` bajo Next.js 16, React 19 y Tailwind CSS v4.
- **Enfoque:** Experiencia ultrarrápida de caja, navegación sin ratón (pistola lectora + atajos `F1-F12`), impresión de tickets en 80mm/58mm, actualización reactiva del carrito.
- **Skills Principales:** `nextjs-pos-best-practices`, `frontend-ui-engineering`, `frontend-design`, `vercel-react-best-practices`, `apple-design`.

### ⚙️ Agente Especialista Backend (`backend-laravel` / `backend-specialist`)
- **Misión:** Arquitectura limpia en Laravel (Actions, DTOs, FormRequests, JsonResources, Migraciones PostgreSQL).
- **Enfoque:** Cero lógica en controladores, consultas optimizadas sin N+1, transacciones atómicas `DB::transaction()` y bloqueos pesimistas `lockForUpdate()`.
- **Skills Principales:** `laravel-best-practices`, `api-design-principles`, `error-handling-patterns`, `postgresql-table-design`.

### 📊 Agente Auditor Financiero y DIAN (`financial-auditor` / `especialista-contable`)
- **Misión:** Proteger la verdad financiera del ERP/POS.
- **Enfoque:** Validar que cada movimiento de stock tenga asiento en Kárdex, que cada venta genere partida doble balanceada (Debe = Haber), que el arqueo de caja sea ciego y que la facturación electrónica cumpla normativas DIAN.
- **Skills Principales:** `pos-financial-integrity`, `erp-asiento-contable`, `erp-dinero-impuestos`, `erp-movimiento-inventario`, `erp-revision-integridad`.

---

## 3. Catálogo de Skills Implementadas (`.agents/skills/`)
El sistema cuenta con **69 skills** nativas descubribles progresivamente:

### A. Dominio ERP, Financiero & POS (18 Skills)
- `pos-financial-integrity` · `laravel-best-practices` · `orchestrator-workflow` · `nextjs-pos-best-practices`
- `dian-ubl21-xml` · `erp-asiento-contable` · `erp-dinero-impuestos` · `erp-documento-financiero`
- `erp-movimiento-inventario` · `erp-revision-integridad` · `erp-permisos` · `erp-reporte` · `erp-fase`
- `erp-modulo` · `erp-contexto` · `erp-migracion` · `erp-pruebas` · `erp-endpoint-api`

### B. Frontend, UI/UX & React 19 (18 Skills)
- `frontend-ui-engineering` · `frontend-design` · `design-taste-frontend` · `emil-design-eng` · `apple-design`
- `vercel-react-best-practices` · `ask-sonner` · `break-ui` · `animate` · `animation-performance`
- `animation-vocabulary` · `find-animation-opportunities` · `improve-animations` · `review-animations`
- `browser-testing-with-devtools` · `performance-optimization` · `pick-ui-library` · `prototype`

### C. Backend, Base de Datos & Arquitectura (18 Skills)
- `postgresql-table-design` · `api-design-principles` · `api-and-interface-design` · `error-handling-patterns`
- `code-review-and-quality` · `code-simplification` · `observability-and-instrumentation` · `ci-cd-and-automation`
- `documentation-and-adrs` · `security-and-hardening` · `security-audit` · `deprecation-and-migration`
- `git-workflow-and-versioning` · `source-driven-development` · `constraint-driven-development` · `doubt-driven-development`

### D. Metodología, Testing & Calidad (16 Skills)
- `planning-and-task-breakdown` · `spec-driven-development` · `incremental-implementation` · `test-driven-development`
- `systematic-debugging` · `debugging-and-error-recovery` · `idea-refine` · `product-brainstorming`
- `interview-me` · `headroom` · `context-engineering` · `changelog-generator` · `shipping-and-launch`
- `using-agent-skills` · `mobile-native` · `animate-expo`

---

## 4. Puertas de Calidad Innegociables
1. **Precisión Financiera:** Queda estrictamente prohibido usar aritmética de punto flotante (`float`) para cálculos monetarios o de impuestos.
2. **Protección de Concurrencia:** Todo descuento de stock o impacto a saldo de caja DEBE utilizar `lockForUpdate()` dentro de una transacción.
3. **Contratos API Tipados:** Todo endpoint debe tener su `FormRequest` de entrada y su `JsonResource` de salida correspondiente a interfaces TypeScript en el frontend.
4. **Verificación Continua:** No se aprueban cambios de frontend sin `pnpm exec tsc --noEmit` y `pnpm build` limpios.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
