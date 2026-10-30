<?php

namespace Tests\Feature;

use App\Models\AccountReceivable;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurchaseAndCarteraTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_register_purchase_and_update_weighted_average_cost_and_kardex(): void
    {
        $user = User::factory()->create();

        $supplier = Supplier::create([
            'name' => 'Distribuidora Andina S.A.S.',
            'tax_id' => '901458321-4',
            'phone' => '601 246 8135',
            'status' => 'activo',
        ]);

        $product = Product::create([
            'code' => 'BEB-0001',
            'barcode' => '7702001000012',
            'name' => 'Coca-Cola 600ml',
            'category' => 'Bebidas',
            'purchase_price' => 2000.00,
            'sale_price' => 3500.00,
            'stock' => 10,
            'min_stock' => 2,
            'tax_rate' => 0.1900,
        ]);

        // Registrar compra de 10 unidades a $3.000 c/u
        // Costo promedio esperado = ((10 * 2000) + (10 * 3000)) / 20 = 2500.00
        $response = $this->actingAs($user)->postJson('/api/purchases', [
            'invoice_number' => 'FAC-9842',
            'supplier_id' => $supplier->id,
            'purchase_date' => now()->toDateString(),
            'payment_method' => 'contado',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 10,
                    'unit_cost' => 3000.00,
                    'tax_rate' => 0.19,
                ],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.invoice_number', 'FAC-9842')
            ->assertJsonPath('data.payment_status', 'PAID');

        // Validar stock y costo promedio recalculado
        $refreshed = $product->fresh();
        $this->assertEquals(20.0, (float) $refreshed->stock);
        $this->assertEquals(2500.00, (float) $refreshed->purchase_price);

        // Validar registro en Kárdex
        $this->assertDatabaseHas('kardex_movements', [
            'product_id' => $product->id,
            'movement_type' => 'PURCHASE',
            'quantity' => 10,
            'previous_stock' => 10,
            'new_stock' => 20,
            'unit_cost' => 3000.00,
            'reference_id' => 'FAC-9842',
        ]);
    }

    public function test_purchase_on_credit_creates_account_payable(): void
    {
        $user = User::factory()->create();

        $supplier = Supplier::create([
            'name' => 'Comercializadora Nacional S.A.',
            'tax_id' => '800123456-1',
            'credit_days' => 45,
            'status' => 'activo',
        ]);

        $product = Product::create([
            'code' => 'PAN-0001',
            'barcode' => '7702001000029',
            'name' => 'Pan Tajado',
            'category' => 'Panadería',
            'purchase_price' => 5000.00,
            'sale_price' => 7500.00,
            'stock' => 5,
            'min_stock' => 1,
            'tax_rate' => 0.1900,
        ]);

        $response = $this->actingAs($user)->postJson('/api/purchases', [
            'invoice_number' => 'FAC-CRED-101',
            'supplier_id' => $supplier->id,
            'purchase_date' => now()->toDateString(),
            'payment_method' => 'credito',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 5,
                    'unit_cost' => 5000.00,
                    'tax_rate' => 0.19,
                ],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.payment_method', 'credito')
            ->assertJsonPath('data.payment_status', 'PENDING');

        // Validar creación de CxP
        $this->assertDatabaseHas('accounts_payable', [
            'supplier_id' => $supplier->id,
            'status' => 'PENDING',
        ]);
    }

    public function test_can_register_receivable_payment_and_update_balance(): void
    {
        $user = User::factory()->create();

        $receivable = AccountReceivable::create([
            'customer_name' => 'Carlos Andrés Ramírez',
            'customer_tax_id' => '79845123',
            'initial_amount' => 50000.00,
            'current_balance' => 50000.00,
            'due_date' => now()->addDays(15)->toDateString(),
            'status' => 'PENDING',
        ]);

        // 1. Abono parcial de $20.000
        $res1 = $this->actingAs($user)->postJson('/api/cartera/payments', [
            'account_receivable_id' => $receivable->id,
            'amount' => 20000.00,
            'payment_method' => 'efectivo',
            'reference_code' => 'ABN-001',
        ]);

        $res1->assertStatus(201);
        $this->assertEquals(30000.00, (float) $receivable->fresh()->current_balance);
        $this->assertEquals('PARTIAL', $receivable->fresh()->status);

        // 2. Abono final de $30.000
        $res2 = $this->actingAs($user)->postJson('/api/cartera/payments', [
            'account_receivable_id' => $receivable->id,
            'amount' => 30000.00,
            'payment_method' => 'transferencia',
            'reference_code' => 'NEQUI-9988',
        ]);

        $res2->assertStatus(201);
        $this->assertEquals(0.00, (float) $receivable->fresh()->current_balance);
        $this->assertEquals('PAID', $receivable->fresh()->status);

        // 3. Intento de abono excesivo debe ser rechazado
        $res3 = $this->actingAs($user)->postJson('/api/cartera/payments', [
            'account_receivable_id' => $receivable->id,
            'amount' => 5000.00,
            'payment_method' => 'efectivo',
        ]);

        $res3->assertStatus(422);
    }
}
