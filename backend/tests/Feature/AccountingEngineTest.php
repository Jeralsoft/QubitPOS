<?php

namespace Tests\Feature;

use App\Models\AccountReceivable;
use App\Models\CashShift;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountingEngineTest extends TestCase
{
    use RefreshDatabase;

    public function test_sale_generates_balanced_double_entry_accounting(): void
    {
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

        // Registrar venta
        $res = $this->actingAs($user)->postJson('/api/pos/sales', [
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

        $res->assertStatus(201);

        // Verificar que se creó el asiento contable automático
        $this->assertDatabaseHas('accounting_entries', [
            'entry_type' => 'VENTA',
            'reference_type' => 'Sale',
            'is_balanced' => true,
        ]);

        $entry = \App\Models\AccountingEntry::where('entry_type', 'VENTA')->first();
        $this->assertNotNull($entry);
        $this->assertEquals((float) $entry->total_debit, (float) $entry->total_credit);

        // Debe tener líneas para Caja (110505), Ingreso (413501) e IVA (240801)
        $this->assertDatabaseHas('accounting_entry_lines', [
            'accounting_entry_id' => $entry->id,
            'debit' => 8330.00,
            'credit' => 0.00,
        ]);
        $this->assertDatabaseHas('accounting_entry_lines', [
            'accounting_entry_id' => $entry->id,
            'debit' => 0.00,
            'credit' => 7000.00,
        ]);
        $this->assertDatabaseHas('accounting_entry_lines', [
            'accounting_entry_id' => $entry->id,
            'debit' => 0.00,
            'credit' => 1330.00,
        ]);
    }

    public function test_purchase_generates_balanced_accounting_entry(): void
    {
        $user = User::factory()->create();

        $supplier = Supplier::create([
            'name' => 'Distribuidora Andina S.A.S.',
            'tax_id' => '901458321-4',
            'status' => 'activo',
        ]);

        $product = Product::create([
            'code' => 'BEB-0001',
            'barcode' => '7702001000012',
            'name' => 'Coca-Cola 600ml',
            'category' => 'Bebidas',
            'purchase_price' => 2000.00,
            'sale_price' => 3500.00,
            'stock' => 5,
            'min_stock' => 1,
            'tax_rate' => 0.1900,
        ]);

        $res = $this->actingAs($user)->postJson('/api/purchases', [
            'invoice_number' => 'FAC-7788',
            'supplier_id' => $supplier->id,
            'payment_method' => 'credito',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 10,
                    'unit_cost' => 2000.00,
                    'tax_rate' => 0.19,
                ],
            ],
        ]);

        $res->assertStatus(201);

        $this->assertDatabaseHas('accounting_entries', [
            'entry_type' => 'COMPRA',
            'reference_id' => 'FAC-7788',
            'is_balanced' => true,
        ]);

        $entry = \App\Models\AccountingEntry::where('entry_type', 'COMPRA')->first();
        $this->assertEquals((float) $entry->total_debit, (float) $entry->total_credit);
        $this->assertEquals(23800.00, (float) $entry->total_debit);
    }

    public function test_receivable_payment_generates_balanced_accounting_entry(): void
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

        $res = $this->actingAs($user)->postJson('/api/cartera/payments', [
            'account_receivable_id' => $receivable->id,
            'amount' => 25000.00,
            'payment_method' => 'efectivo',
            'reference_code' => 'REC-5544',
        ]);

        $res->assertStatus(201);

        $this->assertDatabaseHas('accounting_entries', [
            'entry_type' => 'COBRO',
            'reference_id' => 'REC-5544',
            'is_balanced' => true,
        ]);

        $entry = \App\Models\AccountingEntry::where('entry_type', 'COBRO')->first();
        $this->assertEquals(25000.00, (float) $entry->total_debit);
        $this->assertEquals(25000.00, (float) $entry->total_credit);
    }

    public function test_trial_balance_is_perfectly_balanced(): void
    {
        $user = User::factory()->create();

        // Generar una venta para poblar asientos
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

        $this->actingAs($user)->postJson('/api/pos/sales', [
            'cash_shift_id' => $shift->id,
            'customer_name' => 'María Camila Rodríguez',
            'customer_tax_id' => '1020345678',
            'payment_method' => 'efectivo',
            'cash_received' => 10000.00,
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                    'unit_price' => 3500.00,
                    'tax_rate' => 0.19,
                ],
            ],
        ]);

        $res = $this->getJson('/api/contabilidad/balance-prueba');

        $res->assertStatus(200)
            ->assertJsonPath('data.totals.isBalanced', true)
            ->assertJsonPath('data.totals.difference', 0);
    }
}
