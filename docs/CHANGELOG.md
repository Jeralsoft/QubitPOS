# Changelog - QubitPOS

Todas las modificaciones notables realizadas en el proyecto están documentadas en este archivo.

---

## [2026-10-30] - Integración Vertical y Despliegue Multi-Módulo en Vivo

### Añadido
- Integración en tiempo real del **Dashboard Principal** (`/`) con endpoints de analítica (`/api/reports/summary`, `/api/reports/sales?group_by=day`, `/api/reports/sales?group_by=product`, `/api/pos/sales`).
- Enlace reactivo del módulo de **Cobros y Cartera (CxC)** (`/cobros`) con persistencia en base de datos mediante bloqueo pesimista y generación automática de asientos contables.
- Enlace del módulo de **Caja y Turnos** (`/movimientos`) con la auditoría de turnos reales de `/api/reports/cash-audit`.
- Enlace de **Inventarios y Control de Stock** (`/inventarios`) con `/api/reports/inventory` para valorización del Kárdex y monitoreo de alertas de stock mínimo.
- Descarga directa de **XML UBL 2.1 oficial firmado con CUFE y QR** en Facturación Electrónica DIAN (`/facturacion`).
- Integración del **Kiosco de Autoservicio** (`/kiosco`) con la API de ventas del POS.
- Absorción de órdenes en la **Pantalla de Cocina / KDS** (`/preparacion`) generadas desde el POS y Kiosco.
- Documento formal de estado del proyecto en [`docs/ESTADO.md`](file:///C:/Proyectos/QubitPOS/docs/ESTADO.md).

### Modificado
- `components/dashboard/dashboard.tsx`: Ahora es un componente cliente interactivo con botón de sincronización y métricas dinámicas.
- `components/dashboard/recent-sales.tsx`: Acepta lista tipada de ventas recientes de la base de datos.
- `components/dashboard/sales-chart.tsx`: Grafica ventas diarias reales de los últimos 7 días.
- `components/dashboard/top-products.tsx`: Despliega el ranking real de productos vendidos del período.
- `components/proveedores/proveedores.tsx`: Sincronización del catálogo de proveedores con la API.
- `components/usuarios/usuarios.tsx`: Sincronización de roles y matriz de permisos con `/api/settings/roles`.

### Verificado
- **TypeScript:** `pnpm exec tsc --noEmit` superado sin errores.
- **Next.js Production Build:** `pnpm build` superado en 1.58s.
- **PHPUnit Test Suite:** 42/42 pruebas superadas al 100%.
