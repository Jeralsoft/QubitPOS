---
name: laravel-best-practices
description: Estándares de arquitectura limpia, rendimiento Eloquent, concurrencia POS, multi-tenancy e integridad financiera en PHP 8.3+ y Laravel 11/12 sobre PostgreSQL.
---

# Laravel Enterprise Best Practices (ERP / POS Architecture)

Esta skill define las reglas obligatorias para escribir código Backend en Laravel dentro de un ecosistema de Punto de Venta (POS), Inventario (Kárdex) y Contabilidad (Partida Doble + Facturación Electrónica DIAN).

## 1. Arquitectura Limpia (Controladores Delgados)
- **Single Action Controllers / Actions:** La lógica de negocio NUNCA va en el controlador ni en el modelo Eloquent. Usa clases `Action` o `Service` inyectadas (ej. `App\Actions\POS\RegisterSaleAction`, `App\Actions\Inventory\DeductKardexStockAction`).
- **DTOs (Data Transfer Objects):** Pasa datos entre controladores y Actions usando objetos tipados en PHP (`readonly class SaleData`) en lugar de arrays asociativos sueltos.
- **FormRequests obligatorios:** Toda entrada de API debe validarse y autorizarse mediante una clase `FormRequest` dedicada antes de tocar el controlador.
- **API Resources (`JsonResource`):** Jamás devuelvas modelos Eloquent crudos en un endpoint JSON. Usa siempre `JsonResource` para controlar exactamente el contrato de salida hacia el frontend en Next.js.

## 2. Concurrencia e Integridad Financiera (PostgreSQL)
- **Transacciones Atómicas:** Cualquier operación que afecte más de una tabla (ej. Venta = Cabecera + Detalles + Movimiento Kárdex + Ingreso Caja + Asiento Contable) DEBE ejecutarse dentro de `DB::transaction(function () { ... })`.
- **Bloqueo Pesimista (`lockForUpdate`):** Antes de descontar existencias de un producto/lote o modificar el saldo de una caja abierta, bloquea la fila en PostgreSQL para prevenir condiciones de carrera:
  ```php
  $stock = ProductWarehouse::where('product_id', $productId)
      ->where('warehouse_id', $warehouseId)
      ->lockForUpdate()
      ->firstOrFail();
  ```
- **Montos Monetarios en Centavos / Enteros o Decimal Preciso:** Evita números de punto flotante (`float`) para dinero. Usa `DECIMAL(14, 2)` o `BIGINT` (centavos) y la extensión BCMath (`bcadd`, `bcmul`) o una librería Money.

## 3. Rendimiento Eloquent & Prevención N+1
- **Eager Loading Estricto:** Siempre especifica las relaciones necesarias y selecciona únicamente las columnas requeridas:
  ```php
  Invoice::with([
      'customer:id,nit,business_name',
      'items:id,invoice_id,product_id,quantity,price'
  ])
  ->select(['id', 'prefix', 'number', 'customer_id', 'total', 'created_at'])
  ->paginate(25);
  ```
- **Prohibir Lazy Loading en Entornos de Desarrollo:** Configura `Model::preventLazyLoading(!app()->isProduction())` en `AppServiceProvider`.
- **Uso de Índices Compuestos:** Claves compuestas en PostgreSQL para consultas críticas de alta concurrencia como `(tenant_id, warehouse_id, product_id)` y `(tenant_id, status, created_at)`.

## 4. Multi-Tenancy & Aislamiento de Datos
- **Scopes Globales de Tenant:** Asegura que cada modelo posea `tenant_id` y use un Trait / Global Scope (`BelongsToTenant`) para evitar fuga de información entre empresas.
- **Validaciones con Scope:** Al validar claves foráneas o unicidad en FormRequests, incluye el scope del tenant activo:
  ```php
  Rule::unique('products')->where(fn ($query) => $query->where('tenant_id', $tenantId))
  ```

## 5. Auditoría y Trazabilidad
- Toda mutación de estado financiero (anulación de factura, nota crédito, ajuste de inventario o apertura/cierre de caja) debe registrar usuario, IP, motivo y snapshot del estado anterior en log de auditoría inmutable.
