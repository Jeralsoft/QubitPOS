<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\PayrollNovelty;
use App\Models\PayrollPeriod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PayrollEngineTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_liquidate_payroll_period_with_cst_rules_and_cune(): void
    {
        $user = User::factory()->create();

        // 1. Empleado con Salario Básico ($2.100.000 <= 2 SMMLV, tiene auxilio de transporte)
        $employee = Employee::create([
            'code' => 'EMP-001',
            'first_name' => 'Laura',
            'last_name' => 'Martínez',
            'document_type' => 'CC',
            'document_number' => '1032456789',
            'role' => 'Cajera / Vendedora',
            'department' => 'Ventas',
            'start_date' => '2024-01-15',
            'base_salary' => 2100000.00,
            'has_transport_allowance' => true,
            'status' => 'activo',
        ]);

        // 2. Periodo de Nómina
        $period = PayrollPeriod::create([
            'name' => 'Nómina Mensual Octubre 2026',
            'start_date' => '2026-10-01',
            'end_date' => '2026-10-31',
            'period_type' => 'mensual',
            'status' => 'DRAFT',
        ]);

        // 3. Novedad de comisión por ventas ($200.000)
        PayrollNovelty::create([
            'employee_id' => $employee->id,
            'payroll_period_id' => $period->id,
            'novelty_type' => 'COMISION',
            'amount' => 200000.00,
            'status' => 'APROBADA',
        ]);

        // 4. Act: Liquidar Periodo vía API
        $res = $this->actingAs($user)->postJson("/api/nomina/periods/{$period->id}/liquidate");

        $res->assertStatus(200)
            ->assertJsonPath('data.status', 'APPROVED');

        // 5. Validar Cálculos Laborales CST:
        // Devengado: Salario (2.100.000) + Transporte (162.000) + Comisión (200.000) = 2.462.000
        // IBC (sin auxilio de transporte): 2.300.000
        // Salud 4%: 92.000
        // Pensión 4%: 92.000
        // Total Deducciones: 184.000
        // Neto a Pagar: 2.462.000 - 184.000 = 2.278.000
        $this->assertDatabaseHas('payroll_slips', [
            'payroll_period_id' => $period->id,
            'employee_id' => $employee->id,
            'total_devengado' => 2462000.00,
            'health_deduction' => 92000.00,
            'pension_deduction' => 92000.00,
            'total_deducciones' => 184000.00,
            'net_paid' => 2278000.00,
        ]);

        $slip = $period->fresh()->slips()->first();
        $this->assertNotNull($slip->cune);
        $this->assertEquals(96, strlen($slip->cune)); // CUNE SHA-384 oficial de 96 caracteres

        // 6. Validar Asiento Contable Automático NIIF generado (Fase 5 Engine)
        $this->assertDatabaseHas('accounting_entries', [
            'entry_type' => 'NOMINA',
            'reference_type' => 'PayrollPeriod',
            'reference_id' => (string) $period->id,
            'is_balanced' => true,
        ]);

        $entry = \App\Models\AccountingEntry::where('entry_type', 'NOMINA')->first();
        $this->assertEquals((float) $entry->total_debit, (float) $entry->total_credit);
        $this->assertEquals(2462000.00, (float) $entry->total_debit);
    }

    public function test_can_download_payroll_xml_ubl21(): void
    {
        $user = User::factory()->create();

        $employee = Employee::create([
            'code' => 'EMP-002',
            'first_name' => 'Carlos',
            'last_name' => 'Ramírez',
            'document_type' => 'CC',
            'document_number' => '79456123',
            'role' => 'Administrador',
            'department' => 'Administración',
            'start_date' => '2023-05-01',
            'base_salary' => 3800000.00,
            'has_transport_allowance' => false,
            'status' => 'activo',
        ]);

        $period = PayrollPeriod::create([
            'name' => 'Nómina Quincenal Octubre 2026',
            'start_date' => '2026-10-01',
            'end_date' => '2026-10-15',
            'status' => 'DRAFT',
        ]);

        $this->actingAs($user)->postJson("/api/nomina/periods/{$period->id}/liquidate");

        $slip = $period->fresh()->slips()->first();
        $this->assertNotNull($slip);

        $res = $this->get("/api/nomina/slips/{$slip->id}/xml");

        $res->assertStatus(200)
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
            ->assertSee('NominaIndividual')
            ->assertSee('Carlos')
            ->assertSee('Ramírez')
            ->assertSee($slip->cune);
    }

    public function test_can_manage_employees_crud(): void
    {
        $user = User::factory()->create();

        // 1. Create employee
        $createRes = $this->actingAs($user)->postJson('/api/nomina/employees', [
            'first_name' => 'Ana',
            'last_name' => 'Gómez',
            'document_type' => 'CC',
            'document_number' => '52123456',
            'phone' => '3001234567',
            'email' => 'ana.gomez@empresa.com',
            'role' => 'Contadora',
            'department' => 'Finanzas',
            'branch' => 'Sede Principal',
            'contract_type' => 'indefinido',
            'start_date' => '2025-01-01',
            'base_salary' => 3500000.00,
            'has_transport_allowance' => false,
            'status' => 'activo',
        ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('data.first_name', 'Ana')
            ->assertJsonPath('data.salary', 3500000);

        $employeeId = $createRes->json('data.id');

        // 2. Update employee
        $updateRes = $this->actingAs($user)->putJson("/api/nomina/employees/{$employeeId}", [
            'first_name' => 'Ana María',
            'last_name' => 'Gómez',
            'document_type' => 'CC',
            'document_number' => '52123456',
            'role' => 'Directora Financiera',
            'department' => 'Finanzas',
            'start_date' => '2025-01-01',
            'base_salary' => 4500000.00,
            'has_transport_allowance' => false,
            'status' => 'activo',
        ]);

        $updateRes->assertStatus(200)
            ->assertJsonPath('data.first_name', 'Ana María')
            ->assertJsonPath('data.salary', 4500000);

        // 3. Toggle employee status
        $toggleRes = $this->actingAs($user)->patchJson("/api/nomina/employees/{$employeeId}/toggle-status");
        $toggleRes->assertStatus(200)
            ->assertJsonPath('data.status', 'inactivo');

        // 4. Delete employee without slips
        $delRes = $this->actingAs($user)->deleteJson("/api/nomina/employees/{$employeeId}");
        $delRes->assertStatus(200);
        $this->assertDatabaseMissing('employees', ['id' => $employeeId]);
    }

    public function test_can_manage_periods_and_novelties(): void
    {
        $user = User::factory()->create();

        $employee = Employee::create([
            'code' => 'EMP-003',
            'first_name' => 'Mateo',
            'last_name' => 'López',
            'document_type' => 'CC',
            'document_number' => '98765432',
            'role' => 'Auxiliar Bodega',
            'department' => 'Logística',
            'start_date' => '2024-06-01',
            'base_salary' => 1500000.00,
            'has_transport_allowance' => true,
            'status' => 'activo',
        ]);

        // 1. Create Period
        $periodRes = $this->actingAs($user)->postJson('/api/nomina/periods', [
            'name' => 'Nómina Noviembre 2026',
            'start_date' => '2026-11-01',
            'end_date' => '2026-11-30',
            'period_type' => 'mensual',
        ]);

        $periodRes->assertStatus(201);
        $periodId = $periodRes->json('data.id');

        // 2. Create Novelty
        $noveltyRes = $this->actingAs($user)->postJson('/api/nomina/novelties', [
            'employee_id' => $employee->id,
            'payroll_period_id' => $periodId,
            'novelty_type' => 'HORA_EXTRA_DIURNA',
            'quantity' => 4,
            'amount' => 45000.00,
            'notes' => 'Horas extras por inventario general',
        ]);

        $noveltyRes->assertStatus(201);
        $noveltyId = $noveltyRes->json('data.id');

        // 3. Delete Novelty
        $delNoveltyRes = $this->actingAs($user)->deleteJson("/api/nomina/novelties/{$noveltyId}");
        $delNoveltyRes->assertStatus(200);
        $this->assertDatabaseMissing('payroll_novelties', ['id' => $noveltyId]);

        // 4. Delete Draft Period
        $delPeriodRes = $this->actingAs($user)->deleteJson("/api/nomina/periods/{$periodId}");
        $delPeriodRes->assertStatus(200);
        $this->assertDatabaseMissing('payroll_periods', ['id' => $periodId]);
    }
}
