---
name: orchestrator-workflow
description: Protocolo de gobernanza, delegación y control de calidad del Agente Orquestador en el ecosistema QubitPOS.
---

# QubitPOS Orchestrator Protocol

El **Agente Orquestador** es la autoridad central de coordinación en QubitPOS. Su responsabilidad es entender la visión global del sistema (ERP/POS), descomponer requerimientos en tareas técnicas de alta precisión, delegar a los agentes especialistas, resolver dependencias y garantizar que ningún cambio comprometa la integridad contable, el inventario ni la experiencia de venta en tiempo real.

## Principio Fundamental
> **"Siempre hay un Agente Orquestador"**: Ninguna tarea compleja o multidominio debe ejecutarse de forma desordenada o sin planificación centralizada. Todo flujo debe pasar por el ciclo: **Análisis -> Descomposición -> Delegación -> Auditoría de Integridad -> Entrega.**

---

## 1. Responsabilidades del Orquestador
1. **Descomposición Atómica:** Divide requerimientos de negocio en especificaciones para Frontend, Backend, Base de Datos y Contabilidad.
2. **Matriz de Especialistas:**
   - **Frontend Specialist (`nextjs-frontend`):** Pantallas POS, accesibilidad por teclado, lectores de código de barras, impresión térmica y UX de alta velocidad.
   - **Backend Specialist (`laravel-backend`):** Endpoints RESTful, FormRequests, Actions, DTOs, Resources y migraciones en PostgreSQL.
   - **Financial Auditor (`financial-auditor`):** Validación de partida doble, Kárdex (promedio ponderado/PEPS), concurrencia (`lockForUpdate`), arqueo de caja y facturación electrónica DIAN.
   - **QA / Security:** Verificación de tipos en TypeScript, prevención de N+1 en Eloquent, pruebas unitarias y cobertura de condiciones de carrera.
3. **Control de Estado y Puertas de Calidad (Quality Gates):**
   - No se entrega código backend sin FormRequest y Resource dedicado.
   - No se altera inventario o saldos de caja sin transacción atómica y bloqueo pesimista.
   - No se aprueba interfaz POS sin soporte de teclado para escáner y cajero rápido.

---

## 2. Flujo de Trabajo del Orquestador

```
               [Requerimiento de Usuario]
                           │
                           ▼
              [Agente Orquestador: Plan]
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
 [Backend Action/API] [Frontend UI/Hook] [Auditoría Financiera]
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
                 [Validación Cruzada]
          (Types, Contabilidad, Concurrencia)
                           │
                           ▼
               [Respuesta / Despliegue]
```

### Paso 1: Clasificación del Alcance
- **Módulo Afectado:** (Ventas, Caja, Kiosco, Facturación, Inventarios, etc.)
- **Impacto Financiero:** ¿Modifica dinero o existencias físicas? Si la respuesta es sí, invocar obligatoriamente el skill `pos-financial-integrity`.
- **Impacto de Contrato:** ¿Requiere nuevo endpoint o cambio de DTO? Definir primero el contrato JSON antes de tocar el frontend.

### Paso 2: Delegación y Ejecución
- Invocar los subagentes pertinentes con prompts concisos y directos.
- Evitar que dos agentes editen el mismo archivo simultáneamente sin una interfaz acordada.

### Paso 3: Puerta de Validación Final
Antes de dar por completada una solicitud, el orquestador valida:
- [ ] ¿Hay transacciones `DB::transaction` en operaciones compuestas?
- [ ] ¿Los montos monetarios mantienen precisión decimal sin redondeos flotantes?
- [ ] ¿El frontend maneja estados de error de red y respuesta optimista?
- [ ] ¿El contrato de TypeScript concuerda con el `JsonResource` de Laravel?
