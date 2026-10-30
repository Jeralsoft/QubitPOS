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
        // 1. Datos y Perfil Fiscal de la Empresa
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            $table->string('trade_name', 150)->default('QUBIT POS');
            $table->string('legal_name', 200)->default('Qubit Soluciones POS S.A.S.');
            $table->string('nit', 30)->default('901.456.789-3');
            $table->string('dv', 2)->default('3');
            $table->string('phone', 50)->default('+57 604 444 8899');
            $table->string('email', 100)->default('contacto@qubitpos.co');
            $table->string('address', 255)->default('Calle 30 # 45-12, Local 3');
            $table->string('city', 100)->default('Medellín');
            $table->string('department', 100)->default('Antioquia');
            $table->string('website', 150)->default('https://www.qubitpos.co');
            $table->string('currency', 10)->default('COP');
            $table->string('timezone', 50)->default('America/Bogota');
            $table->timestamps();
        });

        // 2. Parámetros Técnicos DIAN Facturación Electrónica UBL 2.1
        Schema::create('dian_settings', function (Blueprint $table) {
            $table->id();
            $table->string('environment', 20)->default('Pruebas'); // Pruebas, Producción
            $table->string('company_type', 50)->default('Persona jurídica');
            $table->string('fiscal_responsibility', 100)->default('O-13 - Gran contribuyente');
            $table->string('software_id', 100)->default('SW-QUBITPOS-001');
            $table->string('software_pin', 20)->default('12345');
            $table->string('test_set_id', 150)->nullable();
            $table->text('technical_key')->nullable();
            $table->string('certificate_path', 255)->nullable();
            $table->string('certificate_password', 150)->nullable();
            $table->boolean('is_connected')->default(true);
            $table->boolean('is_auto_send')->default(true);
            $table->boolean('send_email_to_customer')->default(true);
            $table->boolean('contingency_mode')->default(false);
            $table->timestamps();
        });

        // 3. Sucursales & Sedes
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('name', 150);
            $table->string('address', 255);
            $table->string('phone', 50);
            $table->string('city', 100)->default('Medellín');
            $table->string('department', 100)->default('Antioquia');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 4. Cajas Físicas y Terminales POS
        Schema::create('cash_registers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('terminal_code', 50)->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 5. Resoluciones y Consecutivos DIAN
        Schema::create('dian_resolutions', function (Blueprint $table) {
            $table->id();
            $table->string('resolution_number', 50);
            $table->string('prefix', 10)->index();
            $table->unsignedBigInteger('range_from')->default(1);
            $table->unsignedBigInteger('range_to')->default(50000);
            $table->unsignedBigInteger('current_number')->default(1);
            $table->date('issued_at');
            $table->date('expires_at');
            $table->text('technical_key')->nullable();
            $table->string('status', 20)->default('Vigente'); // Vigente, Por vencer, Vencida
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 6. Roles y Gobernanza de Permisos
        Schema::create('system_roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->string('description', 255)->nullable();
            $table->string('tone', 20)->default('primary');
            $table->timestamps();
        });

        Schema::create('system_permissions', function (Blueprint $table) {
            $table->id();
            $table->string('code', 100)->unique(); // pos.sales.create, reports.view, etc.
            $table->string('name', 150);
            $table->string('module', 50);
            $table->timestamps();
        });

        Schema::create('role_permission', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained('system_roles')->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained('system_permissions')->cascadeOnDelete();
            $table->primary(['role_id', 'permission_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_permission');
        Schema::dropIfExists('system_permissions');
        Schema::dropIfExists('system_roles');
        Schema::dropIfExists('dian_resolutions');
        Schema::dropIfExists('cash_registers');
        Schema::dropIfExists('branches');
        Schema::dropIfExists('dian_settings');
        Schema::dropIfExists('company_settings');
    }
};
