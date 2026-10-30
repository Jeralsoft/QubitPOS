<?php

namespace App\Http\Controllers\Api\Pricing;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PriceController extends Controller
{
    /**
     * Definición de Listas de Precios y Reglas de Margen
     */
    public function lists(): JsonResponse
    {
        $tiers = [
            [
                'id' => 'general',
                'name' => 'Precio General (Minorista)',
                'code' => 'MIN',
                'discount_pct' => 0,
                'description' => 'Precio base al público en punto de venta.',
                'is_default' => true,
            ],
            [
                'id' => 'mayorista',
                'name' => 'Lista Mayorista',
                'code' => 'MAY',
                'discount_pct' => 10,
                'description' => 'Descuento del 10% para compras por volumen o clientes mayoristas.',
                'is_default' => false,
            ],
            [
                'id' => 'distribuidor',
                'name' => 'Lista Distribuidor',
                'code' => 'DIS',
                'discount_pct' => 18,
                'description' => 'Descuento preferencial del 18% para canales de distribución.',
                'is_default' => false,
            ],
            [
                'id' => 'corporativo',
                'name' => 'Convenio Corporativo / VIP',
                'code' => 'CORP',
                'discount_pct' => 12,
                'description' => 'Tarifa para empresas aliadas e instituciones.',
                'is_default' => false,
            ],
        ];

        return response()->json([
            'data' => $tiers,
        ]);
    }

    /**
     * Verificador rápido de precios para terminal / escáner.
     */
    public function check(string $code): JsonResponse
    {
        $clean = trim($code);

        $product = Product::where('is_active', true)
            ->where(function ($q) use ($clean) {
                $q->where('barcode', $clean)
                    ->orWhere('code', $clean)
                    ->orWhere('id', $clean);
            })
            ->first();

        if (! $product) {
            return response()->json([
                'message' => "Producto con código '{$code}' no encontrado o inactivo.",
            ], 404);
        }

        $salePrice = (float) $product->sale_price;
        $purchasePrice = (float) $product->purchase_price;
        $taxRate = (float) $product->tax_rate;

        $marginAmount = $salePrice - $purchasePrice;
        $marginPct = $salePrice > 0 ? round(($marginAmount / $salePrice) * 100, 2) : 0;
        $taxAmount = round($salePrice * $taxRate, 2);
        $priceWithTax = round($salePrice + $taxAmount, 2);

        $tierPrices = [
            'minorista' => [
                'name' => 'Precio General',
                'price' => $salePrice,
                'tax' => $taxAmount,
                'total' => $priceWithTax,
            ],
            'mayorista' => [
                'name' => 'Mayorista (-10%)',
                'price' => round($salePrice * 0.90, 2),
                'tax' => round(($salePrice * 0.90) * $taxRate, 2),
                'total' => round(($salePrice * 0.90) * (1 + $taxRate), 2),
            ],
            'distribuidor' => [
                'name' => 'Distribuidor (-18%)',
                'price' => round($salePrice * 0.82, 2),
                'tax' => round(($salePrice * 0.82) * $taxRate, 2),
                'total' => round(($salePrice * 0.82) * (1 + $taxRate), 2),
            ],
        ];

        return response()->json([
            'data' => [
                'product' => [
                    'id' => $product->id,
                    'code' => $product->code,
                    'barcode' => $product->barcode,
                    'name' => $product->name,
                    'category' => $product->category,
                    'stock' => (float) $product->stock,
                    'purchase_price' => $purchasePrice,
                    'sale_price' => $salePrice,
                    'tax_rate' => $taxRate,
                    'tax_pct' => ($taxRate * 100).'%',
                    'margin_amount' => round($marginAmount, 2),
                    'margin_pct' => $marginPct,
                    'price_with_tax' => $priceWithTax,
                ],
                'tiers' => $tierPrices,
            ],
        ]);
    }

    /**
     * Ajuste masivo de precios por categoría o porcentaje.
     */
    public function batchUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['nullable', 'string'],
            'adjustment_type' => ['required', 'in:percentage,fixed'],
            'operation' => ['required', 'in:increase,decrease'],
            'value' => ['required', 'numeric', 'min:0.01'],
        ]);

        return DB::transaction(function () use ($validated) {
            $query = Product::query();

            if (! empty($validated['category']) && $validated['category'] !== 'all') {
                $query->where('category', $validated['category']);
            }

            $products = $query->lockForUpdate()->get();
            $updatedCount = 0;

            foreach ($products as $product) {
                $currentPrice = (float) $product->sale_price;

                if ($validated['adjustment_type'] === 'percentage') {
                    $multiplier = $validated['operation'] === 'increase'
                        ? (1 + ($validated['value'] / 100))
                        : (1 - ($validated['value'] / 100));
                    $newPrice = round($currentPrice * $multiplier, 2);
                } else {
                    $newPrice = $validated['operation'] === 'increase'
                        ? round($currentPrice + $validated['value'], 2)
                        : round(max(0, $currentPrice - $validated['value']), 2);
                }

                $product->sale_price = $newPrice;
                $product->save();
                $updatedCount++;
            }

            return response()->json([
                'message' => "Se actualizaron los precios de {$updatedCount} productos correctamente.",
                'updated_count' => $updatedCount,
            ]);
        });
    }
}
