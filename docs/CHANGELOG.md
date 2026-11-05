# Changelog - QubitPOS

Todas las modificaciones notables realizadas en el proyecto están documentadas en este archivo.

---

## [2026-11-05] - Módulo de Configuración 100% Funcional & Gobernanza Multi-Sede

### Añadido
- **CRUD Completo de Sucursales:** Creación, edición, alternancia de estado activo/inactivo y eliminación de sucursales con persistencia real en PostgreSQL (`/api/settings/branches`).
- **CRUD Completo de Cajas Registradoras:** Creación, edición, vinculación de cajas a sucursales y alternancia de estado (`/api/settings/cash-registers`).
- **Gestión Integral de Resoluciones DIAN:** Formulario modal para registro oficial de formulario 1876 DIAN (número, prefijo, rango de numeración, vigencia, clave técnica) con validación y eliminación (`/api/settings/resolutions`).
- **Tabla y Modelo `app_settings`:** Almacenamiento clave-valor JSON en base de datos para todas las configuraciones dinámicas del sistema (periféricos POS, inventarios, políticas de seguridad, SMTP, apariencia).
- **Pruebas de Conectividad en Tiempo Real:** Endpoints para test de servicios Web DIAN (`/api/settings/dian/test-connection`) con reporte de latencia en milisegundos y test de servidor SMTP (`/api/settings/mail/test-connection`).
- **Exportación y Descarga de Copias de Seguridad:** Generación de volcado JSON íntegro de base de datos (`/api/settings/backup/export`) con descarga directa en el navegador.
- **Selector y Carga de Logo Institucional:** Soporte de carga y persistencia de logotipo corporativo para impresión automática en tickets térmicos de 80mm y 58mm.
- **Suite de Pruebas Feature en PHPUnit:** Se añadieron 3 nuevas pruebas exhaustivas en `SettingsTest.php`, alcanzando 45/45 pruebas verdes (264 aserciones).

### Modificado
- `components/configuracion/panels-sucursales.tsx`: Integración total con modales de creación/edición y llamadas API directas.
- `components/configuracion/panels-facturacion.tsx`: Prefijos, resoluciones y parámetros electrónicos conectados al backend.
- `components/configuracion/panels-general.tsx`: Empresa, Logo, Contacto y Configuración Regional completamente enlazados.
- `components/configuracion/panels-inventario.tsx`: Unidades de medida, categorías, marcas, tarifas de IVA/INC y reglas de stock con modales y persistencia.
- `components/configuracion/panels-ventas.tsx`: Métodos de pago, tipos de venta, descuentos y consecutivos con formularios interactivos.
- `components/configuracion/panels-usuarios.tsx`: Roles, permisos y políticas de seguridad (incluido arqueo ciego y 2FA).
- `components/configuracion/panels-sistema.tsx`: Notificaciones, SMTP, copias de seguridad descargables, preferencias de impresora térmica y apariencia reactiva con cambio de tema en vivo.
- `lib/api.ts`: Ampliación del cliente `settingsApi` con 15 métodos REST adicionales.

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
