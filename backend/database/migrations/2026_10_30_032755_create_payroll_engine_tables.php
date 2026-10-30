<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Empleados y Personal (CST Colombia)
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique()->index(); // Ej: EMP-001
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('document_type', 10)->default('CC'); // CC, CE, PAS, TI
            $table->string('document_number', 30)->unique()->index();
            $table->string('phone', 50)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('role', 100);       // Cargo
            $table->string('department', 100); // Área
            $table->string('branch', 100)->default('Sede Principal');
            $table->string('contract_type', 50)->default('indefinido'); // indefinido, fijo, obra_labor, aprendizaje
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->decimal('base_salary', 14, 2);
            $table->boolean('has_transport_allowance')->default(true); // Auxilio de transporte legal (si <= 2 SMMLV)
            $table->string('status', 20)->default('activo'); // activo, inactivo, vacaciones, suspendido
            $table->string('eps', 100)->nullable();
            $table->string('pension_fund', 100)->nullable();
            $table->string('arl', 100)->nullable();
            $table->string('bank_name', 100)->nullable();
            $table->string('account_type', 30)->nullable();
            $table->string('account_number', 50)->nullable();
            $table->timestamps();
        });

        // 2. Periodos de Nómina
        Schema::create('payroll_periods', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150); // Ej: Nómina Mensual Octubre 2026
            $table->date('start_date');
            $table->date('end_date');
            $table->string('period_type', 30)->default('mensual'); // mensual, quincenal
            $table->string('status', 30)->default('DRAFT'); // DRAFT, LIQUIDATED, APPROVED, PAID
            $table->decimal('total_devengado', 14, 2)->default(0);
            $table->decimal('total_deducciones', 14, 2)->default(0);
            $table->decimal('total_neto', 14, 2)->default(0);
            $table->timestamps();
        });

        // 3. Desprendibles / Liquidaciones Individuales (Nómina Electrónica DIAN)
        Schema::create('payroll_slips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_period_id')->constrained('payroll_periods')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('consecutive', 30)->unique()->index(); // Ej: NE-000001
            $table->integer('worked_days')->default(30);
            $table->decimal('base_salary', 14, 2);
            $table->decimal('transport_allowance', 14, 2)->default(0);
            $table->decimal('overtime_amount', 14, 2)->default(0);
            $table->decimal('commissions', 14, 2)->default(0);
            $table->decimal('bonuses', 14, 2)->default(0);
            $table->decimal('total_devengado', 14, 2);
            $table->decimal('health_deduction', 14, 2)->default(0);  // 4% empleado
            $table->decimal('pension_deduction', 14, 2)->default(0); // 4% empleado
            $table->decimal('other_deductions', 14, 2)->default(0);
            $table->decimal('total_deducciones', 14, 2);
            $table->decimal('net_paid', 14, 2);
            $table->string('cune', 120)->nullable()->index(); // SHA-384 reglamentario DIAN
            $table->text('qr_data')->nullable();
            $table->string('dian_status', 30)->default('APROBADO'); // APROBADO, RECHAZADO, PENDIENTE
            $table->timestamps();
        });

        // 4. Novedades de Nómina (Horas Extras, Recargos, Incapacidades)
        Schema::create('payroll_novelties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('payroll_period_id')->nullable()->constrained('payroll_periods')->nullOnDelete();
            $table->string('novelty_type', 50); // HORA_EXTRA_DIURNA, HORA_EXTRA_NOCTURNA, RECARGO_NOCTURNO, COMISION, BONIFICACION, INCAPACIDAD
            $table->decimal('quantity', 8, 2)->default(1);
            $table->decimal('amount', 14, 2);
            $table->string('status', 20)->default('APROBADA'); // PENDIENTE, APROBADA, RECHAZADA
            $table->string('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_novelties');
        Schema::dropIfExists('payroll_slips');
        Schema::dropIfExists('payroll_periods');
        Schema::dropIfExists('employees');
    }
};
