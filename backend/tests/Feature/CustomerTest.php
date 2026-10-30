<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_can_list_customers(): void
    {
        Customer::create([
            'document_type' => 'CC',
            'document_number' => '1020304050',
            'full_name' => 'Carlos Andrés Restrepo',
            'email' => 'carlos@example.com',
            'phone' => '3001234567',
            'status' => 'activo',
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/customers');

        $response->assertStatus(200)
            ->assertJsonStructure(['data'])
            ->assertJsonFragment(['full_name' => 'Carlos Andrés Restrepo']);
    }

    public function test_can_create_customer(): void
    {
        $payload = [
            'document_type' => 'NIT',
            'document_number' => '900123456',
            'dv' => '7',
            'full_name' => 'Inversiones Antioquia SAS',
            'trade_name' => 'Antioquia SAS',
            'email' => 'facturacion@antioquia.com',
            'phone' => '6044445566',
            'address' => 'Cra 43A # 1-50',
            'city' => 'Medellín',
            'department' => 'Antioquia',
            'customer_type' => 'mayorista',
            'fiscal_regime' => 'Responsable de IVA',
            'credit_limit' => 5000000,
            'credit_days' => 30,
            'status' => 'activo',
        ];

        $response = $this->actingAs($this->user)->postJson('/api/customers', $payload);

        $response->assertStatus(201)
            ->assertJsonFragment(['full_name' => 'Inversiones Antioquia SAS']);

        $this->assertDatabaseHas('customers', [
            'document_number' => '900123456',
            'credit_limit' => 5000000,
        ]);
    }

    public function test_can_update_customer(): void
    {
        $customer = Customer::create([
            'document_type' => 'CC',
            'document_number' => '12345678',
            'full_name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'phone' => '3110000000',
            'status' => 'activo',
        ]);

        $response = $this->actingAs($this->user)->putJson("/api/customers/{$customer->id}", [
            'document_number' => '12345678',
            'full_name' => 'Juan Pérez Editado',
            'phone' => '3119999999',
            'email' => 'juan_edit@example.com',
            'status' => 'activo',
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['full_name' => 'Juan Pérez Editado']);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'phone' => '3119999999',
        ]);
    }

    public function test_can_toggle_customer_status(): void
    {
        $customer = Customer::create([
            'document_type' => 'CC',
            'document_number' => '77788899',
            'full_name' => 'Maria Gómez',
            'status' => 'activo',
        ]);

        $response = $this->actingAs($this->user)->patchJson("/api/customers/{$customer->id}/toggle-status");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'inactivo');

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'status' => 'inactivo',
        ]);
    }
}
