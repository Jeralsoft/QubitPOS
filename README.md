# 🚀 QubitPOS - Sistema ERP & Punto de Venta Profesional para Colombia

<p align="center">
  <img src="https://raw.githubusercontent.com/Jeralsoft/QubitPOS/main/public/placeholder.svg" alt="QubitPOS Logo" width="120" height="120" />
</p>

<p align="center">
  <strong>Solución integral de Punto de Venta (POS), Facturación Electrónica DIAN, Inventarios Kárdex, Contabilidad NIIF y Nómina Electrónica para micro, pequeñas y medianas empresas en Colombia.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Laravel-13-FF2D20?style=for-the-badge&logo=laravel" alt="Laravel" />
  <img src="https://img.shields.io/badge/PHP-8.3-777BB4?style=for-the-badge&logo=php" alt="PHP" />
  <img src="https://img.shields.io/badge/DIAN-UBL_2.1-green?style=for-the-badge" alt="DIAN UBL 2.1" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Architecture-Clean_Actions-orange?style=for-the-badge" alt="Clean Architecture" />
</p>

---

## 📋 Tabla de Contenidos

1. [Visión General del Sistema](#-visión-general-del-sistema)
2. [Arquitectura y Stack Tecnológico](#-arquitectura-y-stack-tecnológico)
3. [Ecosistema Multi-Agente & Protocolos](#-ecosistema-multi-agente--protocolos)
4. [Módulos del Sistema (Desglose Exhaustivo)](#-módulos-del-sistema-desglose-exhaustivo)
   - [1. Punto de Venta (POS) & Facturación](#1-punto-de-venta-pos--facturación)
   - [2. Facturación Electrónica DIAN (UBL 2.1 & CUFE)](#2-facturación-electrónica-dian-ubl-21--cufe)
   - [3. Gestión de Caja & Turnos (Arqueo Ciego)](#3-gestión-de-caja--turnos-arqueo-ciego)
   - [4. Inventarios, Bodegas & Kárdex Ponderado](#4-inventarios-bodegas--kárdex-ponderado)
   - [5. Contabilidad Automatizada & PUC Colombia](#5-contabilidad-automatizada--puc-colombia)
   - [6. Nómina Electrónica & Seguridad Social (PILA)](#6-nómina-electrónica--seguridad-social-pila)
   - [7. Clientes & Cuentas por Cobrar (Cartera CxC)](#7-clientes--cuentas-por-cobrar-cartera-cxc)
   - [8. Proveedores & Cuentas por Pagar (Compras CxP)](#8-proveedores--cuentas-por-pagar-compras-cxp)
   - [9. Kiosco de Autoservicio (Self-Checkout)](#9-kiosco-de-autoservicio-self-checkout)
   - [10. Pantalla de Cocina & Preparación (KDS)](#10-pantalla-de-cocina--preparación-kds)
   - [11. Panel Analítico & Reportes Gerenciales](#11-panel-analítico--reportes-gerenciales)
   - [12. Administración, Usuarios y Seguridad Multi-Tenant](#12-administración-usuarios-y-seguridad-multi-tenant)
5. [Estructura del Proyecto](#-estructura-del-proyecto)
6. [Instalación y Despliegue Local](#-instalación-y-despliegue-local)
7. [Credenciales por Defecto](#-credenciales-por-defecto)
8. [Pruebas Automatizadas](#-pruebas-automatizadas)
9. [Licencia y Créditos](#-licencia-y-créditos)

---

## 🌟 Visión General del Sistema

**QubitPOS** es una plataforma ERP y Punto de Venta de nueva generación diseñada específicamente para las exigencias comerciales, contables y tributarias de Colombia. 

Combina una experiencia de usuario de latencia ultrabaja (ideal para negocios de retail, supermercados, ferreterías, droguerías y restaurantes con alto volumen de transacciones) con un backend de grado empresarial respaldado por **Clean Architecture**, transacciones inmutables y soporte nativo para los requerimientos de la **DIAN**.

### Características Destacadas
- **Operación Continua & Seguridad de Caja:** Bloqueo obligatorio de operaciones comerciales si no existe un turno de caja activo; prevención de fraudes mediante arqueo ciego (*blind count*).
- **Cumplimiento Fiscal Colombiano:** Algoritmo oficial SHA-384 para cálculo de CUFE y CUNE, código QR de verificación DIAN y generación de tirillas térmicas para impresoras de 80mm y 58mm.
- **Rendimiento Máximo:** Frontend compilado con Next.js 16 y React 19 Server/Client Components con Tailwind CSS v4, y backend Laravel 13 optimizado con DTOs fuertemente tipados y acciones de dominio aisladas.

---

## 🛠 Arquitectura y Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                         │
│  Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4│
│  - Captura HID de Códigos de Barra (Hardware Scanner Hook)  │
│  - Atajos POS Globales (F1 Cobrar, F2 Buscar, F4 Limpiar)   │
│  - Renderizado Térmico CSS (@media print 80mm / 58mm)       │
│  - Estado Global de Turno de Caja (POSSessionContext)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON API (Sanctum)
┌──────────────────────────────▼──────────────────────────────┐
│                       BACKEND LAYER                         │
│       Laravel 13 + PHP 8.3 + PostgreSQL / SQLite            │
│  - Clean Architecture: DTOs + FormRequests + Actions        │
│  - Concurrencia segura: DB::transaction() + lockForUpdate() │
│  - Precisión matemática estricta con bcmath (DECIMAL 18,4)  │
│  - Criptografía DIAN: SHA-384 CUFE/CUNE Engine              │
└─────────────────────────────────────────────────────────────┘
```

| Componente | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework Frontend** | [Next.js 16](https://nextjs.org/) | Enrutamiento moderno App Router, Server Components y renderizado ultrarrápido. |
| **Biblioteca de UI** | [React 19](https://react.dev/) | Gestión declarativa de interfaces reactivas y concurrentes. |
| **Estilos & Diseño** | [Tailwind CSS v4](https://tailwindcss.com/) | Estilos utilitarios de alto rendimiento y sistema de diseño personalizado `jeralpos`. |
| **Framework Backend** | [Laravel 13](https://laravel.com/) | Núcleo de servicios RESTful, middleware de seguridad y orquestación de colas. |
| **Lenguaje Backend** | [PHP 8.3](https://www.php.net/) | Tipado estricto, Enums nativos, Readonly Properties y extensiones criptográficas/bcmath. |
| **Autenticación** | [Laravel Sanctum](https://laravel.com/docs/sanctum) | Tokens API seguros con soporte SPA y control de habilidades por rol. |
| **Base de Datos** | PostgreSQL / SQLite | Persistencia relacional ACID, llaves foráneas e integridad referencial estricta. |

---

## 🤖 Ecosistema Multi-Agente & Protocolos

El desarrollo y mantenimiento continuo de QubitPOS está gobernado por una red de agentes especializados que colaboran bajo directrices estrictas:

```
                  ┌──────────────────────┐
                  │   pos-orchestrator   │
                  └──────────┬───────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     │                       │                       │
┌────▼──────────────┐ ┌──────▼─────────────┐ ┌───────▼──────────────┐
│ backend-specialist│ │ frontend-specialist│ │  financial-auditor   │
└───────────────────┘ └────────────────────┘ └──────────────────────┘
     │                                               │
┌────▼──────────────┐                         ┌──────▼──────────────┐
│especialista-nomina│                         │especialista-contable│
└───────────────────┘                         └─────────────────────┘
```

1. **`pos-orchestrator`**: Director del proyecto que descompone requisitos, delega tareas y asegura que no existan inconsistencias entre capas.
2. **`backend-specialist`**: Implementa controladores delgados, DTOs inmutables, FormRequests de validación y `Actions` de dominio atómicas con `DB::transaction()`.
3. **`frontend-specialist`**: Construye componentes de interfaz reactivos, accesibles (ARIA), con atajos de hardware y estilos optimizados para pantallas táctiles e impresoras térmicas.
4. **`financial-auditor`**: Vigila la regla inquebrantable de cuadre de caja, partida doble (`Debe == Haber`) y precisión monetaria sin pérdida de decimales.
5. **`especialista-contable`**: Garantiza el cumplimiento de normas colombianas NIIF para Pymes, parametrización del PUC, retenciones en UVT (ReteFuente, ReteIVA, ReteICA) e Información Exógena DIAN.
6. **`especialista-nomina`**: Controla el mes laboral comercial de 30 días (CST), liquidación de seguridad social (PILA), prestaciones sociales y el estándar XML UBL 2.1 para Nómina Electrónica DIAN.

---

## 📦 Módulos del Sistema (Desglose Exhaustivo)

### 1. Punto de Venta (POS) & Facturación
El módulo central de atención al cliente está diseñado para operar con máxima agilidad:
- **Lector de Código de Barras Continuo (HID):** Captura automática de lectores láser o 2D en segundo plano mediante `useBarcodeScanner`, sin perder foco aunque el usuario navegue en la pantalla.
- **Atajos de Teclado Profesionales (`usePosShortcuts`):**
  - <kbd>F1</kbd>: Abrir modal de cobro inmediato.
  - <kbd>F2</kbd>: Enfocar buscador global de productos.
  - <kbd>F4</kbd>: Vaciar carrito de venta previa confirmación.
  - <kbd>F8</kbd>: Abrir panel de clientes para asociar factura a crédito o tercero.
  - <kbd>Esc</kbd>: Cancelar modal activo o limpiar filtros.
- **Carrito Reactivo y Cálculo de Impuestos:** Cálculo automático de subtotal, IVA (19%, 5%, 0%), Impuesto Nacional al Consumo (INC 8%) y descuentos individuales o globales.
- **Múltiples Métodos de Pago:** Efectivo (con cálculo dinámico de cambio), Datáfono / Tarjetas débito y crédito, Transferencia (Nequi, Daviplata, Bancolombia QR) y Venta a Crédito.
- **Bloqueo Inteligente de Turno:** Si la caja registradora no ha sido abierta formalmente, la interfaz de ventas se bloquea guiando al cajero a iniciar su turno de forma obligatoria.

### 2. Facturación Electrónica DIAN (UBL 2.1 & CUFE)
Cumplimiento normativo para Colombia de acuerdo a las resoluciones vigentes:
- **Cálculo Criptográfico de CUFE:** Generación de la cadena canónica y aplicación de hash `SHA-384` en minúsculas:
  $$\text{CUFE} = \text{SHA-384}(\text{NumFac} + \text{FecFac} + \text{HorFac} + \text{ValFac} + \dots + \text{ClTec} + \text{TipoAmb})$$
- **Código QR Bidimensional:** Generación de código QR SVG embebible en la tirilla térmica con la URL oficial de validación de la DIAN.
- **Impresión Térmica Dual (80mm y 58mm):** Plantilla optimizada para impresoras POS con tipografía monoespaciada legible, desglose de impuestos, discriminación de resoluciones de facturación y pie de firma.
- **Resoluciones DIAN:** Control de prefijos (ej: `FE-`, `POS-`), rangos autorizados desde/hasta y fechas de vigencia con alertas de vencimiento.

### 3. Gestión de Caja & Turnos (Arqueo Ciego)
Control exhaustivo de efectivo y prevención de fugas de dinero:
- **Apertura de Turno:** Registro del cajero responsable, caja física asignada y monto base inicial en efectivo.
- **Movimientos de Turno:** Entradas de dinero (*Pay-In*) por fondos de cambio y salidas (*Pay-Out*) para gastos menores autorizados con justificación y comprobante.
- **Arqueo Ciego (*Blind Count*):** Al realizar el cierre, el cajero debe ingresar físicamente el conteo de billetes y monedas sin conocer el monto esperado por el sistema. El sistema calcula automáticamente sobrantes o faltantes.
- **Comprobantes X y Z:** Generación de informes de corte parcial (Corte X) y cierre definitivo de jornada (Corte Z).

### 4. Inventarios, Bodegas & Kárdex Ponderado
Trazabilidad total de la mercancía y valorización en tiempo real:
- **Kárdex Automatizado:** Cada venta descuenta unidades atómicamente con `lockForUpdate()` previniendo ventas negativas en escenarios concurrentes.
- **Costo Promedio Ponderado:** Recálculo continuo del costo unitario con cada recepción de mercancía o factura de compra.
- **Gestión Multi-Bodega & Traslados:** Control de stock entre bodega principal, punto de venta y sucursales satélite con registro de traslados y firmas de despacho.
- **Alertas de Stock Mínimo:** Notificaciones automáticas de productos próximos a agotarse para reposición oportuna.
- **Control de Lotes y Fechas de Vencimiento:** Esencial para droguerías, alimentos y productos perecederos.

### 5. Contabilidad Automatizada & PUC Colombia
Motor contable que asienta automáticamente las operaciones comerciales:
- **Partida Doble Inmutable:** Cumplimiento estricto de la ecuación patrimonial:
  $$\sum \text{Débitos} = \sum \text{Créditos}$$
  Si la suma no coincide al cuarto decimal (`bcmath`), la transacción se aborta con `UnbalancedJournalEntryException`.
- **Estructura Jerárquica del PUC:** Clases (1 dígito), Grupos (2 dígitos), Cuentas (4 dígitos), Subcuentas (6 dígitos) y Auxiliares por tercero (8+ dígitos).
- **Asientos Automáticos:**
  - Venta de Contado: Débito Caja General (1105) contra Crédito Comercio (4135) e IVA Generado (2408).
  - Venta a Crédito: Débito Clientes Nacionales (1305) con tercero asociado.
  - Costo de Ventas: Débito Comercio al por mayor (6135) contra Crédito Inventarios (1435).
- **Cierres Contables & Medios Magnéticos:** Preparación para generación de formatos de Información Exógena DIAN (1001, 1003, 1005, 1006, 1007, 1008, 1009).

### 6. Nómina Electrónica & Seguridad Social (PILA)
Gestión completa de recursos humanos adaptada al Código Sustantivo del Trabajo (CST):
- **Liquidación Comercial (Base 30 Días):** Proporcionalidad exacta según días trabajados, novedades de incapacidad, licencias y vacaciones.
- **Auxilio de Transporte:** Asignación automática a empleados que devenguen hasta 2 SMLMV.
- **Seguridad Social (PILA) y Exoneración Art. 114-1 E.T.:**
  - Descuentos al empleado: Salud (4%), Pensión (4%) y Fondo de Solidaridad Pensional (FSP).
  - Aportes empleador con cálculo automático de exoneración de Salud (8.5%), SENA (2%) e ICBF (3%) para trabajadores que devenguen menos de 10 SMLMV.
- **Provisiones Prestacionales Mensuales:** Cesantías (8.33%), Intereses a las Cesantías (1% mensual), Prima de Servicios (8.33%) y Vacaciones (4.17%).
- **CUNE & Nómina Electrónica DIAN:** Generación del XML UBL 2.1 (Código 102 individual y 103 de ajuste) con hash `SHA-384`.

### 7. Clientes & Cuentas por Cobrar (Cartera CxC)
Administración integral del ciclo de crédito y cobro:
- **Ficha 360° del Cliente:** Identificación con Cédula de Ciudadanía, Cédula de Extranjería, NIT con Dígito de Verificación (Módulo 11) o Pasaporte.
- **Políticas de Crédito:** Asignación de cupo máximo de crédito, días de plazo y bloqueo automático por mora.
- **Recibos de Caja (Abonos):** Registro de pagos con imputación a facturas específicas o a la deuda más antigua.
- **Reportes de Envejecimiento de Cartera:** Clasificación de cartera corriente, 1 a 30 días, 31 a 60 días, 61 a 90 días y mayor a 90 días.

### 8. Proveedores & Cuentas por Pagar (Compras CxP)
Gestión de abastecimiento y relaciones con suplidores:
- **Registro de Proveedores:** Información tributaria, régimen fiscal, tarifas de retención aplicables y cuentas bancarias asociadas.
- **Órdenes de Compra y Recepción:** Flujo completo desde la solicitud de cotización hasta el ingreso físico al almacén con actualización inmediata de stock.
- **Causación de Facturas de Compra:** Registro de compras con desglose de IVA descontable y aplicación de retenciones (ReteFuente, ReteIVA, ReteICA).
- **Egresos & Órdenes de Pago:** Generación de comprobantes de egreso vinculados a las facturas pendientes.

### 9. Kiosco de Autoservicio (Self-Checkout)
Interfaz especializada para atención autónoma del cliente en puntos físicos:
- **Modo Táctil Intuitivo:** Pantalla completa diseñada para tótems interactivos con imágenes de alta definición y tipografía grande.
- **Personalización de Productos:** Opciones de selección rápida (sin cebolla, salsa extra, tamaño de bebida, acompañamientos).
- **Pago Autónomo:** Integración con terminales de pago con tarjeta contactless y códigos QR digitales.
- **Generación de Ticket de Turno:** Emisión de número de comanda para recoger en mostrador.

### 10. Pantalla de Cocina & Preparación (KDS)
Sistema de gestión de pedidos en tiempo real para centros de producción y cocinas:
- **Tablero Kanban de Preparación:** Columnas dinámicas (Pendientes, En Preparación, Listos para Despacho).
- **Semáforo de Tiempos:** Indicadores visuales de tiempo transcurrido (Verde: a tiempo, Amarillo: límite de tolerancia, Rojo: retrasado).
- **Agrupación Inteligente:** Filtros por estación de trabajo (ej: Plancha, Bebidas, Ensaladas, Empaque).
- **Compatibilidad con Notificaciones Acústicas:** Alerta sonora ante la llegada de nuevos pedidos desde el POS o Kiosco.

### 11. Panel Analítico & Reportes Gerenciales
Inteligencia de negocios para la toma de decisiones informadas:
- **Dashboard en Tiempo Real:** Métricas clave del día (Venta total, ticket promedio, número de transacciones, margen de ganancia estimado).
- **Gráficos de Tendencia:** Ventas por hora, comparativo día a día y ventas por día de la semana.
- **Top de Ventas:** Ranking de productos más vendidos en volumen monetario y en unidades físicas.
- **Exportación Multi-Formato:** Generación instantánea de reportes en formatos PDF listos para imprimir y Excel (.xlsx / .csv).

### 12. Administración, Usuarios y Seguridad Multi-Tenant
Seguridad, control de accesos y gobernanza de datos:
- **Control de Acceso Basado en Roles (RBAC):** Perfiles preconfigurados (Super Administrador, Administrador de Tienda, Cajero, Vendedor, Contador, Cocinero).
- **Aislamiento Multi-Sucursal:** Capacidad de operar múltiples locales o puntos de venta bajo una misma entidad corporativa.
- **Pista de Auditoría (*Audit Log*):** Registro inalterable de fecha, hora, usuario e IP de cada acción sensible (descuentos manuales, anulaciones, aperturas de cajón monedero).

---

## 📂 Estructura del Proyecto

```
QubitPOS/
├── .agents/                    # Definición de subagentes especializados y skills
│   ├── agents/                 # Perfiles de agentes (pos-orchestrator, especialista-contable, etc.)
│   └── skills/                 # Más de 70 skills técnicas (DIAN UBL 2.1, PostgreSQL, Laravel)
├── app/                        # Next.js 16 App Router (Páginas, layouts y rutas)
│   ├── layout.tsx              # Shell principal de la aplicación
│   ├── page.tsx                # Página de inicio / punto de entrada
│   └── globals.css             # Estilos globales y reglas @media print para térmicas
├── backend/                    # Backend API RESTful en Laravel 13
│   ├── app/
│   │   ├── Actions/POS/        # Acciones de dominio (RegisterSaleAction, OpenCashShiftAction)
│   │   ├── DTOs/POS/           # Data Transfer Objects (SaleData, SaleItemData, OpenShiftData)
│   │   ├── Http/Controllers/   # Controladores API delgados
│   │   ├── Http/Requests/      # FormRequests con validación estricta
│   │   ├── Http/Resources/     # API Resources para transformación de salida
│   │   └── Models/             # Modelos Eloquent (Product, Sale, CashShift, etc.)
│   ├── database/
│   │   ├── migrations/         # Esquema de base de datos relacional
│   │   └── seeders/            # Semillas con catálogo colombiano y usuario administrador
│   ├── routes/api.php          # Definición de rutas protegidas y públicas
│   └── tests/Feature/          # Pruebas automatizadas de la API
├── components/                 # Componentes React 19 modulares
│   ├── auth/                   # Autenticación y recuperación de credenciales
│   ├── caja/                   # Arqueos, turnos y movimientos de caja
│   ├── clientes/               # CRM de clientes y cupo de crédito
│   ├── cobros/                 # Cuentas por cobrar y recibos
│   ├── configuracion/          # Parámetros del sistema y sucursales
│   ├── contabilidad/           # Asientos, PUC y balances
│   ├── dashboard/              # Tablero principal de métricas
│   ├── empleados/              # Hojas de vida y contratos
│   ├── facturacion/            # Resoluciones y control DIAN
│   ├── inventarios/            # Kárdex, bodegas y ajustes
│   ├── kiosco/                 # Autoservicio táctil
│   ├── nomina/                 # Nómina electrónica y liquidaciones
│   ├── preparacion/            # Pantalla de cocina (KDS)
│   ├── productos/              # Catálogo, categorías y variantes
│   ├── proveedores/            # Compras y cuentas por pagar
│   ├── reportes/               # Informes gerenciales y fiscales
│   ├── ui/                     # Componentes base reutilizables
│   └── ventas/                 # Punto de Venta POS, atajos, ticket térmico
├── context/                    # Contextos de React (POSSessionContext para bloqueo de caja)
├── hooks/                      # Hooks personalizados (useBarcodeScanner, usePosShortcuts)
├── lib/                        # Utilidades (api.ts para llamadas HTTP, currency.ts para COP)
├── package.json                # Dependencias frontend (pnpm)
└── README.md                   # Documentación técnica integral
```

---

## ⚡ Instalación y Despliegue Local

### Requisitos Previos
- **Node.js:** Versión `>= 20.x`
- **pnpm:** Versión `>= 9.x`
- **PHP:** Versión `>= 8.3` con extensiones `bcmath`, `pdo`, `pdo_sqlite` o `pdo_pgsql`, `mbstring`, `openssl`, `tokenizer`, `xml`
- **Composer:** Versión `>= 2.7`
- **Git:** Instalado y configurado

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Jeralsoft/QubitPOS.git
cd QubitPOS
```

### 2. Configurar el Backend (Laravel)
```bash
cd backend

# Copiar variables de entorno
cp .env.example .env

# Instalar dependencias de Composer
composer install

# Generar clave de aplicación
php artisan key:generate

# Ejecutar migraciones y poblar la base de datos con datos colombianos
php artisan migrate:fresh --seed

# Iniciar servidor backend (puerto 8000 por defecto)
php artisan serve --host=127.0.0.1 --port=8000
```

### 3. Configurar el Frontend (Next.js)
En una nueva pestaña de terminal, en la raíz del proyecto:
```bash
# Copiar variables de entorno
cp .env.example .env.local

# Instalar dependencias de Node
pnpm install

# Iniciar el servidor de desarrollo
pnpm dev
```

La aplicación estará disponible inmediatamente en `http://localhost:3000` (o `http://localhost:3002`).

---

## 🔑 Credenciales por Defecto

Al ejecutar `php artisan db:seed`, se crean los siguientes accesos iniciales de prueba:

| Campo | Valor |
| :--- | :--- |
| **Rol** | Administrador General del Sistema |
| **Correo Electrónico** | `admin@qubitpos.co` |
| **Contraseña** | `qubitpos` |
| **Caja Asignada** | Caja Principal 01 |
| **Sucursal** | Sede Principal Bogotá |

---

## 🧪 Pruebas Automatizadas

El backend incluye pruebas de integración y características para asegurar la integridad de las transacciones financieras y el cumplimiento de las reglas DIAN:

```bash
cd backend
php artisan test
```

### Casos de Prueba Verificados
- ✅ **`test_can_register_a_complete_sale_with_inventory_deduction`**: Valida que una venta descuente inventario con bloqueo pesimista, genere los registros en Kárdex, asigne el turno de caja y calcule el hash oficial `CUFE` de 96 caracteres SHA-384.
- ✅ **`test_sale_fails_if_stock_is_insufficient`**: Valida que si un artículo no cuenta con existencias suficientes, la transacción efectúe un `ROLLBACK` completo garantizando la consistencia del inventario.

---

## 📄 Licencia y Créditos

Desarrollado y mantenido con pasión por **[Jeralsoft](https://github.com/Jeralsoft)**.

Distribuido bajo la Licencia Propietaria de **Jeralsoft**. Todos los derechos reservados.
Para soporte comercial, alianzas de distribución o implementaciones personalizadas en Colombia, por favor contactar a través del perfil oficial de [GitHub de Jeralsoft](https://github.com/Jeralsoft).
