<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_can_create_product(): void
    {
        $payload = [
            'code' => 'PROD-001',
            'barcode' => '7701234567890',
            'name' => 'Café Especial 500g',
            'category' => 'Bebidas',
            'brand' => 'Juan Valdez',
            'purchase_price' => 15000,
            'sale_price' => 24000,
            'stock' => 50,
            'min_stock' => 10,
            'tax_rate' => 0.19,
            'color' => '#f59e0b',
        ];

        $response = $this->actingAs($this->user)->postJson('/api/pos/products', $payload);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Café Especial 500g']);

        $this->assertDatabaseHas('products', [
            'code' => 'PROD-001',
            'barcode' => '7701234567890',
        ]);
    }

    public function test_can_update_product(): void
    {
        $product = Product::create([
            'code' => 'PROD-002',
            'barcode' => '7709876543210',
            'name' => 'Leche Entera 1L',
            'category' => 'Lácteos',
            'purchase_price' => 3000,
            'sale_price' => 4500,
            'stock' => 20,
            'min_stock' => 5,
            'tax_rate' => 0.00,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)->putJson("/api/pos/products/{$product->id}", [
            'code' => 'PROD-002',
            'barcode' => '7709876543210',
            'name' => 'Leche Deslactosada 1L',
            'category' => 'Lácteos',
            'purchase_price' => 3200,
            'sale_price' => 4800,
            'stock' => 25,
            'min_stock' => 5,
            'tax_rate' => 0.00,
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Leche Deslactosada 1L']);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Leche Deslactosada 1L',
            'sale_price' => 4800,
        ]);
    }

    public function test_can_toggle_product_status(): void
    {
        $product = Product::create([
            'code' => 'PROD-003',
            'barcode' => '7705556667778',
            'name' => 'Galletas Integrales',
            'category' => 'Snacks',
            'purchase_price' => 1200,
            'sale_price' => 2000,
            'stock' => 15,
            'min_stock' => 5,
            'tax_rate' => 0.19,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)->patchJson("/api/pos/products/{$product->id}/toggle-active");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'is_active' => false,
        ]);
    }
}
