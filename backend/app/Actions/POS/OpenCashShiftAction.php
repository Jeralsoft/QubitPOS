<?php

namespace App\Actions\POS;

use App\DTOs\POS\OpenShiftData;
use App\Models\CashShift;
use Illuminate\Validation\ValidationException;

class OpenCashShiftAction
{
    /**
     * Abre un nuevo turno de caja verificando que no exista uno abierto para el mismo usuario y caja.
     *
     * @throws ValidationException
     */
    public function execute(OpenShiftData $data): CashShift
    {
        $existing = CashShift::where('user_id', $data->userId)
            ->where('register_name', $data->registerName)
            ->where('status', 'OPEN')
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'register_name' => ["Ya tienes un turno abierto en la '{$data->registerName}'."],
            ]);
        }

        return CashShift::create([
            'user_id' => $data->userId,
            'register_name' => $data->registerName,
            'branch_name' => $data->branchName,
            'opening_balance' => $data->openingBalance,
            'status' => 'OPEN',
            'opened_at' => now(),
        ]);
    }
}
