<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PriceTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_can_check_product_price_and_tiers(): void
    {
        $product = Product::create([
            'code' => 'CHECK-01',
            'barcode' => '770000000001',
            'name' => 'Arroz Especial 1000g',
            'category' => 'Granos',
            'purchase_price' => 3000,
            'sale_price' => 5000,
            'stock' => 100,
            'tax_rate' => 0.19,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/pricing/check/770000000001');

        $response->assertStatus(200)
            ->assertJsonPath('data.product.sale_price', 5000)
            ->assertJsonPath('data.product.margin_pct', 40)
            ->assertJsonStructure([
                'data' => [
                    'product',
                    'tiers' => [
                        'minorista',
                        'mayorista',
                        'distribuidor',
                    ],
                ],
            ]);
    }

    public function test_can_batch_update_prices_by_percentage(): void
    {
        Product::create([
            'code' => 'BATCH-01',
            'barcode' => '770000000002',
            'name' => 'Aceite 1000ml',
            'category' => 'Abarrotes',
            'purchase_price' => 8000,
            'sale_price' => 10000,
            'stock' => 50,
            'tax_rate' => 0.19,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)->postJson('/api/pricing/batch-update', [
            'category' => 'Abarrotes',
            'adjustment_type' => 'percentage',
            'operation' => 'increase',
            'value' => 10, // 10% increase => 10000 * 1.10 = 11000
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('updated_count', 1);

        $this->assertDatabaseHas('products', [
            'code' => 'BATCH-01',
            'sale_price' => 11000,
        ]);
    }
}
