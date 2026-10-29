---
name: pos-financial-integrity
description: Reglas críticas de integridad financiera, partida doble, Kárdex, arqueo ciego de caja y facturación electrónica DIAN para QubitPOS.
---

# QubitPOS Financial, Kardex & Accounting Integrity Standards

Esta skill contiene las reglas inmutables de consistencia financiera que ningún módulo o agente desarrollador puede infringir en QubitPOS.

---

## 1. Integridad de Caja y Control de Turnos
- **Arqueo Ciego Obligatorio:** Al realizar el cierre de caja, el cajero debe ingresar el dinero físico contado por denominación (billetes y monedas) SIN ver el saldo teórico acumulado por el sistema. El sistema calcula la diferencia (Faltante / Sobrante).
- **Turnos y Sesiones Aisladas:** Ninguna venta, ingreso o retiro de efectivo puede registrarse sin una sesión de caja activa vinculada (`cash_register_session_id`).
- **Desglose Multimoneda y Multimedio:**
  - Efectivo (conteo físico en arqueo).
  - Datáfono / Tarjetas (validación de voucher / lote de cierre).
  - Transferencias digitales (Nequi, Daviplata, PSE).
  - Crédito a Clientes (generación simultánea en Cartera / Cuentas por Cobrar).

---

## 2. Inventario y Kárdex Multialmacén
- **Valuación Contable:** Promedio Ponderado o PEPS (FIFO) según configuración del tenant.
- **Trazabilidad Absoluta:** Todo cambio en `stock` debe ir acompañado de un registro inmutable en la tabla `kardex_movements` con:
  - `movement_type`: `SALE`, `PURCHASE`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`, `TRANSFER`, `RETURN`.
  - `previous_stock`, `quantity`, `new_stock`.
  - `unit_cost`, `total_cost`.
  - `reference_id` (ID de factura, orden de compra o remisión) y `user_id`.
- **Prohibición de Existencias Negativas:** Salvo parámetro explícito de venta preventiva habilitado por el administrador, las existencias no pueden descender de 0.

---

## 3. Contabilidad de Partida Doble en Tiempo Real
Toda transacción comercial debe balancear exactamente Débitos y Créditos (`Sum(Debe) === Sum(Haber)`):

### Asiento Estándar de Venta POS:
| Cuenta Contable | Nombre | Débito (Debe) | Crédito (Haber) |
| :--- | :--- | :---: | :---: |
| `110505` | Caja General / Efectivo | $119.000 | - |
| `413501` | Comercio al por mayor y menor | - | $100.000 |
| `240801` | Impuesto sobre las ventas (IVA 19%) por pagar | - | $19.000 |
| `613501` | Costo de Ventas (a costo Kárdex) | $60.000 | - |
| `143501` | Inventarios de Mercancías | - | $60.000 |
| **Totales:** | | **$179.000** | **$179.000** |

---

## 4. Facturación Electrónica DIAN (Colombia)
- **Control de Rangos de Resolución:**
  - Prefijo, número inicial, número final, clave técnica y fecha de vigencia.
  - Alerta preventiva cuando el rango disponible sea menor a 100 folios o queden menos de 15 días de vigencia.
- **Cálculo de CUFE y Código QR:**
  - Generación del hash SHA-384 reglamentario según anexo técnico DIAN vigente antes del envío al proveedor tecnológico o software propio.
- **Régimen de Contingencia:** En caso de caída de servicios DIAN, permitir expedir documento POS equivalente con sincronización asíncrona mediante colas de Laravel (`dispatch(new TransmitInvoiceToDianJob($invoice->id))`).
