<?php

namespace App\Http\Resources\POS;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'code' => $this->code,
            'barcode' => $this->barcode,
            'name' => $this->name,
            'category' => $this->category,
            'brand' => $this->brand,
            'purchasePrice' => (float) $this->purchase_price,
            'salePrice' => (float) $this->sale_price,
            'stock' => (float) $this->stock,
            'minStock' => (float) $this->min_stock,
            'taxRate' => (float) $this->tax_rate,
            'status' => $this->is_active ? 'activo' : 'inactivo',
            'color' => $this->color ?? 'oklch(0.62 0.19 27)',
        ];
    }
}
