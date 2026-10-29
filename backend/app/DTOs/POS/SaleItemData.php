<?php

namespace App\DTOs\POS;

readonly class SaleItemData
{
    public function __construct(
        public int $productId,
        public float $quantity,
        public float $unitPrice,
        public float $discount = 0.0,
        public float $taxRate = 0.19,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            productId: (int) $data['product_id'],
            quantity: (float) $data['quantity'],
            unitPrice: (float) $data['unit_price'],
            discount: (float) ($data['discount'] ?? 0),
            taxRate: (float) ($data['tax_rate'] ?? 0.19),
        );
    }
}
