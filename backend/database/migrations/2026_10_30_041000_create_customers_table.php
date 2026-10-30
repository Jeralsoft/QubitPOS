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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('document_type', 10)->default('CC');
            $table->string('document_number', 30)->unique()->index();
            $table->string('dv', 2)->nullable();
            $table->string('first_name', 100)->nullable();
            $table->string('last_name', 100)->nullable();
            $table->string('trade_name', 150)->nullable();
            $table->string('full_name', 200)->index();
            $table->string('email', 100)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('address', 255)->nullable();
            $table->string('city', 100)->default('Medellín');
            $table->string('department', 100)->default('Antioquia');
            $table->string('customer_type', 30)->default('persona_natural'); // persona_natural, persona_juridica
            $table->string('fiscal_regime', 100)->default('Régimen Ordinario');
            $table->decimal('credit_limit', 14, 2)->default(0.00);
            $table->decimal('current_balance', 14, 2)->default(0.00);
            $table->integer('credit_days')->default(0);
            $table->string('status', 20)->default('activo'); // activo, inactivo, suspendido
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
