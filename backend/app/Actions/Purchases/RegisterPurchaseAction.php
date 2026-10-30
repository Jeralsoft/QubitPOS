<?php

namespace App\Actions\Purchases;

use App\Models\AccountPayable;
use App\Models\KardexMovement;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Supplier;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RegisterPurchaseAction
{
    /**
     * Registra una compra a proveedor actualizando inventario, recalculando
     * el costo promedio ponderado y generando el movimiento inmutable en Kárdex.
     */
    public function execute(array $data, int $userId): Purchase
    {
        return DB::transaction(function () use ($data, $userId) {
            $supplier = Supplier::findOrFail($data['supplier_id']);

            $subtotal = 0.0;
            $taxTotal = 0.0;
            $itemsToCreate = [];
            $kardexToCreate = [];

            foreach ($data['items'] as $itemData) {
                $product = Product::where('id', $itemData['product_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                $quantity = (float) $itemData['quantity'];
                $unitCost = (float) $itemData['unit_cost'];
                $taxRate = isset($itemData['tax_rate']) ? (float) $itemData['tax_rate'] : 0.19;

                $lineSubtotal = round($quantity * $unitCost, 2);
                $lineTax = round($lineSubtotal * $taxRate, 2);
                $lineTotal = round($lineSubtotal + $lineTax, 2);

                $subtotal += $lineSubtotal;
                $taxTotal += $lineTax;

                $itemsToCreate[] = [
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_cost' => $unitCost,
                    'tax_rate' => $taxRate,
                    'tax_amount' => $lineTax,
                    'total' => $lineTotal,
                ];

                // Costo Promedio Ponderado:
                // Nuevo Costo = ((Stock Previo * Costo Previo) + (Cantidad Ingresada * Costo Unitario)) / Nuevo Stock
                $prevStock = (float) $product->stock;
                $prevCost = (float) $product->purchase_price;
                $newStock = round($prevStock + $quantity, 4);

                $newWeightedCost = ($newStock > 0)
                    ? round((($prevStock * $prevCost) + ($quantity * $unitCost)) / $newStock, 2)
                    : $unitCost;

                $product->update([
                    'stock' => $newStock,
                    'purchase_price' => $newWeightedCost,
                ]);

                $kardexToCreate[] = [
                    'product_id' => $product->id,
                    'movement_type' => 'PURCHASE',
                    'previous_stock' => $prevStock,
                    'quantity' => $quantity,
                    'new_stock' => $newStock,
                    'unit_cost' => $unitCost,
                    'total_cost' => $lineSubtotal,
                    'reference_type' => 'Purchase',
                    'reference_id' => $data['invoice_number'],
                    'user_id' => $userId,
                    'notes' => "Ingreso por compra Fac. {$data['invoice_number']} - {$supplier->name}",
                ];
            }

            $total = round($subtotal + $taxTotal, 2);
            $paymentMethod = $data['payment_method'] ?? 'contado';
            $paymentStatus = ($paymentMethod === 'credito') ? 'PENDING' : 'PAID';

            $purchase = Purchase::create([
                'invoice_number' => $data['invoice_number'],
                'supplier_id' => $supplier->id,
                'user_id' => $userId,
                'purchase_date' => $data['purchase_date'] ?? now()->toDateString(),
                'due_date' => $data['due_date'] ?? ($paymentMethod === 'credito' ? now()->addDays($supplier->credit_days)->toDateString() : null),
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentStatus,
                'subtotal' => $subtotal,
                'tax_amount' => $taxTotal,
                'total' => $total,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($itemsToCreate as $item) {
                $item['purchase_id'] = $purchase->id;
                PurchaseItem::create($item);
            }

            foreach ($kardexToCreate as $kardex) {
                KardexMovement::create($kardex);
            }

            // Si la compra es a crédito, registrar automáticamente en Cuentas por Pagar (CxP)
            if ($paymentMethod === 'credito') {
                AccountPayable::create([
                    'purchase_id' => $purchase->id,
                    'supplier_id' => $supplier->id,
                    'initial_amount' => $total,
                    'current_balance' => $total,
                    'due_date' => $purchase->due_date ?? now()->addDays(30)->toDateString(),
                    'status' => 'PENDING',
                    'notes' => "Cuenta por pagar originada por compra Fac. {$data['invoice_number']}",
                ]);
            }

            // Generar Asiento Contable Automático de Compra (Fase 5)
            app(\App\Actions\Accounting\GenerateAccountingEntryAction::class)->forPurchase($purchase);

            return $purchase->load(['supplier', 'items.product', 'accountPayable']);
        });
    }
}
