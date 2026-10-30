<?php

namespace Tests\Feature;

use App\Models\CashShift;
use App\Models\KardexMovement;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

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

    public function test_can_get_reports_summary_with_financial_indicators(): void
    {
        $user = User::factory()->create();
        $shift = $this->createShift($user);

        // 1. Crear producto con stock y precio
        $product = Product::create([
            'code' => 'TEST-001',
            'barcode' => '770000000001',
            'name' => 'Café Especial 500g',
            'category' => 'Bebidas',
            'purchase_price' => 15000,
            'sale_price' => 25000,
            'stock' => 10,
            'min_stock' => 5,
            'tax_rate' => 0.19,
            'is_active' => true,
        ]);

        // 2. Crear venta
        $sale = Sale::create([
            'invoice_prefix' => 'SETT',
            'invoice_number' => '101',
            'user_id' => $user->id,
            'cash_shift_id' => $shift->id,
            'customer_name' => 'Cliente General',
            'customer_tax_id' => '222222222222',
            'payment_method' => 'EFECTIVO',
            'subtotal' => 50000,
            'discount' => 0,
            'tax_base' => 50000,
            'tax_amount' => 9500,
            'total' => 59500,
            'cash_received' => 60000,
            'cash_change' => 500,
            'status' => 'COMPLETED',
        ]);

        SaleItem::create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 25000,
            'discount' => 0,
            'tax_rate' => 0.19,
            'tax_amount' => 9500,
            'total' => 59500,
        ]);

        // 3. Crear movimiento de Kárdex
        KardexMovement::create([
            'product_id' => $product->id,
            'movement_type' => 'SALIDA_VENTA',
            'previous_stock' => 12,
            'quantity' => 2,
            'new_stock' => 10,
            'unit_cost' => 15000,
            'total_cost' => 30000,
            'reference_type' => 'SALE',
            'reference_id' => $sale->id,
            'user_id' => $user->id,
        ]);

        // 4. Consultar /api/reports/summary
        $response = $this->getJson('/api/reports/summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'ventas' => ['total', 'subtotal', 'count'],
                    'compras' => ['total', 'count'],
                    'utilidad' => ['bruta', 'margen', 'costo_ventas'],
                    'inventario' => ['valorizacion', 'total_skus', 'stock_bajo_count'],
                    'cartera' => ['total_pendiente', 'vencida'],
                    'cxp' => ['total_pendiente', 'vence_esta_semana'],
                ],
            ]);

        $data = $response->json('data');
        $this->assertEquals(59500, $data['ventas']['total']);
        $this->assertEquals(50000, $data['ventas']['subtotal']);
        $this->assertEquals(30000, $data['utilidad']['costo_ventas']);
        $this->assertEquals(20000, $data['utilidad']['bruta']); // 50000 subtotal - 30000 costo
        $this->assertEquals(40.0, $data['utilidad']['margen']); // 20000 / 50000 = 40%
        $this->assertEquals(150000, $data['inventario']['valorizacion']); // 10 unidades * 15000 costo
    }

    public function test_can_get_sales_report_by_product(): void
    {
        $user = User::factory()->create();
        $shift = $this->createShift($user);

        $product = Product::create([
            'code' => 'PROD-X',
            'barcode' => '770000000002',
            'name' => 'Galletas Artesanales',
            'category' => 'Snacks',
            'purchase_price' => 3000,
            'sale_price' => 5000,
            'stock' => 50,
            'min_stock' => 10,
            'tax_rate' => 0.19,
            'is_active' => true,
        ]);

        $sale = Sale::create([
            'invoice_prefix' => 'SETT',
            'invoice_number' => '102',
            'user_id' => $user->id,
            'cash_shift_id' => $shift->id,
            'payment_method' => 'EFECTIVO',
            'subtotal' => 15000,
            'discount' => 0,
            'tax_base' => 15000,
            'tax_amount' => 2850,
            'total' => 17850,
            'status' => 'COMPLETED',
        ]);

        SaleItem::create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'quantity' => 3,
            'unit_price' => 5000,
            'discount' => 0,
            'tax_rate' => 0.19,
            'tax_amount' => 2850,
            'total' => 17850,
        ]);

        $response = $this->getJson('/api/reports/sales?group_by=product');

        $response->assertStatus(200)
            ->assertJsonPath('data.report_type', 'ventas-producto');

        $rows = $response->json('data.rows');
        $this->assertNotEmpty($rows);
        $this->assertEquals('PROD-X', $rows[0]['code']);
        $this->assertEquals(3, $rows[0]['quantity']);
    }

    public function test_can_get_inventory_valuation_and_kardex(): void
    {
        $user = User::factory()->create();

        $product = Product::create([
            'code' => 'VAL-1',
            'barcode' => '770000000003',
            'name' => 'Queso Campesino',
            'category' => 'Lácteos',
            'purchase_price' => 8000,
            'sale_price' => 12000,
            'stock' => 20,
            'min_stock' => 5,
            'tax_rate' => 0,
            'is_active' => true,
        ]);

        KardexMovement::create([
            'product_id' => $product->id,
            'movement_type' => 'ENTRADA_COMPRA',
            'previous_stock' => 0,
            'quantity' => 20,
            'new_stock' => 20,
            'unit_cost' => 8000,
            'total_cost' => 160000,
            'reference_type' => 'INITIAL',
            'reference_id' => 1,
            'user_id' => $user->id,
        ]);

        $valResponse = $this->getJson('/api/reports/inventory?type=valorizacion');
        $valResponse->assertStatus(200)
            ->assertJsonPath('data.report_type', 'inv-valorizacion');

        $kardexResponse = $this->getJson('/api/reports/inventory?type=kardex');
        $kardexResponse->assertStatus(200)
            ->assertJsonPath('data.report_type', 'inv-kardex');
        $this->assertCount(1, $kardexResponse->json('data.movements'));
    }

    public function test_can_get_cash_audit_report(): void
    {
        $user = User::factory()->create();

        CashShift::create([
            'user_id' => $user->id,
            'register_name' => 'Caja 01',
            'branch_name' => 'Sede Principal',
            'opened_at' => now()->subHours(8),
            'closed_at' => now(),
            'opening_balance' => 100000,
            'closing_balance_expected' => 250000,
            'closing_balance_counted' => 250000,
            'difference' => 0,
            'status' => 'CLOSED',
        ]);

        $response = $this->getJson('/api/reports/cash-audit');
        $response->assertStatus(200)
            ->assertJsonPath('data.totals.total_shifts', 1)
            ->assertJsonPath('data.totals.total_closed', 1)
            ->assertJsonPath('data.totals.total_differences', 0);
    }
}
