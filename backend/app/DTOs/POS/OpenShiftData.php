<?php

namespace App\DTOs\POS;

readonly class OpenShiftData
{
    public function __construct(
        public int $userId,
        public string $registerName,
        public string $branchName,
        public float $openingBalance,
    ) {}

    public static function fromRequest(array $validated, int $userId): self
    {
        return new self(
            userId: $userId,
            registerName: $validated['register_name'] ?? 'Caja #001',
            branchName: $validated['branch_name'] ?? 'Sede Principal',
            openingBalance: (float) $validated['opening_balance'],
        );
    }
}
