<?php

namespace App\Http\Resources\POS;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CashShiftResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'register' => $this->register_name,
            'branch' => $this->branch_name,
            'user' => $this->user?->name ?? 'Cajero',
            'openingBalance' => (float) $this->opening_balance,
            'closingBalanceCounted' => $this->closing_balance_counted !== null ? (float) $this->closing_balance_counted : null,
            'difference' => $this->difference !== null ? (float) $this->difference : null,
            'status' => $this->status,
            'openedAt' => $this->opened_at?->format('Y-m-d H:i'),
            'closedAt' => $this->closed_at?->format('Y-m-d H:i'),
        ];
    }
}
