<?php

namespace Tests\Feature;

use App\Models\CashShift;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class POSSaleTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_register_atomic_pos_sale(): void
    {
        // 1. Arrange: Usuario, Producto y Turno de Caja Abierto
        $user = User::factory()->create();

        $product = Product::create([
            'code' => 'BEB-0001',
            'barcode' => '7702001000012',
            'name' => 'Coca-Cola 600ml',
            'category' => 'Bebidas',
            'purchase_price' => 2400.00,
            'sale_price' => 3500.00,
            'stock' => 10,
            'min_stock' => 2,
            'tax_rate' => 0.1900,
        ]);

        $shift = CashShift::create([
            'user_id' => $user->id,
            'register_name' => 'Caja #001',
            'branch_name' => 'Sede Principal',
            'opening_balance' => 300000.00,
            'status' => 'OPEN',
        ]);

        // 2. Act: Registrar Venta vía Endpoint POST api/pos/sales
        $response = $this->actingAs($user)->postJson('/api/pos/sales', [
            'cash_shift_id' => $shift->id,
            'customer_name' => 'María Camila Rodríguez',
            'customer_tax_id' => '1020345678',
            'payment_method' => 'efectivo',
            'cash_received' => 10000.00,
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                    'unit_price' => 3500.00,
                    'discount' => 0,
                    'tax_rate' => 0.19,
                ],
            ],
        ]);

        // 3. Assert: HTTP 201 Created y Contrato JSON
        $response->assertStatus(201)
            ->assertJsonPath('data.customer.name', 'María Camila Rodríguez')
            ->assertJsonPath('data.paymentMethod', 'efectivo')
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'invoiceNumber',
                    'totals' => ['subtotal', 'taxBase', 'taxAmount', 'total', 'cashChange'],
                    'cufe',
                    'qrData',
                ],
            ]);

        // 4. Assert: Descuento atómico en existencias de producto
        $this->assertEquals(8, (float) $product->fresh()->stock);

        // 5. Assert: Registro inmutable en Kárdex
        $this->assertDatabaseHas('kardex_movements', [
            'product_id' => $product->id,
            'movement_type' => 'SALE',
            'quantity' => 2,
            'previous_stock' => 10,
            'new_stock' => 8,
        ]);
    }

    public function test_rejects_sale_with_insufficient_stock(): void
    {
        $user = User::factory()->create();

        $product = Product::create([
            'code' => 'BEB-0001',
            'barcode' => '7702001000012',
            'name' => 'Coca-Cola 600ml',
            'category' => 'Bebidas',
            'purchase_price' => 2400.00,
            'sale_price' => 3500.00,
            'stock' => 1,
            'min_stock' => 0,
            'tax_rate' => 0.1900,
        ]);

        $shift = CashShift::create([
            'user_id' => $user->id,
            'register_name' => 'Caja #001',
            'branch_name' => 'Sede Principal',
            'opening_balance' => 300000.00,
            'status' => 'OPEN',
        ]);

        // Intentar vender 5 unidades cuando solo hay 1
        $response = $this->actingAs($user)->postJson('/api/pos/sales', [
            'cash_shift_id' => $shift->id,
            'customer_name' => 'Consumidor final',
            'customer_tax_id' => '222222222222',
            'payment_method' => 'efectivo',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 5,
                    'unit_price' => 3500.00,
                ],
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['items']);

        // Las existencias permanecen intactas (Rollback)
        $this->assertEquals(1, (float) $product->fresh()->stock);
    }
}
