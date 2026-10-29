<?php

namespace App\DTOs\POS;

readonly class SaleData
{
    /**
     * @param array<SaleItemData> $items
     */
    public function __construct(
        public int $userId,
        public int $cashShiftId,
        public string $customerName,
        public string $customerTaxId,
        public ?string $customerPhone,
        public string $paymentMethod,
        public ?float $cashReceived,
        public array $items,
    ) {}

    public static function fromRequest(array $validated, int $userId): self
    {
        $items = array_map(
            fn (array $item) => SaleItemData::fromArray($item),
            $validated['items']
        );

        return new self(
            userId: $userId,
            cashShiftId: (int) $validated['cash_shift_id'],
            customerName: $validated['customer_name'] ?? 'Consumidor final',
            customerTaxId: $validated['customer_tax_id'] ?? '222222222222',
            customerPhone: $validated['customer_phone'] ?? null,
            paymentMethod: $validated['payment_method'],
            cashReceived: isset($validated['cash_received']) ? (float) $validated['cash_received'] : null,
            items: $items,
        );
    }
}
