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
        // 1. Plan Único de Cuentas (PUC - Cuentas Contables NIIF)
        Schema::create('accounting_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique()->index(); // Ej: 110505, 413501, 240801
            $table->string('name', 255);
            $table->string('nature', 1); // 'D' Débito, 'C' Crédito
            $table->string('type', 30);  // ACTIVO, PASIVO, PATRIMONIO, INGRESO, GASTO, COSTO
            $table->integer('level')->default(6); // 1=Clase, 2=Grupo, 4=Cuenta, 6=Subcuenta, 8=Auxiliar
            $table->boolean('is_movement')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Comprobantes Contables Inmutables (Asientos de Diario)
        Schema::create('accounting_entries', function (Blueprint $table) {
            $table->id();
            $table->string('consecutive', 30)->unique()->index(); // Ej: CC-000001
            $table->string('entry_type', 30); // VENTA, COMPRA, COBRO, PAGO_PROVEEDOR, ARQUEO_CAJA, AJUSTE
            $table->string('reference_type', 50)->nullable(); // Sale, Purchase, ReceivablePayment, CashShift
            $table->string('reference_id', 50)->nullable();   // SETP-000001, FAC-9842, REC-001
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->date('entry_date');
            $table->string('concept');
            $table->decimal('total_debit', 14, 2);
            $table->decimal('total_credit', 14, 2);
            $table->boolean('is_balanced')->default(true); // Debe cumplir Sum(Debe) == Sum(Haber)
            $table->string('status', 20)->default('POSTED'); // POSTED, ANNULLED
            $table->timestamps();
        });

        // 3. Líneas de Partida Doble del Comprobante
        Schema::create('accounting_entry_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('accounting_entry_id')->constrained('accounting_entries')->cascadeOnDelete();
            $table->foreignId('accounting_account_id')->constrained('accounting_accounts')->cascadeOnDelete();
            $table->string('third_party_name')->nullable();
            $table->string('third_party_tax_id', 30)->nullable();
            $table->decimal('debit', 14, 2)->default(0);
            $table->decimal('credit', 14, 2)->default(0);
            $table->string('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounting_entry_lines');
        Schema::dropIfExists('accounting_entries');
        Schema::dropIfExists('accounting_accounts');
    }
};
