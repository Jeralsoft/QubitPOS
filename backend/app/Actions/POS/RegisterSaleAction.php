<?php

namespace App\Actions\POS;

use App\DTOs\POS\SaleData;
use App\Models\CashShift;
use App\Models\KardexMovement;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RegisterSaleAction
{
    /**
     * Registra una venta POS atómica con bloqueo pesimista en inventario y caja.
     *
     * @throws ValidationException
     */
    public function execute(SaleData $data): Sale
    {
        return DB::transaction(function () use ($data) {
            // 1. Validar y bloquear el turno de caja abierto
            $shift = CashShift::where('id', $data->cashShiftId)
                ->lockForUpdate()
                ->first();

            if (! $shift || $shift->status !== 'OPEN') {
                throw ValidationException::withMessages([
                    'cash_shift_id' => ['El turno de caja especificado está cerrado o no existe.'],
                ]);
            }

            // 2. Calcular consecutivos e inicializar totales
            $consecutive = (Sale::max('id') ?? 0) + 1;
            $invoiceNumber = 'SETP-' . str_pad((string) $consecutive, 6, '0', STR_PAD_LEFT);

            $subtotal = 0.0;
            $discountTotal = 0.0;
            $taxAmountTotal = 0.0;

            $itemsToCreate = [];
            $kardexToCreate = [];

            // 3. Procesar ítems con bloqueo pesimista en PostgreSQL
            foreach ($data->items as $itemData) {
                $product = Product::where('id', $itemData->productId)
                    ->lockForUpdate()
                    ->firstOrFail();

                // Verificar existencias suficientes
                if ($product->stock < $itemData->quantity) {
                    throw ValidationException::withMessages([
                        'items' => ["Existencias insuficientes para '{$product->name}'. Disponible: {$product->stock}, Solicitado: {$itemData->quantity}"],
                    ]);
                }

                $lineSubtotal = round($itemData->unitPrice * $itemData->quantity, 2);
                $lineDiscount = round($itemData->discount, 2);
                $netLine = max(0, $lineSubtotal - $lineDiscount);

                // Desglose de IVA Colombia (19% o configurable)
                $taxRate = $itemData->taxRate;
                $lineTax = round($netLine * $taxRate, 2);
                $lineTotal = round($netLine + $lineTax, 2);

                $subtotal += $lineSubtotal;
                $discountTotal += $lineDiscount;
                $taxAmountTotal += $lineTax;

                $itemsToCreate[] = [
                    'product_id' => $product->id,
                    'quantity' => $itemData->quantity,
                    'unit_price' => $itemData->unitPrice,
                    'discount' => $lineDiscount,
                    'tax_rate' => $taxRate,
                    'tax_amount' => $lineTax,
                    'total' => $lineTotal,
                ];

                // Descontar existencias y preparar movimiento Kárdex inmutable
                $previousStock = (float) $product->stock;
                $newStock = round($previousStock - $itemData->quantity, 4);
                $product->update(['stock' => $newStock]);

                $kardexToCreate[] = [
                    'product_id' => $product->id,
                    'movement_type' => 'SALE',
                    'previous_stock' => $previousStock,
                    'quantity' => $itemData->quantity,
                    'new_stock' => $newStock,
                    'unit_cost' => (float) $product->purchase_price,
                    'total_cost' => round($itemData->quantity * (float) $product->purchase_price, 2),
                    'reference_type' => 'Sale',
                    'reference_id' => $invoiceNumber,
                    'user_id' => $data->userId,
                    'notes' => "Venta mostrador POS {$invoiceNumber}",
                ];
            }

            $taxBase = round($subtotal - $discountTotal, 2);
            $total = round($taxBase + $taxAmountTotal, 2);

            // Calcular cambio si fue pagado en efectivo
            $cashChange = null;
            if ($data->paymentMethod === 'efectivo' && $data->cashReceived !== null) {
                $cashChange = max(0, round($data->cashReceived - $total, 2));
            }

            // 4. Generar hash criptográfico CUFE (SHA-384) reglamentario DIAN
            $issueDate = date('Y-m-d');
            $issueTime = date('H:i:s') . '-05:00';
            $cufeRaw = "{$invoiceNumber}{$issueDate}{$issueTime}"
                . number_format($taxBase, 2, '.', '')
                . '01' . number_format($taxAmountTotal, 2, '.', '')
                . '040.00030.00'
                . number_format($total, 2, '.', '')
                . '901456789'
                . $data->customerTaxId
                . 'claveTecnicaDian123'
                . '1';

            $cufe = hash('sha384', $cufeRaw);
            $qrData = "https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey={$cufe}";

            // 5. Guardar cabecera de venta
            $sale = Sale::create([
                'invoice_prefix' => 'SETP',
                'invoice_number' => $invoiceNumber,
                'user_id' => $data->userId,
                'cash_shift_id' => $data->cashShiftId,
                'customer_name' => $data->customerName,
                'customer_tax_id' => $data->customerTaxId,
                'customer_phone' => $data->customerPhone,
                'payment_method' => $data->paymentMethod,
                'subtotal' => $subtotal,
                'discount' => $discountTotal,
                'tax_base' => $taxBase,
                'tax_amount' => $taxAmountTotal,
                'total' => $total,
                'cash_received' => $data->cashReceived,
                'cash_change' => $cashChange,
                'cufe' => $cufe,
                'qr_data' => $qrData,
                'status' => 'COMPLETED',
            ]);

            // 6. Guardar líneas y movimientos Kárdex
            foreach ($itemsToCreate as $item) {
                $item['sale_id'] = $sale->id;
                SaleItem::create($item);
            }

            foreach ($kardexToCreate as $kardex) {
                KardexMovement::create($kardex);
            }

            return $sale->load(['items.product', 'user', 'cashShift']);
        });
    }
}
