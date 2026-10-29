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
        // 1. Catálogo de Productos
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('code')->index();
            $table->string('barcode')->unique()->index();
            $table->string('name');
            $table->string('category')->index();
            $table->string('brand')->nullable();
            $table->decimal('purchase_price', 14, 2)->default(0);
            $table->decimal('sale_price', 14, 2)->default(0);
            $table->decimal('stock', 18, 4)->default(0);
            $table->decimal('min_stock', 18, 4)->default(0);
            $table->decimal('tax_rate', 5, 4)->default(0.1900); // IVA 19% Colombia
            $table->string('color')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Turnos y Sesiones de Caja
        Schema::create('cash_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('register_name'); // Ej. Caja #001
            $table->string('branch_name');   // Ej. Sede Principal
            $table->decimal('opening_balance', 14, 2);
            $table->decimal('closing_balance_counted', 14, 2)->nullable();
            $table->decimal('closing_balance_expected', 14, 2)->nullable();
            $table->decimal('difference', 14, 2)->nullable();
            $table->string('status', 20)->default('OPEN'); // OPEN, CLOSED
            $table->timestamp('opened_at')->useCurrent();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });

        // 3. Ventas y Facturas POS
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_prefix', 10)->default('SETP');
            $table->string('invoice_number', 30)->unique()->index();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cash_shift_id')->constrained()->cascadeOnDelete();
            $table->string('customer_name')->default('Consumidor final');
            $table->string('customer_tax_id', 20)->default('222222222222');
            $table->string('customer_phone', 30)->nullable();
            $table->string('payment_method', 30); // efectivo, tarjeta, transferencia, otro
            $table->decimal('subtotal', 14, 2);
            $table->decimal('discount', 14, 2)->default(0);
            $table->decimal('tax_base', 14, 2);
            $table->decimal('tax_amount', 14, 2);
            $table->decimal('total', 14, 2);
            $table->decimal('cash_received', 14, 2)->nullable();
            $table->decimal('cash_change', 14, 2)->nullable();
            $table->string('cufe', 120)->nullable()->index();
            $table->text('qr_data')->nullable();
            $table->string('status', 20)->default('COMPLETED'); // COMPLETED, CANCELLED
            $table->timestamps();
        });

        // 4. Detalle de Ítems de Venta
        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity', 18, 4);
            $table->decimal('unit_price', 14, 2);
            $table->decimal('discount', 14, 2)->default(0);
            $table->decimal('tax_rate', 5, 4)->default(0.1900);
            $table->decimal('tax_amount', 14, 2);
            $table->decimal('total', 14, 2);
            $table->timestamps();
        });

        // 5. Kárdex Inmutable de Movimientos de Inventario
        Schema::create('kardex_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('movement_type', 30); // SALE, PURCHASE, ADJUSTMENT_IN, ADJUSTMENT_OUT
            $table->decimal('previous_stock', 18, 4);
            $table->decimal('quantity', 18, 4);
            $table->decimal('new_stock', 18, 4);
            $table->decimal('unit_cost', 14, 2);
            $table->decimal('total_cost', 14, 2);
            $table->string('reference_type', 30)->nullable(); // Sale, Purchase, Adjustment
            $table->string('reference_id', 50)->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kardex_movements');
        Schema::dropIfExists('sale_items');
        Schema::dropIfExists('sales');
        Schema::dropIfExists('cash_shifts');
        Schema::dropIfExists('products');
    }
};
