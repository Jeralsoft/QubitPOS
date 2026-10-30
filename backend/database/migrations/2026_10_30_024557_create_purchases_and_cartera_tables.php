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
        // 1. Proveedores (Suppliers)
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('tax_id', 30)->unique()->index(); // NIT / RUT
            $table->string('phone', 50)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('contact_name', 100)->nullable();
            $table->string('status', 20)->default('activo'); // activo, inactivo, moroso, bloqueado
            $table->integer('credit_days')->default(30);
            $table->decimal('credit_limit', 14, 2)->default(0);
            $table->timestamps();
        });

        // 2. Facturas de Compra (Purchases)
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 50)->index(); // No. Factura Proveedor
            $table->foreignId('supplier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('purchase_date');
            $table->date('due_date')->nullable();
            $table->string('payment_method', 30)->default('contado'); // contado, credito
            $table->string('payment_status', 30)->default('PAID');    // PAID, PENDING, PARTIAL
            $table->decimal('subtotal', 14, 2);
            $table->decimal('tax_amount', 14, 2)->default(0);
            $table->decimal('total', 14, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 3. Detalle de Ítems de Compra (Purchase Items)
        Schema::create('purchase_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity', 18, 4);
            $table->decimal('unit_cost', 14, 2);
            $table->decimal('tax_rate', 5, 4)->default(0.1900);
            $table->decimal('tax_amount', 14, 2)->default(0);
            $table->decimal('total', 14, 2);
            $table->timestamps();
        });

        // 4. Cuentas por Cobrar (Accounts Receivable - Cartera de Clientes)
        Schema::create('accounts_receivable', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_tax_id', 30)->index();
            $table->string('customer_phone', 50)->nullable();
            $table->decimal('initial_amount', 14, 2);
            $table->decimal('current_balance', 14, 2);
            $table->date('due_date');
            $table->string('status', 20)->default('PENDING'); // PENDING, PARTIAL, PAID
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 5. Pagos y Abonos a Cartera (Receivable Payments)
        Schema::create('receivable_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_receivable_id')->constrained('accounts_receivable')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cash_shift_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 14, 2);
            $table->string('payment_method', 30); // efectivo, tarjeta, transferencia, otro
            $table->string('reference_code', 50)->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('payment_date')->useCurrent();
            $table->timestamps();
        });

        // 6. Cuentas por Pagar (Accounts Payable - CxP a Proveedores)
        Schema::create('accounts_payable', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained()->cascadeOnDelete();
            $table->foreignId('supplier_id')->constrained()->cascadeOnDelete();
            $table->decimal('initial_amount', 14, 2);
            $table->decimal('current_balance', 14, 2);
            $table->date('due_date');
            $table->string('status', 20)->default('PENDING'); // PENDING, PARTIAL, PAID
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 7. Pagos y Abonos a Cuentas por Pagar (Payable Payments)
        Schema::create('payable_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_payable_id')->constrained('accounts_payable')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 14, 2);
            $table->string('payment_method', 30);
            $table->string('reference_code', 50)->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('payment_date')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payable_payments');
        Schema::dropIfExists('accounts_payable');
        Schema::dropIfExists('receivable_payments');
        Schema::dropIfExists('accounts_receivable');
        Schema::dropIfExists('purchase_items');
        Schema::dropIfExists('purchases');
        Schema::dropIfExists('suppliers');
    }
};
