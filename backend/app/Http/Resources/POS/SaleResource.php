<?php

namespace App\Http\Resources\POS;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'invoicePrefix' => $this->invoice_prefix,
            'invoiceNumber' => $this->invoice_number,
            'customer' => [
                'name' => $this->customer_name,
                'taxId' => $this->customer_tax_id,
                'phone' => $this->customer_phone,
            ],
            'paymentMethod' => $this->payment_method,
            'totals' => [
                'subtotal' => (float) $this->subtotal,
                'discount' => (float) $this->discount,
                'taxBase' => (float) $this->tax_base,
                'taxAmount' => (float) $this->tax_amount,
                'total' => (float) $this->total,
                'cashReceived' => (float) $this->cash_received,
                'cashChange' => (float) $this->cash_change,
            ],
            'cufe' => $this->cufe,
            'qrData' => $this->qr_data,
            'status' => $this->status,
            'createdAt' => $this->created_at?->toIso8601String(),
            'items' => $this->whenLoaded('items', function () {
                return $this->items->map(function ($item) {
                    return [
                        'id' => (string) $item->id,
                        'productId' => (string) $item->product_id,
                        'productName' => $item->product?->name,
                        'quantity' => (float) $item->quantity,
                        'unitPrice' => (float) $item->unit_price,
                        'discount' => (float) $item->discount,
                        'taxRate' => (float) $item->tax_rate,
                        'total' => (float) $item->total,
                    ];
                });
            }),
        ];
    }
}
