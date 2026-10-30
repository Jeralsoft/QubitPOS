<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\CompanySetting;
use App\Models\DianResolution;
use App\Models\DianSetting;
use App\Models\SystemRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_and_update_company_profile(): void
    {
        $getResponse = $this->getJson('/api/settings/company');
        $getResponse->assertStatus(200)
            ->assertJsonPath('data.trade_name', 'QUBIT POS');

        $updateResponse = $this->postJson('/api/settings/company', [
            'trade_name' => 'QUBIT POS COLOMBIA',
            'legal_name' => 'Qubit Soluciones POS S.A.S.',
            'nit' => '901.456.789-3',
            'dv' => '3',
            'phone' => '+57 300 123 4567',
            'email' => 'soporte@qubitpos.co',
            'address' => 'Cra 43A # 7-50, Poblado',
            'city' => 'Medellín',
            'department' => 'Antioquia',
            'website' => 'https://qubitpos.co',
        ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.trade_name', 'QUBIT POS COLOMBIA')
            ->assertJsonPath('data.address', 'Cra 43A # 7-50, Poblado');

        $this->assertDatabaseHas('company_settings', [
            'trade_name' => 'QUBIT POS COLOMBIA',
        ]);
    }

    public function test_can_get_and_update_dian_technical_parameters(): void
    {
        $getResponse = $this->getJson('/api/settings/dian');
        $getResponse->assertStatus(200)
            ->assertJsonPath('data.environment', 'Pruebas');

        $updateResponse = $this->postJson('/api/settings/dian', [
            'environment' => 'Producción',
            'company_type' => 'Persona jurídica',
            'fiscal_responsibility' => 'O-47 Régimen Simple de Tributación',
            'software_id' => 'SW-PROD-999',
            'software_pin' => '54321',
            'test_set_id' => 'b2c3d4e5-1111-2222-3333-444455556666',
            'technical_key' => 'a1b2c3d4e5f6g7h8i9j0',
            'is_connected' => true,
            'is_auto_send' => true,
        ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.environment', 'Producción')
            ->assertJsonPath('data.software_id', 'SW-PROD-999');

        $this->assertDatabaseHas('dian_settings', [
            'environment' => 'Producción',
            'software_id' => 'SW-PROD-999',
        ]);
    }

    public function test_can_manage_branches_and_cash_registers(): void
    {
        // 1. Crear sucursal
        $branchResponse = $this->postJson('/api/settings/branches', [
            'code' => 'SUC-OCC',
            'name' => 'Sucursal Occidente',
            'address' => 'Av San Juan # 70-10',
            'phone' => '+57 604 444 3322',
            'city' => 'Medellín',
            'department' => 'Antioquia',
            'is_active' => true,
        ]);

        $branchResponse->assertStatus(201)
            ->assertJsonPath('data.code', 'SUC-OCC');

        $branchId = $branchResponse->json('data.id');

        // 2. Crear caja vinculada
        $registerResponse = $this->postJson('/api/settings/cash-registers', [
            'branch_id' => $branchId,
            'name' => 'Caja Rápida 01',
            'terminal_code' => 'TERM-OCC-01',
            'is_active' => true,
        ]);

        $registerResponse->assertStatus(201)
            ->assertJsonPath('data.name', 'Caja Rápida 01');

        $listBranches = $this->getJson('/api/settings/branches');
        $listBranches->assertStatus(200)
            ->assertJsonFragment(['code' => 'SUC-OCC']);
    }

    public function test_can_create_and_list_dian_resolutions(): void
    {
        $response = $this->postJson('/api/settings/resolutions', [
            'resolution_number' => '18764000888999',
            'prefix' => 'FE',
            'range_from' => 1,
            'range_to' => 20000,
            'current_number' => 1,
            'issued_at' => '2026-03-01',
            'expires_at' => '2028-03-01',
            'status' => 'Vigente',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.resolution_number', '18764000888999');

        $this->assertDatabaseHas('dian_resolutions', [
            'resolution_number' => '18764000888999',
            'prefix' => 'FE',
        ]);
    }

    public function test_can_list_roles_and_permissions(): void
    {
        SystemRole::firstOrCreate(
            ['name' => 'Auditor Externo'],
            ['description' => 'Consulta de libros e integridad', 'tone' => 'neutral']
        );

        $rolesResponse = $this->getJson('/api/settings/roles');
        $rolesResponse->assertStatus(200);

        $permsResponse = $this->getJson('/api/settings/permissions');
        $permsResponse->assertStatus(200);
    }
}
