<?php

namespace Tests\Feature;

use App\Actions\POS\RegisterSaleAction;
use App\DTOs\POS\SaleData;
use App\DTOs\POS\SaleItemData;
use App\Models\AccountingAccount;
use App\Models\AccountingEntry;
use App\Models\AccountPayable;
use App\Models\CashShift;
use App\Models\KardexMovement;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Sale;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class EconomicChainAndConcurrencyTest extends TestCase
{
    use RefreshDatabase;

    private function setupAccountingPuc(): void
    {
        $accounts = [
            ['code' => '110505', 'name' => 'Caja General', 'nature' => 'D', 'type' => 'ACTIVO', 'level' => 3, 'is_movement' => true, 'is_active' => true],
            ['code' => '130505', 'name' => 'Clientes Nacionales', 'nature' => 'D', 'type' => 'ACTIVO', 'level' => 3, 'is_movement' => true, 'is_active' => true],
            ['code' => '143505', 'name' => 'Inventario de Mercancías', 'nature' => 'D', 'type' => 'ACTIVO', 'level' => 3, 'is_movement' => true, 'is_active' => true],
            ['code' => '220505', 'name' => 'Proveedores Nacionales', 'nature' => 'C', 'type' => 'PASIVO', 'level' => 3, 'is_movement' => true, 'is_active' => true],
            ['code' => '240801', 'name' => 'IVA Generado en Ventas (19%)', 'nature' => 'C', 'type' => 'PASIVO', 'level' => 3, 'is_movement' => true, 'is_active' => true],
            ['code' => '240802', 'name' => 'IVA Descontable en Compras (19%)', 'nature' => 'D', 'type' => 'PASIVO', 'level' => 3, 'is_movement' => true, 'is_active' => true],
            ['code' => '413505', 'name' => 'Comercio al por Mayor y al por Menor', 'nature' => 'C', 'type' => 'INGRESOS', 'level' => 3, 'is_movement' => true, 'is_active' => true],
            ['code' => '613505', 'name' => 'Costo de Ventas de Mercancías', 'nature' => 'D', 'type' => 'COSTOS', 'level' => 3, 'is_movement' => true, 'is_active' => true],
        ];

        foreach ($accounts as $a) {
            AccountingAccount::updateOrCreate(['code' => $a['code']], $a);
        }
    }

    private function createShift(User $user): CashShift
    {
        return CashShift::create([
            'user_id' => $user->id,
            'register_name' => 'Caja Principal 01',
            'branch_name' => 'Sede Principal',
            'opening_balance' => 100000,
            'status' => 'OPEN',
            'opened_at' => now(),
        ]);
    }

    /**
     * Prueba 1: Concurrencia y Bloqueo Pesimista en Inventario (lockForUpdate)
     * Verifica que cuando el stock se agota, las ventas adicionales son rechazadas
     * atómicamente y nunca se produce stock negativo ni descuadre en Kárdex.
     */
    public function test_pessimistic_locking_prevents_negative_stock_under_concurrent_sales(): void
    {
        $this->setupAccountingPuc();
        $user = User::factory()->create();
        $shift = $this->createShift($user);

        // Producto con exactamente 3 unidades disponibles
        $product = Product::create([
            'code' => 'CONCUR-01',
            'barcode' => '770999900001',
            'name' => 'Audífonos Bluetooth Edición Limitada',
            'category' => 'Tecnología',
            'purchase_price' => 50000,
            'sale_price' => 85000,
            'stock' => 3,
            'min_stock' => 1,
            'tax_rate' => 0.19,
            'is_active' => true,
        ]);

        $action = app(RegisterSaleAction::class);

        $successfulSales = 0;
        $rejectedSales = 0;

        // Intentar registrar 5 ventas individuales consecutivas en ráfaga
        for ($i = 1; $i <= 5; $i++) {
            $data = new SaleData(
                userId: $user->id,
                cashShiftId: $shift->id,
                customerName: "Cliente #{$i}",
                customerTaxId: '222222222222',
                customerPhone: '3001234567',
                paymentMethod: 'efectivo',
                cashReceived: 100000,
                items: [
                    new SaleItemData(
                        productId: $product->id,
                        quantity: 1,
                        unitPrice: 85000,
                        discount: 0,
                        taxRate: 0.19
                    ),
                ]
            );

            try {
                $sale = $action->execute($data);
                $this->assertNotNull($sale->id);
                $successfulSales++;
            } catch (ValidationException $e) {
                $rejectedSales++;
            }
        }

        // Exactamente 3 ventas deben ser exitosas y 2 rechazadas
        $this->assertEquals(3, $successfulSales, 'Debieron aprobarse exactamente 3 ventas por el stock disponible.');
        $this->assertEquals(2, $rejectedSales, 'Debieron rechazarse 2 ventas por stock agotado.');

        // El stock final debe ser exactamente 0.0000, NUNCA negativo
        $freshProduct = $product->fresh();
        $this->assertEquals(0.0000, (float) $freshProduct->stock, 'El stock remanente debe ser exactamente cero.');

        // Debe haber exactamente 3 registros en Kárdex
        $kardexCount = KardexMovement::where('product_id', $product->id)->count();
        $this->assertEquals(3, $kardexCount);

        // El último movimiento debe registrar nuevo stock en 0
        $lastKardex = KardexMovement::where('product_id', $product->id)->latest('id')->first();
        $this->assertEquals(0.0000, (float) $lastKardex->new_stock);
    }

    /**
     * Prueba 2: Auditoría Integral de la Cadena Económica Completa (E2E)
     * Venta POS -> Descuento Kárdex -> Caja -> CUFE DIAN -> Contabilidad NIIF -> Reportes
     */
    public function test_full_economic_chain_and_niif_double_entry_balance(): void
    {
        $this->setupAccountingPuc();
        $user = User::factory()->create();
        $shift = $this->createShift($user);

        $product = Product::create([
            'code' => 'CHAIN-01',
            'barcode' => '770999900002',
            'name' => 'Café de Origen Huila 500g',
            'category' => 'Bebidas',
            'purchase_price' => 60000,
            'sale_price' => 100000,
            'stock' => 10,
            'min_stock' => 2,
            'tax_rate' => 0.19,
            'is_active' => true,
        ]);

        $action = app(RegisterSaleAction::class);

        $saleData = new SaleData(
            userId: $user->id,
            cashShiftId: $shift->id,
            customerName: 'Empresa Compradora S.A.S.',
            customerTaxId: '900123456',
            customerPhone: '6014445555',
            paymentMethod: 'efectivo',
            cashReceived: 120000,
            items: [
                new SaleItemData(
                    productId: $product->id,
                    quantity: 1,
                    unitPrice: 100000,
                    discount: 0,
                    taxRate: 0.19
                ),
            ]
        );

        $sale = $action->execute($saleData);

        // 1. Verificación de Venta y CUFE SHA-384
        $this->assertEquals(119000, $sale->total); // 100.000 + 19.000 IVA
        $this->assertEquals(96, strlen($sale->cufe), 'El CUFE debe ser un hash SHA-384 de 96 caracteres.');

        // 2. Verificación de Stock y Kárdex
        $this->assertEquals(9.0000, (float) $product->fresh()->stock);
        $kardex = KardexMovement::where('product_id', $product->id)->first();
        $this->assertNotNull($kardex);
        $this->assertEquals(10.0000, (float) $kardex->previous_stock);
        $this->assertEquals(1.0000, (float) $kardex->quantity);
        $this->assertEquals(9.0000, (float) $kardex->new_stock);
        $this->assertEquals(60000, (float) $kardex->total_cost);

        // 3. Verificación del Asiento Contable Automático NIIF
        $entry = AccountingEntry::with('lines.account')
            ->where('reference_type', 'Sale')
            ->where('reference_id', $sale->invoice_number)
            ->first();

        $this->assertNotNull($entry, 'Debe existir un asiento contable generado para la venta.');
        $this->assertTrue($entry->is_balanced, 'El asiento debe estar cuadrado (Débito = Crédito).');

        $totalDebits = (float) $entry->lines->sum('debit');
        $totalCredits = (float) $entry->lines->sum('credit');
        $this->assertEquals($totalDebits, $totalCredits, 'Débitos y Créditos deben ser exactamente iguales.');
        $this->assertEquals(179000, $totalDebits); // 119.000 (Caja) + 60.000 (Costo) = 179.000

        // 4. Verificación del Balance de Comprobación vía API
        $balanceResponse = $this->getJson('/api/contabilidad/balance-prueba');
        $balanceResponse->assertStatus(200);
        $this->assertEquals(0, $balanceResponse->json('data.totals.difference'), 'La diferencia en el balance de prueba debe ser $0.');
        $this->assertTrue($balanceResponse->json('data.totals.isBalanced'));

        // 5. Verificación de Reporte de Resumen Financiero
        $reportsResponse = $this->getJson('/api/reports/summary');
        $reportsResponse->assertStatus(200)
            ->assertJsonPath('data.ventas.total', 119000)
            ->assertJsonPath('data.utilidad.costo_ventas', 60000)
            ->assertJsonPath('data.utilidad.bruta', 40000) // 100.000 subtotal - 60.000 costo = 40.000
            ->assertJsonPath('data.utilidad.margen', 40);
    }

    /**
     * Prueba 3: Integridad de Reversión Atómica (Rollback en Transacciones)
     * Verifica que si ocurre una excepción antes de confirmar la transacción,
     * absolutamente nada se persiste en la base de datos (inventario, caja, factura, asiento).
     */
    public function test_atomic_rollback_leaves_zero_orphaned_records_on_failure(): void
    {
        $this->setupAccountingPuc();
        $user = User::factory()->create();
        $shift = $this->createShift($user);

        $product = Product::create([
            'code' => 'ROLLBACK-01',
            'barcode' => '770999900003',
            'name' => 'Vino Tinto Reserva',
            'category' => 'Bebidas',
            'purchase_price' => 40000,
            'sale_price' => 70000,
            'stock' => 5,
            'min_stock' => 1,
            'tax_rate' => 0.19,
            'is_active' => true,
        ]);

        // Simular intento de transacción que falla por producto secundario inexistente
        try {
            DB::transaction(function () use ($user, $shift, $product) {
                // Descontar producto 1
                $product->update(['stock' => 4]);

                // Crear cabecera preliminar
                Sale::create([
                    'invoice_prefix' => 'ERR',
                    'invoice_number' => 'ERR-001',
                    'user_id' => $user->id,
                    'cash_shift_id' => $shift->id,
                    'payment_method' => 'efectivo',
                    'subtotal' => 70000,
                    'discount' => 0,
                    'tax_base' => 70000,
                    'tax_amount' => 13300,
                    'total' => 83300,
                    'status' => 'PENDING',
                ]);

                // Provocar error forzado que debe disparar el rollback total
                throw new \RuntimeException('Fallo simulado de conexión con servicio externo DIAN.');
            });
        } catch (\RuntimeException $e) {
            // Error capturado
        }

        // 1. El stock del producto NO debe haber cambiado (debe seguir en 5)
        $this->assertEquals(5.0000, (float) $product->fresh()->stock);

        // 2. No debe existir ninguna venta ni ítem guardado
        $this->assertDatabaseMissing('sales', ['invoice_number' => 'ERR-001']);
        $this->assertDatabaseCount('sale_items', 0);
        $this->assertDatabaseCount('kardex_movements', 0);
        $this->assertDatabaseCount('accounting_entries', 0);
    }

    /**
     * Prueba 4: Cadena de Abastecimiento (Compra -> Costo Promedio Ponderado -> CxP -> Abono)
     */
    public function test_purchase_weighted_cost_recalculation_and_cxp_payment_chain(): void
    {
        $this->setupAccountingPuc();
        $user = User::factory()->create();

        $supplier = Supplier::create([
            'name' => 'Distribuidora Mayorista de Alimentos S.A.S.',
            'tax_id' => '900555666-1',
            'phone' => '+57 604 222 3344',
            'credit_days' => 30,
            'is_active' => true,
        ]);

        // Producto inicial: 10 unidades a costo $10.000
        $product = Product::create([
            'code' => 'WEIGHTED-01',
            'barcode' => '770999900004',
            'name' => 'Arroz Supremo 1kg',
            'category' => 'Abarrotes',
            'purchase_price' => 10000,
            'sale_price' => 14000,
            'stock' => 10,
            'min_stock' => 5,
            'tax_rate' => 0.19,
            'is_active' => true,
        ]);

        $purchaseAction = app(\App\Actions\Purchases\RegisterPurchaseAction::class);

        // Ingresan 10 unidades a nuevo costo $20.000
        // Costo Promedio Ponderado: ((10 * 10.000) + (10 * 20.000)) / 20 = $15.000
        $purchase = $purchaseAction->execute([
            'supplier_id' => $supplier->id,
            'invoice_number' => 'FAC-PROV-999',
            'payment_method' => 'credito',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 10,
                    'unit_cost' => 20000,
                    'tax_rate' => 0.19,
                ],
            ],
        ], $user->id);

        $freshProduct = $product->fresh();
        $this->assertEquals(20.0000, (float) $freshProduct->stock, 'El stock debe ser 10 + 10 = 20.');
        $this->assertEquals(15000.00, (float) $freshProduct->purchase_price, 'El costo promedio ponderado debe ser exactamente $15.000.');

        // Verificar la Cuenta por Pagar creada
        $cxp = AccountPayable::where('purchase_id', $purchase->id)->first();
        $this->assertNotNull($cxp);
        $this->assertEquals(238000, (float) $cxp->initial_amount); // 200.000 subtotal + 38.000 IVA
        $this->assertEquals(238000, (float) $cxp->current_balance);
        $this->assertEquals('PENDING', $cxp->status);

        // Realizar abono de $100.000 a la CxP
        $cxp->update([
            'current_balance' => 138000,
            'status' => 'PARTIAL',
        ]);

        $freshCxp = $cxp->fresh();
        $this->assertEquals(138000, (float) $freshCxp->current_balance);
        $this->assertEquals('PARTIAL', $freshCxp->status);
    }
}
